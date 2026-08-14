import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import type {
  Appointment,
  OilRecord,
  Plan,
  Shop,
  StaffAccount,
  StickerOrder,
  StickerToken,
  Suggestion,
  SuggestionStatus,
  Vehicle,
} from "./types";

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
// Randevular: anahtar `${shopId}/${appointmentId}` — bir bayinin tüm randevularını
// tek bir prefix taramasıyla listeleyebilmek için oil kayıtlarındaki
// `${vehicleId}/${id}` deseniyle aynı mantık kullanılır. Randevular araçlardan
// farklı olarak paylaşımlı değildir; yalnızca kaydı oluşturan bayiye görünür.
const appointmentsStore = () => getStore("appointments");
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
// Çoklu çalışan hesapları: anahtar `${shopId}/${staffId}` — randevu/araç
// indeksleriyle aynı prefix deseni, bir dükkanın tüm çalışanlarını tek taramayla
// listeleyebilmek için. Ayrı bir e-posta indeksi (staffByEmailStore) giriş
// akışında e-postadan doğrudan hangi shopId/staffId'ye ait olduğunu bulmak için
// kullanılır — Shop'un shopsByEmailStore'una paralel bir yapı.
const staffStore = () => getStore("staff");
const staffByEmailStore = () => getStore("staff_by_email");
// Öneri/geri bildirim kutusu: siparişlerdeki desenle aynı — kayıtlar kendi
// kimlikleriyle tek bir store'da tutulur, bir bayinin kendi önerilerini tek
// taramayla listeleyebilmesi için ayrı bir shopId->id indeksi kullanılır.
const suggestionsStore = () => getStore("suggestions");
const suggestionsByShopStore = () => getStore("suggestions_by_shop");
// Admin istatistik paneli için günlük sayfa görüntüleme sayaçları. Anahtar:
// YYYY-MM-DD, değer: { count }. rateLimit.ts'teki gibi "best-effort" bir
// artırma — Netlify Blobs atomik increment desteklemediği için çok yoğun eşzamanlı
// trafikte birkaç görüntüleme kaybolabilir; bu, kaba bir trend göstergesi için
// yeterlidir ama kesin bir sayaç değildir (bkz. lib/rateLimit.ts aynı not).
const siteAnalyticsStore = () => getStore("site_analytics");
// Bir bayinin bir plana ne zaman "başladığının" kaydı — hem yeni kayıtta
// (varsayılan free plan) hem de app/api/shop/plan'de plan değiştirildiğinde
// yazılır. Admin panelindeki "Plan Dağılımı" tablosunun günlük/aylık/yıllık
// kırılımı buradan hesaplanır (bkz. getPlanStartStats). Anahtar:
// `${createdAt}_${shopId}` — zaman sıralı olduğu için ileride tarih aralığı
// bazlı taramaya da uygun. NOT: bu olay günlüğü bu özellik yayına alındığı
// andan itibaren tutulmaya başlar; öncesindeki geçmiş plan başlangıçları bu
// sayaçlara dahil değildir (yalnızca Shop.plan'in güncel anlık görüntüsü bu
// dönemi kapsar, bkz. getShopCountsByPlan).
const planEventsStore = () => getStore("plan_events");

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

// ---------- Çoklu çalışan hesabı ----------
export async function createStaffAccount(staff: StaffAccount): Promise<void> {
  await staffStore().setJSON(`${staff.shopId}/${staff.id}`, staff);
  await staffByEmailStore().set(staff.email.toLowerCase(), `${staff.shopId}/${staff.id}`);
}

export async function getStaffById(shopId: string, staffId: string): Promise<StaffAccount | null> {
  return (await staffStore().get(`${shopId}/${staffId}`, { type: "json" })) as StaffAccount | null;
}

export async function getStaffByEmail(email: string): Promise<StaffAccount | null> {
  const key = await staffByEmailStore().get(email.toLowerCase(), { type: "text" });
  if (!key) return null;
  return (await staffStore().get(key, { type: "json" })) as StaffAccount | null;
}

