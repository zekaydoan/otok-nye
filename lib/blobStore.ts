import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import type { OilRecord, Shop, StickerOrder, StickerToken, Vehicle } from "./types";

// Netlify Blobs tabanlı basit veri katmanı.
// Store'lar: shops, shops_by_email, vehicles, vehicles_by_plate, oilrecords

const shopsStore = () => getStore("shops");
const shopsByEmailStore = () => getStore("shops_by_email");
const vehiclesStore = () => getStore("vehicles");
const vehiclesByPlateStore = () => getStore("vehicles_by_plate");
const oilRecordsStore = () => getStore("oilrecords");
const recordPhotosStore = () => getStore("record_photos");
const reminderLogStore = () => getStore("reminder_log");
// Bir bayinin "ilgilendiği" (oluşturduğu veya bakım kaydı eklediği) araçların indeksi.
// Anahtar: `${shopId}/${vehicleId}`, değer: son etkileşim zamanı (ISO). Bu sayede
// "Araçlarım" listesi tüm araçları taramak yerine doğrudan bayiye özel anahtarları okur.
const shopVehicleLinksStore = () => getStore("shop_vehicle_links");
// Etiket mağazası: siparişler, bayi->sipariş indeksi, iyzico token->sipariş
// eşlemesi (ödeme sonrası callback yalnızca token ile döner) ve admin tarafından
// değiştirilebilen ayarlar (ör. birim fiyat).
const stickerOrdersStore = () => getStore("sticker_orders");
const stickerOrdersByShopStore = () => getStore("sticker_orders_by_shop");
const stickerOrderTokensStore = () => getStore("sticker_order_tokens");
// Fiziksel etiket başına benzersiz QR token'ları (bkz. StickerToken tip tanımı) ve
// bir siparişe ait tüm token'ları listeleyebilmek için sipariş->token indeksi.
const stickerTokensStore = () => getStore("sticker_tokens");
const stickerTokensByOrderStore = () => getStore("sticker_tokens_by_order");
const settingsStore = () => getStore("settings");
// Şifre sıfırlama: token -> { shopId, expiresAt }. Token tek kullanımlıktır,
// kullanıldıktan hemen sonra veya süresi dolduğunda silinir.
const passwordResetTokensStore = () => getStore("password_reset_tokens");

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9ÇĞİÖŞÜ]/g, "");
}

// ---------- Shops ----------
export async function createShop(shop: Shop): Promise<void> {
  await shopsStore().setJSON(shop.id, shop);
  await shopsByEmailStore().set(shop.email.toLowerCase(), shop.id);
}

export async function getShopById(id: string): Promise<Shop | null> {
  return (await shopsStore().get(id, { type: "json" })) as Shop | null;
}

export async function getShopByEmail(email: string): Promise<Shop | null> {
  const id = await shopsByEmailStore().get(email.toLowerCase(), { type: "text" });
  if (!id) return null;
  return getShopById(id);
}

export async function updateShop(shop: Shop): Promise<void> {
  await shopsStore().setJSON(shop.id, shop);
}

// Netlify Blobs eşzamanlılık kontrolü sunmaz ("last write wins") — bir bayi hesabını
// aynı anda iki istek "oku - değiştir - yaz" yaparsa (ör. iki sekmede art arda favori
// yağ ekleme), biri sessizce kaybolabilir. Bu, ETag tabanlı bir "onlyIfMatch" koşullu
// yazımla iyimser kilitleme (optimistic locking) uygular: yazım sırasında kayıt
// değişmişse yeniden okuyup tekrar dener.
export async function updateShopFields(
  shopId: string,
  mutate: (shop: Shop) => Shop
): Promise<Shop> {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = await shopsStore().getWithMetadata(shopId, {
      type: "json",
      consistency: "strong",
    });
    if (!result || !result.data) throw new Error("Bayi bulunamadı.");
    const updated = mutate(result.data as Shop);
    const writeResult = await shopsStore().set(shopId, JSON.stringify(updated), {
      onlyIfMatch: result.etag,
    });
    if (writeResult.modified) return updated;
    // Bu aralıkta başka bir istek aynı kaydı değiştirdi (ETag uyuşmadı) — tekrar dene.
  }
  throw new Error("Kayıt eşzamanlı olarak değiştirildi, lütfen tekrar deneyin.");
}

// ---------- Şifre sıfırlama ----------
interface PasswordResetRecord {
  shopId: string;
  expiresAt: string; // ISO
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 saat

export async function createPasswordResetToken(shopId: string): Promise<string> {
  const token = randomUUID();
  const record: PasswordResetRecord = {
    shopId,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString(),
  };
  await passwordResetTokensStore().setJSON(token, record);
  return token;
}

// Süresi dolmuş veya geçersiz bir token için null döner; token bulunup süresi
// dolmuşsa depodan da temizler.
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const record = (await passwordResetTokensStore().get(token, {
    type: "json",
    consistency: "strong",
  })) as PasswordResetRecord | null;
  if (!record) return null;
  await passwordResetTokensStore().delete(token); // tek kullanımlık — hemen sil
  if (new Date(record.expiresAt).getTime() < Date.now()) return null;
  return record.shopId;
}

// ---------- Vehicles ----------
export async function createVehicle(vehicle: Vehicle): Promise<void> {
  await vehiclesStore().setJSON(vehicle.id, vehicle);
  await vehiclesByPlateStore().set(vehicle.plate, vehicle.id);
  await linkShopVehicle(vehicle.createdByShopId, vehicle.id);
}

// Netlify Blobs varsayılan olarak nihai (eventual) tutarlılık kullanır — bir yazım
// tüm edge lokasyonlarına yayılana kadar 60 saniyeye varan bir gecikme olabilir.
// Bunun "az önce eklediğim kaydı görmüyorum" gibi bir kullanıcı deneyimi sorununa
// yol açabileceği kritik noktalarda (ör. plaka benzersizlik kontrolü, kaydı ekleyen
// bayinin kendi panelinde anında görmesi gereken okumalar) consistency: "strong"
// geçilebilir; bu, okumayı biraz yavaşlatır ama tazelik garantisi verir.
interface ConsistencyOpts {
  consistency?: "strong" | "eventual";
}

export async function getVehicleById(id: string, opts?: ConsistencyOpts): Promise<Vehicle | null> {
  return (await vehiclesStore().get(id, { type: "json", consistency: opts?.consistency })) as Vehicle | null;
}

export async function getVehicleByPlate(plate: string, opts?: ConsistencyOpts): Promise<Vehicle | null> {
  const id = await vehiclesByPlateStore().get(normalizePlate(plate), {
    type: "text",
    consistency: opts?.consistency,
  });
  if (!id) return null;
  return getVehicleById(id, opts);
}

export interface VehicleEditableFields {
  plate: string; // normalize edilmiş (34ABC123)
  plateDisplay: string; // görünen biçim (34 ABC 123)
  brand: string;
  model: string;
  year?: string;
  ownerName?: string;
  ownerPhone?: string;
}

// Araç satıldığında plaka ve/veya sahibi bilgisi değişebilir — bu fonksiyon aracın
// temel bilgilerini günceller. Plaka değiştiyse plaka indeksini de (vehicles_by_plate)
// güncelliyoruz, aksi hâlde eski plakayla arama yapıldığında hâlâ bu araç bulunur ama
// yeni plakayla bulunamaz. Çağıran taraf, yeni plakanın başka bir araca ait olmadığını
// önceden kontrol etmelidir (bkz. PATCH /api/vehicles/[id]).
export async function updateVehicleInfo(
  vehicleId: string,
  fields: VehicleEditableFields
): Promise<Vehicle> {
  const vehicle = await getVehicleById(vehicleId, { consistency: "strong" });
  if (!vehicle) throw new Error("Araç bulunamadı.");

  const updated: Vehicle = {
    ...vehicle,
    plate: fields.plate,
    plateDisplay: fields.plateDisplay,
    brand: fields.brand,
    model: fields.model,
    year: fields.year,
    ownerName: fields.ownerName,
    ownerPhone: fields.ownerPhone,
  };

  if (fields.plate !== vehicle.plate) {
    await vehiclesByPlateStore().delete(vehicle.plate);
    await vehiclesByPlateStore().set(fields.plate, vehicleId);
  }

  await vehiclesStore().setJSON(vehicleId, updated);
  return updated;
}