export async function listStaffForShop(shopId: string): Promise<StaffAccount[]> {
  const { blobs } = await staffStore().list({ prefix: `${shopId}/` });
  const all = await Promise.all(
    blobs.map((b) => staffStore().get(b.key, { type: "json" }) as Promise<StaffAccount | null>)
  );
  return all
    .filter((s): s is StaffAccount => !!s)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export async function deleteStaffAccount(shopId: string, staffId: string): Promise<void> {
  const staff = await getStaffById(shopId, staffId);
  if (!staff) return;
  await staffStore().delete(`${shopId}/${staffId}`);
  await staffByEmailStore().delete(staff.email.toLowerCase());
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

// Aracın bilinen en güncel kilometresini günceller — ya bir bakım kaydı eklenirken
// otomatik olarak (bkz. createOilRecord), ya da araç detay sayfasındaki hızlı "Güncel
// Km" alanından elle çağrılır. Kilometre yalnızca ileri gidebilir: geriye giden bir
// değer muhtemelen yanlış girilmiştir ve km bazlı hatırlatmayı (bkz.
// listUpcomingServicesForShop) yanlış yönde sıfırlayıp bir bakımın "henüz uzak"
// görünmesine yol açabilir.
export async function updateVehicleKm(vehicleId: string, km: number): Promise<Vehicle> {
  const vehicle = await getVehicleById(vehicleId, { consistency: "strong" });
  if (!vehicle) throw new Error("Araç bulunamadı.");
  if (typeof vehicle.lastKnownKm === "number" && km < vehicle.lastKnownKm) {
    throw new Error(
      `Yeni km (${km.toLocaleString("tr-TR")}), bilinen son km'den (${vehicle.lastKnownKm.toLocaleString("tr-TR")}) düşük olamaz.`
    );
  }
  const updated: Vehicle = {
    ...vehicle,
    lastKnownKm: km,
    lastKnownKmUpdatedAt: new Date().toISOString(),
  };
  await vehiclesStore().setJSON(vehicleId, updated);
  return updated;
}

// Bir bayiyi bir araçla ilişkilendirir (araç oluşturma veya bakım kaydı ekleme anında
// çağrılır). Aynı araca birden fazla bayi kayıt eklerse, her biri kendi "Araçlarım"
// listesinde bu aracı görür — araç tek bir bayiye kilitli değildir.
export async function linkShopVehicle(shopId: string, vehicleId: string): Promise<void> {
  await shopVehicleLinksStore().set(`${shopId}/${vehicleId}`, new Date().toISOString());
}

// Bir bayinin bu araçla gerçekten "ilgilendiği" (oluşturmuş ya da en az bir bakım
// kaydı eklemiş) olup olmadığını tek bir anahtar okumasıyla kontrol eder.
// Paylaşımlı defter modelinde herkes bir aracı görüntüleyip kayıt ekleyebilir,
// ama hatırlatma günlüğü gibi yan etkili işlemlerde (bkz. app/api/vehicles/[id]/
// reminder-sent) ilgisiz bir bayinin başka bir bayinin otomatik hatırlatmasını
// sessizce bastırmasını önlemek için bu daha sıkı kontrol kullanılır.
export async function isVehicleLinkedToShop(shopId: string, vehicleId: string): Promise<boolean> {
  const value = await shopVehicleLinksStore().get(`${shopId}/${vehicleId}`, { type: "text" });
  return value !== null;
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

  // Bakım kaydına girilen km, o anki bilinen güncel km kabul edilir — km bazlı
  // hatırlatmanın (bkz. listUpcomingServicesForShop) çalışabilmesi için aracın
  // lastKnownKm alanını da burada güncelliyoruz. updateVehicleKm, km geriye
  // gidiyorsa hata fırlatır (ör. bu kayıt km tutarlılık uyarısı tetikleyen türden
  // yanlış girilmiş bir değerse) — bu durumda bakım kaydının kendisi zaten
  // oluşturulduğundan hatayı sessizce yutuyoruz.
  if (typeof record.km === "number") {
    try {
      await updateVehicleKm(record.vehicleId, record.km);
    } catch {
      // yok say
    }
  }
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
  daysUntil: number | null; // negatif ise bakım zamanı geçmiş demektir; tarih hedefi yoksa null
  kmRemaining: number | null; // negatif ise km hedefi geçilmiş demektir; hesaplanamıyorsa null
}

// Bir aracın en son bakım kaydına göre "bakım zamanı ne kadar yaklaştı" hesabı —
// hem dashboard'daki "Yaklaşan Bakımlar" widget'ı (listUpcomingServicesForShop,
// geniş 14 günlük pencere) hem de otomatik WhatsApp hatırlatma taraması
// (listDueReminders, dar 3 günlük pencere) aynı mantığı paylaşır ki iki yerde
// farklı hesap/farklı sonuç ortaya çıkmasın.
function computeServiceStatus(
  vehicle: Vehicle,
  latest: OilRecord,
  today: Date
): { daysUntil: number | null; kmRemaining: number | null } {
  let daysUntil: number | null = null;
  if (latest.nextServiceDate) {
    const target = new Date(latest.nextServiceDate);
    daysUntil = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  let kmRemaining: number | null = null;
  if (typeof latest.nextServiceKm === "number" && typeof vehicle.lastKnownKm === "number") {
    kmRemaining = latest.nextServiceKm - vehicle.lastKnownKm;
  }

  return { daysUntil, kmRemaining };
}

// Bu bayinin ilgilendiği araçlardan, sonraki bakım tarihi belirtilen gün penceresi
// içinde OLAN YA DA sonraki bakım km hedefine belirtilen km penceresi kadar
// YAKLAŞMIŞ (veya geçmiş) olanları listeler. Dashboard'daki "Yaklaşan Bakımlar"
// widget'ı için kullanılır. Km bazlı hesap, aracın lastKnownKm alanına dayanır —
// bu alan bir bakım kaydı eklenirken otomatik, ya da araç detay sayfasından elle
// güncellenir (bkz. updateVehicleKm). lastKnownKm hiç girilmemişse km bazlı
// kontrol devre dışı kalır, yalnızca tarih bazlı kontrol çalışır.
export async function listUpcomingServicesForShop(
  shopId: string,
  windowDays = 14,
  kmWindow = 500
): Promise<UpcomingService[]> {
  const vehicles = await listVehiclesByShop(shopId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    vehicles.map(async (vehicle) => {
      const records = await listOilRecordsForVehicle(vehicle.id);
      const latest = records[0];
      if (!latest) return null;

      const { daysUntil, kmRemaining } = computeServiceStatus(vehicle, latest, today);
      const dateDue = daysUntil !== null && daysUntil <= windowDays;
      const kmDue = kmRemaining !== null && kmRemaining <= kmWindow;
      if (!dateDue && !kmDue) return null;

      return { vehicle, record: latest, daysUntil, kmRemaining };
    })
  );

  return results
    .filter((r): r is UpcomingService => !!r)
    .sort((a, b) => {
      const aKey = a.daysUntil ?? Infinity;
      const bKey = b.daysUntil ?? Infinity;
      if (aKey !== bKey) return aKey - bKey;
      return (a.kmRemaining ?? Infinity) - (b.kmRemaining ?? Infinity);
    });
}

// Otomatik WhatsApp hatırlatma cron'u için: sistemdeki TÜM araçları (bayi
// ayrımı gözetmeden) tarar, bakım zamanı dar bir pencere içinde olanları
// döndürür. windowDays/kmWindow varsayılanları, dashboard'daki geniş "erken
// haber ver" penceresinden (14 gün) bilinçli olarak daha dar tutulur — amaç
// müşteriye "tam zamanında" hatırlatma göndermek, günler öncesinden spam
// yapmamaktır (bkz. lib/whatsappReminder.ts).
export async function listDueReminders(
  windowDays = 3,
  kmWindow = 500
): Promise<UpcomingService[]> {
  const vehicles = await listAllVehicles();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    vehicles.map(async (vehicle) => {
      const records = await listOilRecordsForVehicle(vehicle.id);
      const latest = records[0];
      if (!latest) return null;

      const { daysUntil, kmRemaining } = computeServiceStatus(vehicle, latest, today);
      const dateDue = daysUntil !== null && daysUntil <= windowDays;
      const kmDue = kmRemaining !== null && kmRemaining <= kmWindow;
      if (!dateDue && !kmDue) return null;

      return { vehicle, record: latest, daysUntil, kmRemaining };
    })
  );

  return results.filter((r): r is UpcomingService => !!r);
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
// Aynı hatırlatma döngüsü için tekrar mesaj gönderilmesini engeller VE bayi
// panelinde "hatırlatma gönderildi mi" görünürlüğü sağlar (bkz. app/dashboard/
// hatirlatmalar, app/dashboard/page.tsx). channel: otomatik gece taraması mı
// yoksa bayinin panelden elle "WhatsApp'tan Hatırlat" butonuna basması mı
// olduğunu ayırt eder.
export interface ReminderLogEntry {
  cycleKey: string;
  sentAt: string; // ISO
  channel: "otomatik" | "manuel";
}

export async function hasReminderBeenSent(
  vehicleId: string,
  cycleKey: string
): Promise<boolean> {
  const entry = await getReminderLogEntry(vehicleId);
  return entry?.cycleKey === cycleKey;
}

export async function markReminderSent(
  vehicleId: string,
  cycleKey: string,
  channel: "otomatik" | "manuel" = "otomatik"
): Promise<void> {
  const entry: ReminderLogEntry = { cycleKey, sentAt: new Date().toISOString(), channel };
  await reminderLogStore().setJSON(vehicleId, entry);
}

export async function getReminderLogEntry(vehicleId: string): Promise<ReminderLogEntry | null> {
  return (await reminderLogStore().get(vehicleId, { type: "json" })) as ReminderLogEntry | null;
}

// ---------- Randevular ----------
// Anahtar `${shopId}/${id}` — oil kayıtlarındaki `${vehicleId}/${id}` deseniyle
// aynı mantık: bir bayinin tüm randevularını tek bir prefix taramasıyla
// listeleyebiliriz. Vehicle'ların aksine randevular paylaşımlı değildir, bu yüzden
// IDOR riski yok — API route'ları her zaman oturumdaki shopId'yi kullanır.
export async function createAppointment(appointment: Appointment): Promise<void> {
  await appointmentsStore().setJSON(`${appointment.shopId}/${appointment.id}`, appointment);
}

export async function listAppointmentsForShop(shopId: string): Promise<Appointment[]> {
  const { blobs } = await appointmentsStore().list({ prefix: `${shopId}/` });
  const all = await Promise.all(
    blobs.map(
      (b) => appointmentsStore().get(b.key, { type: "json" }) as Promise<Appointment | null>
    )
  );
  return all
    .filter((a): a is Appointment => !!a)
    .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
}

// Diğer mutasyon fonksiyonlarıyla (updateShopFields, updateStickerOrder) tutarlı
// olması için iyimser kilitleme kullanılır — tek kullanıcı tarafından yönetilse bile
// aynı randevunun iki sekmede aynı anda güncellenmesi durumuna karşı güvenli.
export async function updateAppointment(
  shopId: string,
  appointmentId: string,
  mutate: (appointment: Appointment) => Appointment
): Promise<Appointment> {
  const key = `${shopId}/${appointmentId}`;
  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = await appointmentsStore().getWithMetadata(key, {
      type: "json",
      consistency: "strong",
    });
    if (!result || !result.data) throw new Error("Randevu bulunamadı.");
    const updated = mutate(result.data as Appointment);
    const writeResult = await appointmentsStore().set(key, JSON.stringify(updated), {
      onlyIfMatch: result.etag,
    });
    if (writeResult.modified) return updated;
  }
  throw new Error("Randevu eşzamanlı olarak değiştirildi, lütfen tekrar deneyin.");
}

export async function deleteAppointment(shopId: string, appointmentId: string): Promise<void> {
  await appointmentsStore().delete(`${shopId}/${appointmentId}`);
}

// WhatsApp hatırlatmasındaki "Evet" cevabıyla otomatik açılan, henüz bayinin
// görmediği randevu sayısı — dashboard header'ındaki Randevular rozeti için
// (bkz. app/dashboard/layout.tsx). Bayi Randevular sayfasını ziyaret edince
// markWhatsappAppointmentsSeen ile sıfırlanır.
export async function countUnseenWhatsappAppointments(shopId: string): Promise<number> {
  const appointments = await listAppointmentsForShop(shopId);
  return appointments.filter((a) => a.source === "whatsapp_onay" && !a.seenByShop).length;
}

export async function markWhatsappAppointmentsSeen(shopId: string): Promise<void> {
  const appointments = await listAppointmentsForShop(shopId);
  const unseen = appointments.filter((a) => a.source === "whatsapp_onay" && !a.seenByShop);
  await Promise.all(
    unseen.map((a) =>
      updateAppointment(shopId, a.id, (current) => ({ ...current, seenByShop: true })).catch(() => {
        // Bir tanesi eşzamanlı çakışmayla başarısız olsa bile diğerlerini engellemesin —
        // en kötü ihtimalle rozet bir sonraki ziyarette sıfırlanır.
      })
    )
  );
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

// ---------- Öneri / Geri Bildirim ----------
export async function createSuggestion(suggestion: Suggestion): Promise<void> {
  await suggestionsStore().setJSON(suggestion.id, suggestion);
  await suggestionsByShopStore().set(`${suggestion.shopId}/${suggestion.id}`, suggestion.createdAt);
}

export async function getSuggestionById(id: string): Promise<Suggestion | null> {
  return (await suggestionsStore().get(id, { type: "json" })) as Suggestion | null;
}

export async function listSuggestionsForShop(shopId: string): Promise<Suggestion[]> {
  const { blobs } = await suggestionsByShopStore().list({ prefix: `${shopId}/` });
  const suggestions = await Promise.all(
    blobs.map((b) => getSuggestionById(b.key.slice(shopId.length + 1)))
  );
  return suggestions
    .filter((s): s is Suggestion => !!s)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// Admin öneri kutusu için tüm önerileri döner. Hacim büyüdükçe (bkz.
// kapasite-analizi.md) sayfalama eklenmesi gerekebilir — sipariş listesindeki
// aynı not burada da geçerli.
export async function listAllSuggestions(): Promise<Suggestion[]> {
  const { blobs } = await suggestionsStore().list();
  const suggestions = await Promise.all(blobs.map((b) => getSuggestionById(b.key)));
  return suggestions
    .filter((s): s is Suggestion => !!s)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus
): Promise<Suggestion> {
  const existing = await getSuggestionById(id);
  if (!existing) throw new Error("Öneri bulunamadı.");
  const updated: Suggestion = { ...existing, status };
  await suggestionsStore().setJSON(id, updated);
  return updated;
}

// ---------- Admin İstatistik Paneli ----------

// Bir sayfa görüntülemesini bugünün tarihine ekler. Kimlik/IP saklanmaz — yalnızca
// günlük toplam sayaç tutulur (gizlilik dostu, kişisel veri değil). Client tarafı
// bkz. components/PageviewTracker.tsx, uç nokta bkz. app/api/analytics/pageview.
export async function incrementDailyPageview(dateISO: string): Promise<void> {
  const existing = (await siteAnalyticsStore().get(dateISO, { type: "json" })) as {
    count: number;
  } | null;
  await siteAnalyticsStore().setJSON(dateISO, { count: (existing?.count ?? 0) + 1 });
}

export interface DailyPageviewStat {
  date: string; // YYYY-MM-DD
  count: number;
}

// Son `days` günün (bugün dahil) günlük sayfa görüntüleme sayılarını, en eskiden en
// yeniye sıralı döner — hiç görüntülenmemiş günler 0 olarak gelir.
export async function getDailyPageviews(days: number): Promise<DailyPageviewStat[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const results: DailyPageviewStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateISO = d.toISOString().slice(0, 10);
    const entry = (await siteAnalyticsStore().get(dateISO, { type: "json" })) as {
      count: number;
    } | null;
    results.push({ date: dateISO, count: entry?.count ?? 0 });
  }
  return results;
}

// Tüm bayileri döner — admin istatistik paneli dışında kullanılmamalı (tek tek
// bayi sorguları için getShopById/getShopByEmail kullanın). Hacim büyüdükçe
// (bkz. kapasite-analizi.md) sayfalama gerekebilir — listAllStickerOrders/
// listAllSuggestions'daki aynı not burada da geçerli.
export async function listAllShops(): Promise<Shop[]> {
  const { blobs } = await shopsStore().list();
  const shops = await Promise.all(blobs.map((b) => getShopById(b.key)));
  return shops.filter((s): s is Shop => !!s);
}

// Plan başına aktif bayi sayısını döner (free dahil tüm planlar). Bu, GÜNCEL bir
// anlık görüntüdür (her bayi yalnızca şu an bulunduğu planda sayılır); zaman
// bazlı "kaç kişi başlattı" kırılımı için bkz. getPlanStartStats.
export async function getShopCountsByPlan(): Promise<Record<Plan, number>> {
  const shops = await listAllShops();
  const counts: Record<Plan, number> = { free: 0, pro: 0, business: 0, business_yillik: 0 };
  for (const shop of shops) {
    counts[shop.plan] = (counts[shop.plan] ?? 0) + 1;
  }
  return counts;
}

interface PlanEvent {
  shopId: string;
  plan: Plan;
  createdAt: string; // ISO
}

// Bir bayinin bir plana "başladığını" kaydeder — yeni kayıtta (free) ve
// app/api/shop/plan'de plan değiştirildiğinde çağrılır. Aynı bayi aynı plana
// tekrar geçerse (ör. iptal edip yeniden aynı plana dönerse) bu yeni bir ayrı
// olay olarak sayılır — amaç "kaç kez başlandığı", "kaç farklı bayinin o an o
// planda olduğu" değil.
export async function recordPlanStart(shopId: string, plan: Plan): Promise<void> {
  const createdAt = new Date().toISOString();
  const key = `${createdAt}_${shopId}`;
  const event: PlanEvent = { shopId, plan, createdAt };
  await planEventsStore().setJSON(key, event);
}

export interface PlanStartStats {
  today: Record<Plan, number>;
  thisMonth: Record<Plan, number>;
  thisYear: Record<Plan, number>;
}

function emptyPlanCounts(): Record<Plan, number> {
  return { free: 0, pro: 0, business: 0, business_yillik: 0 };
}

// Plan başlangıç olaylarını bugün/bu ay/bu yıl pencerelerine göre sayar. Hacim
// büyüdükçe (bkz. kapasite-analizi.md) tam taramanın yerini periyodik
// önceden-hesaplanmış özetler almalı — diğer "listAll*" fonksiyonlarındaki not
// burada da geçerli.
export async function getPlanStartStats(): Promise<PlanStartStats> {
  const { blobs } = await planEventsStore().list();
  const events = await Promise.all(
    blobs.map((b) => planEventsStore().get(b.key, { type: "json" }) as Promise<PlanEvent | null>)
  );

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const monthPrefix = todayISO.slice(0, 7); // YYYY-MM
  const yearPrefix = todayISO.slice(0, 4); // YYYY

  const stats: PlanStartStats = {
    today: emptyPlanCounts(),
    thisMonth: emptyPlanCounts(),
    thisYear: emptyPlanCounts(),
  };

  for (const event of events) {
    if (!event) continue;
    const dateISO = event.createdAt.slice(0, 10);
    if (dateISO === todayISO) stats.today[event.plan] = (stats.today[event.plan] ?? 0) + 1;
    if (dateISO.startsWith(monthPrefix)) stats.thisMonth[event.plan] = (stats.thisMonth[event.plan] ?? 0) + 1;
    if (dateISO.startsWith(yearPrefix)) stats.thisYear[event.plan] = (stats.thisYear[event.plan] ?? 0) + 1;
  }

  return stats;
}

export interface CityOrderStat {
  city: string;
  orderCount: number;
  revenueTry: number;
}

export interface StickerOrderStats {
  totalOrders: number;
  paidOrders: number; // ödemesi onaylanmış (odendi/hazirlaniyor/kargoda/teslim_edildi)
  totalRevenueTry: number;
  byCity: CityOrderStat[]; // ciroya göre azalan sırada
}

const PAID_STATUSES = new Set(["odendi", "hazirlaniyor", "kargoda", "teslim_edildi"]);

// Etiket mağazası için toplam sipariş/ciro ve şehir bazında kırılım hesaplar.
// "Ödenmiş" sayılan durumlar: odendi, hazirlaniyor, kargoda, teslim_edildi —
// bunların hepsi ödeme onayından SONRA gelen aşamalardır (bkz. StickerOrderStatus).
export async function getStickerOrderStats(): Promise<StickerOrderStats> {
  const orders = await listAllStickerOrders();
  const paidOrders = orders.filter((o) => PAID_STATUSES.has(o.status));

  const cityMap = new Map<string, CityOrderStat>();
  for (const order of paidOrders) {
    const city = order.shippingAddress?.city?.trim() || "Belirtilmemiş";
    const entry = cityMap.get(city) ?? { city, orderCount: 0, revenueTry: 0 };
    entry.orderCount += 1;
    entry.revenueTry += order.totalPriceTry;
    cityMap.set(city, entry);
  }

  return {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    totalRevenueTry: paidOrders.reduce((sum, o) => sum + o.totalPriceTry, 0),
    byCity: Array.from(cityMap.values()).sort((a, b) => b.revenueTry - a.revenueTry),
  };
}