// Araç sahibi/ikinci el alıcı ile paylaşılabilecek, girişsiz erişilebilen özel bir
// bağlantı için token üretir (ilk çağrıda oluşturur, sonrasında aynısını döner).
export async function getOrCreateReportToken(vehicleId: string): Promise<string | null> {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) return null;
  if (vehicle.reportToken) return vehicle.reportToken;

  const token = randomUUID().replace(/-/g, "");
  const updated: Vehicle = { ...vehicle, reportToken: token };
  await vehiclesStore().setJSON(vehicleId, updated);
  return token;
}

// Bir bayiyi bir araçla ilişkilendirir (araç oluşturma veya bakım kaydı ekleme anında
// çağrılır). Aynı araca birden fazla bayi kayıt eklerse, her biri kendi "Araçlarım"
// listesinde bu aracı görür — araç tek bir bayiye kilitli değildir.
export async function linkShopVehicle(shopId: string, vehicleId: string): Promise<void> {
  await shopVehicleLinksStore().set(`${shopId}/${vehicleId}`, new Date().toISOString());
}

export async function listVehiclesByShop(shopId: string): Promise<Vehicle[]> {
  const { blobs } = await shopVehicleLinksStore().list({ prefix: `${shopId}/` });
  const withDates = await Promise.all(
    blobs.map(async (b) => {
      const vehicleId = b.key.slice(shopId.length + 1);
      const lastActivity = await shopVehicleLinksStore().get(b.key, { type: "text" });
      const vehicle = await getVehicleById(vehicleId);
      return vehicle ? { vehicle, lastActivity: lastActivity || "" } : null;
    })
  );
  return withDates
    .filter((v): v is { vehicle: Vehicle; lastActivity: string } => !!v)
    .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
    .map((v) => v.vehicle);
}

// Hatırlatma cron görevi için tüm araçları tarar.
export async function listAllVehicles(): Promise<Vehicle[]> {
  const { blobs } = await vehiclesStore().list();
  const all = await Promise.all(blobs.map((b) => getVehicleById(b.key)));
  return all.filter((v): v is Vehicle => !!v);
}

// ---------- Oil Records ----------
export async function createOilRecord(record: OilRecord): Promise<void> {
  await oilRecordsStore().setJSON(`${record.vehicleId}/${record.id}`, record);
  // Kaydı giren bayi, aracı oluşturan bayi olmasa bile "Araçlarım" listesinde görsün.
  await linkShopVehicle(record.shopId, record.vehicleId);
}

export async function listOilRecordsForVehicle(
  vehicleId: string,
  opts?: ConsistencyOpts
): Promise<OilRecord[]> {
  // Not: @netlify/blobs .list() çağrısı consistency seçeneğini desteklemiyor (yalnızca
  // .get()/.set() destekliyor) — bu yüzden burada kaldırıldı; aşağıdaki tekil .get()
  // çağrılarında hâlâ isteğe bağlı "strong" tutarlılık uygulanıyor.
  const { blobs } = await oilRecordsStore().list({
    prefix: `${vehicleId}/`,
  });
  const all = await Promise.all(
    blobs.map(
      (b) =>
        oilRecordsStore().get(b.key, { type: "json", consistency: opts?.consistency }) as Promise<OilRecord | null>
    )
  );
  return all
    .filter((r): r is OilRecord => !!r)
    .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
}

export async function getOilRecordById(
  vehicleId: string,
  recordId: string
): Promise<OilRecord | null> {
  return (await oilRecordsStore().get(`${vehicleId}/${recordId}`, {
    type: "json",
  })) as OilRecord | null;
}

export interface UpcomingService {
  vehicle: Vehicle;
  record: OilRecord;
  daysUntil: number; // negatif ise bakım zamanı geçmiş demektir
}

// Bu bayinin ilgilendiği araçlardan, sonraki bakım tarihi belirtilen pencere
// içinde olan (veya zamanı geçmiş) olanları listeler. Dashboard'daki
// "Yaklaşan Bakımlar" widget'i için kullanılır.
export async function listUpcomingServicesForShop(
  shopId: string,
  windowDays = 14
): Promise<UpcomingService[]> {
  const vehicles = await listVehiclesByShop(shopId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    vehicles.map(async (vehicle) => {
      const records = await listOilRecordsForVehicle(vehicle.id);
      const latest = records[0];
      if (!latest || !latest.nextServiceDate) return null;
      const target = new Date(latest.nextServiceDate);
      const daysUntil = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > windowDays) return null;
      return { vehicle, record: latest, daysUntil };
    })
  );

  return results
    .filter((r): r is UpcomingService => !!r)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

// ---------- Bakım Fotoğrafları ----------
// Fotoğraflar base64 metin olarak, içerik tipi metadata'da tutulur.
export async function savePhoto(
  recordId: string,
  type: "before" | "after",
  base64: string,
  contentType: string
): Promise<void> {
  await recordPhotosStore().set(`${recordId}-${type}`, base64, {
    metadata: { contentType },
  });
}

export async function getPhoto(
  recordId: string,
  type: "before" | "after"
): Promise<{ base64: string; contentType: string } | null> {
  const result = await recordPhotosStore().getWithMetadata(`${recordId}-${type}`, {
    type: "text",
  });
  if (!result) return null;
  return {
    base64: result.data as unknown as string,
    contentType: (result.metadata?.contentType as string) || "image/jpeg",
  };
}

// ---------- Bakım Hatırlatma Günlüğü ----------
// Aynı hatırlatma döngüsü için tekrar SMS gönderilmesini engeller.
export async function hasReminderBeenSent(
  vehicleId: string,
  cycleKey: string
): Promise<boolean> {
  const last = await reminderLogStore().get(vehicleId, { type: "text" });
  return last === cycleKey;
}

export async function markReminderSent(vehicleId: string, cycleKey: string): Promise<void> {
  await reminderLogStore().set(vehicleId, cycleKey);
}

// ---------- Etiket Mağazası ----------
export async function createStickerOrder(order: StickerOrder): Promise<void> {
  await stickerOrdersStore().setJSON(order.id, order);
  await stickerOrdersByShopStore().set(`${order.shopId}/${order.id}`, order.createdAt);
}

export async function getStickerOrderById(
  id: string,
  opts?: ConsistencyOpts
): Promise<StickerOrder | null> {
  return (await stickerOrdersStore().get(id, {
    type: "json",
    consistency: opts?.consistency,
  })) as StickerOrder | null;
}

export async function listStickerOrdersByShop(shopId: string): Promise<StickerOrder[]> {
  const { blobs } = await stickerOrdersByShopStore().list({ prefix: `${shopId}/` });
  const orders = await Promise.all(
    blobs.map((b) => getStickerOrderById(b.key.slice(shopId.length + 1)))
  );
  return orders
    .filter((o): o is StickerOrder => !!o)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// Admin sipariş yönetim ekranı için tüm siparişleri döner. Sipariş hacmi büyüdükçe
// (bkz. kapasite-analizi.md) sayfalama eklenmesi gerekebilir.
export async function listAllStickerOrders(): Promise<StickerOrder[]> {
  const { blobs } = await stickerOrdersStore().list();
  const orders = await Promise.all(blobs.map((b) => getStickerOrderById(b.key)));
  return orders
    .filter((o): o is StickerOrder => !!o)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// Ödeme başlatıldığında token'ı sipariş kimliğiyle eşler — iyzico'nun callbackUrl'e
// yaptığı POST isteği yalnızca token içerir, sipariş kimliğini içermez.
export async function linkStickerOrderToken(token: string, orderId: string): Promise<void> {
  await stickerOrderTokensStore().set(token, orderId);
}

export async function getStickerOrderIdByToken(token: string): Promise<string | null> {
  return await stickerOrderTokensStore().get(token, { type: "text" });
}

// Ödeme durumu güncellemesi (callback) ile admin'in kargo/durum güncellemesi aynı
// kayıt üzerinde eşzamanlı çalışabileceğinden iyimser kilitleme kullanılır.
export async function updateStickerOrder(
  orderId: string,
  mutate: (order: StickerOrder) => StickerOrder
): Promise<StickerOrder> {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = await stickerOrdersStore().getWithMetadata(orderId, {
      type: "json",
      consistency: "strong",
    });
    if (!result || !result.data) throw new Error("Sipariş bulunamadı.");
    const updated = mutate(result.data as StickerOrder);
    const writeResult = await stickerOrdersStore().set(orderId, JSON.stringify(updated), {
      onlyIfMatch: result.etag,
    });
    if (writeResult.modified) return updated;
  }
  throw new Error("Sipariş eşzamanlı olarak değiştirildi, lütfen tekrar deneyin.");
}

// ---------- Etiket Token ----------
// Bir sipariş onaylandığında (veya sipariş anında) quantity kadar benzersiz token
// üretir — her biri fiziksel olarak basılacak bir etikete karşılık gelir.
export async function createStickerTokens(
  shopId: string,
  orderId: string,
  quantity: number
): Promise<string[]> {
  const tokens: string[] = [];
  for (let i = 0; i < quantity; i++) {
    const token = randomUUID().replace(/-/g, "").slice(0, 12);
    const record: StickerToken = { token, shopId, orderId, createdAt: new Date().toISOString() };
    await stickerTokensStore().setJSON(token, record);
    await stickerTokensByOrderStore().set(`${orderId}/${token}`, token);
    tokens.push(token);
  }
  return tokens;
}

export async function getStickerToken(
  token: string,
  opts?: ConsistencyOpts
): Promise<StickerToken | null> {
  return (await stickerTokensStore().get(token, {
    type: "json",
    consistency: opts?.consistency,
  })) as StickerToken | null;
}

export async function listStickerTokensByOrder(orderId: string): Promise<StickerToken[]> {
  const { blobs } = await stickerTokensByOrderStore().list({ prefix: `${orderId}/` });
  const tokens = await Promise.all(
    blobs.map((b) => getStickerToken(b.key.slice(orderId.length + 1)))
  );
  return tokens.filter((t): t is StickerToken => !!t);
}

// Etiketi bir araca bağlar. Token'ın zaten bağlı olup olmadığı ve doğru bayiye ait
// olup olmadığı çağıran API route tarafından önceden kontrol edilmelidir.
export async function bindStickerToken(token: string, vehicleId: string): Promise<StickerToken> {
  const record = await getStickerToken(token, { consistency: "strong" });
  if (!record) throw new Error("Etiket bulunamadı.");
  const updated: StickerToken = { ...record, vehicleId, boundAt: new Date().toISOString() };
  await stickerTokensStore().setJSON(token, updated);
  return updated;
}

// Etiket birim fiyatı henüz kesinleşmedi (baskı tedarikçisi araştırması sürüyor) —
// bu yüzden kod içine gömülmek yerine admin panelinden değiştirilebilir bir ayar
// olarak tutuluyor. Ayar tanımlı değilse makul bir varsayılana düşer.
const DEFAULT_STICKER_UNIT_PRICE_TRY = 29;

export async function getStickerUnitPriceTry(): Promise<number> {
  const value = await settingsStore().get("sticker_unit_price_try", { type: "text" });
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STICKER_UNIT_PRICE_TRY;
}

export async function setStickerUnitPriceTry(priceTry: number): Promise<void> {
  await settingsStore().set("sticker_unit_price_try", String(priceTry));
}
