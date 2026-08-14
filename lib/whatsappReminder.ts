// Otomatik WhatsApp bakım hatırlatması — merkezi (OtoHafıza) hattan gönderim.
//
// Neden merkezi: Her bayinin kendi WhatsApp Business hesabını platforma bağlaması
// (Meta "Embedded Signup") teknik olarak mümkün ama her bayi için ayrı Meta iş
// doğrulaması + ayrı numara gerektirir — küçük esnaf için ciddi bir kayıt engeli.
// Bunun yerine tek bir OtoHafıza WhatsApp hattından gönderiyoruz; mesaj içeriğinde
// bayinin adı/telefonu geçtiği için müşteri kimin hatırlattığını her zaman görür.
// Ölçek büyürse "kendi numaranızdan gönderin" üst pakete taşınabilecek ayrı bir
// özellik olarak eklenebilir.
//
// DURUM: Bu modül kasıtlı olarak "dormant" (uyur) tasarlandı — WhatsApp Business
// Platform'da canlı/sınırsız gönderim yapabilmek için Meta'nın resmi şirket evrakı
// isteyen bir "Business Verification" süreci gerekiyor (bkz. README "WhatsApp
// Otomatik Hatırlatma Kurulumu"). Şirket kuruluşu tamamlanıp bir sağlayıcı (ör.
// Netgsm WhatsApp modülü) ile anlaşma yapılınca aşağıdaki env değişkenleri
// tanımlanır ve gönderim otomatik olarak devreye girer — bu dosyada başka hiçbir
// değişiklik gerekmez. Env tanımlı değilken sistem sessizce "gönderilmedi" döner,
// hiçbir akışı bozmaz (bkz. lib/email.ts'teki aynı desen).
import type { Vehicle, OilRecord } from "./types";
import type { ReminderLogEntry } from "./blobStore";

export interface WhatsAppSendResult {
  sent: boolean;
  reason?: string;
}

function normalizeTrPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("90")) return digits;
  return null;
}

// Meta'da "utility" kategorisinde onaylatılacak şablonun düz metin karşılığı.
// Şablon onaylandığında buradaki değişkenler ({{1}}, {{2}}...) sağlayıcının
// template-parametre formatına göre eşlenecek; şimdilik önizleme/log amaçlı
// düz metin üretiyoruz.
//
// Not: lib/maintenance.ts içinde de aynı isimde (`buildReminderMessage`) ama
// farklı imzalı bir fonksiyon var — o, panelden tek tıkla gönderilen manuel
// WhatsApp mesajını üretiyor (bkz. VehicleDetailView.tsx, app/dashboard/page.tsx).
// Karışmasın diye buradaki otomatik-hatırlatma sürümü ayrı adla tutuluyor;
// ileride iki metni tek bir yerde birleştirmek (aynı ton/biçim için) makul bir
// temizlik olur ama şimdilik ikisi de bağımsız çalışıyor.
export function buildAutoReminderMessage(params: {
  ownerName?: string;
  plateDisplay: string;
  shopName: string;
  shopPhone?: string;
  reasonText: string; // ör. "yağ bakımı zamanı geldi" / "3 gün içinde bakım zamanı geliyor"
}): string {
  const greeting = params.ownerName ? `Merhaba ${params.ownerName},` : "Merhaba,";
  const contact = params.shopPhone ? ` Randevu için: ${params.shopPhone}` : "";
  return (
    `${greeting} ${params.shopName} bakım takibi hatırlatması: ` +
    `${params.plateDisplay} plakalı aracınızın ${params.reasonText}.${contact}`
  );
}

export interface ReminderQuickReplyButton {
  id: string; // encodeConfirmationPayload() çıktısı
  title: string; // ör. "Evet, randevu oluşturalım" / "Hayır"
}

// Sağlayıcı bağlandığında yalnızca bu fonksiyonun içi doldurulacak — çağıran
// kodun (netlify/functions/send-maintenance-reminders.ts) değişmesine gerek yok.
// `buttons` verilirse mesaj, seçilen sağlayıcının interaktif "quick reply"
// buton formatına göre gönderilir (Meta WhatsApp Business Platform bunu
// template mesajlarında destekliyor); sağlayıcı netleşince burada gerçek
// template adı/parametre eşlemesi yapılacak — şimdilik generic bir gövde
// gönderiyoruz, amaç akışın uçtan uca hazır olması.
export async function sendWhatsAppReminder(
  phone: string,
  message: string,
  buttons?: ReminderQuickReplyButton[]
): Promise<WhatsAppSendResult> {
  const normalized = normalizeTrPhone(phone);
  if (!normalized) {
    return { sent: false, reason: "invalid_phone" };
  }

  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiUrl = process.env.WHATSAPP_API_URL; // ör. Netgsm WhatsApp uç noktası

  if (!apiKey || !apiUrl) {
    console.warn(
      `[whatsapp] WHATSAPP_API_KEY/WHATSAPP_API_URL tanımlı değil, gönderim atlandı. ` +
        `(Alıcı: ${normalized}) Mesaj: ${message}` +
        (buttons ? ` Butonlar: ${buttons.map((b) => b.title).join(" / ")}` : "")
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to: normalized, message, buttons }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[whatsapp] Gönderim hatası:", res.status, text);
      return { sent: false, reason: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[whatsapp] İstek başarısız:", err);
    return { sent: false, reason: "network_error" };
  }
}

// Bir aracın hangi gerekçeyle hatırlatma alacağını insan-okunur metne çevirir.
export function describeReminderReason(daysUntil: number | null, kmRemaining: number | null): string {
  if (daysUntil !== null && daysUntil <= 0) return "bakım zamanı geçti";
  if (kmRemaining !== null && kmRemaining <= 0) return "bakım kilometresi geçti";
  if (daysUntil !== null && daysUntil <= 3) return `bakım zamanı ${daysUntil} gün içinde geliyor`;
  if (kmRemaining !== null && kmRemaining <= 500) return `bakım kilometresine ${kmRemaining} km kaldı`;
  return "bakım zamanı yaklaşıyor";
}

// ---------- Evet/Hayır buton onayı ----------
// Hatırlatma mesajına eklenecek "Evet, randevu oluşturalım" / "Hayır" hızlı
// cevap butonlarının kimliği. Meta'nın interaktif buton mesajlarında her
// butona serbest bir metin kimliği (id) verilebiliyor — müşteri butona
// bastığında bu id, webhook'a olduğu gibi geri dönüyor (bkz.
// app/api/whatsapp/webhook/route.ts). Telefon numarasından değil, doğrudan bu
// id'den hangi araç/hangi bakım döngüsü için cevap verildiğini çözüyoruz; bu
// sayede aynı numaranın birden fazla aracı olsa bile karışıklık olmaz ve eski
// bir hatırlatmaya geç gelen cevap, araç başka bir bakım döngüsüne geçmişse
// sessizce yok sayılabilir (bkz. decodeConfirmationPayload kullanım örneği).
export interface ReminderConfirmationPayload {
  vehicleId: string;
  cycleKey: string;
  answer: "evet" | "hayir";
}

export function encodeConfirmationPayload(
  vehicleId: string,
  cycleKey: string,
  answer: "evet" | "hayir"
): string {
  const json = JSON.stringify({ v: vehicleId, c: cycleKey, a: answer });
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeConfirmationPayload(payload: string): ReminderConfirmationPayload | null {
  try {
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { v?: string; c?: string; a?: string };
    if (!parsed.v || !parsed.c || (parsed.a !== "evet" && parsed.a !== "hayir")) return null;
    return { vehicleId: parsed.v, cycleKey: parsed.c, answer: parsed.a };
  } catch {
    return null;
  }
}

export function reminderCycleKey(record: OilRecord): string {
  // Bir bakım kaydına ait hedef tarih/km değişmediği sürece aynı döngü için
  // ikinci kez hatırlatma gönderilmesini engeller (bkz. blobStore.hasReminderBeenSent).
  return `${record.id}:${record.nextServiceDate ?? ""}:${record.nextServiceKm ?? ""}`;
}

// Sağlayıcı bağlanmış mı — yalnızca sunucu tarafında (server component/route)
// çağrılmalı. Panelde "otomatik hatırlatma bu gece gönderilecek" mi yoksa
// "otomatik gönderim yakında aktif olacak" mı gösterileceğine karar vermek için
// kullanılır (bkz. reminderStatusLabel).
export function isWhatsAppAutoConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_URL);
}

export interface ReminderStatusDisplay {
  text: string;
  className: string;
}

// Bayi panelinde her araç satırının yanında gösterilecek durum rozetini üretir
// — "sizin için arka planda çalışıyoruz" görünürlüğünün kalbi burası. Amaç:
// bayi otomatik sistemin gerçekten çalıştığını (ya da henüz aktif olmadığını,
// dürüstçe) görsün.
export function reminderStatusLabel(
  entry: ReminderLogEntry | null,
  cycleKey: string,
  autoConfigured: boolean
): ReminderStatusDisplay {
  if (entry && entry.cycleKey === cycleKey) {
    const when = new Date(entry.sentAt).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const who = entry.channel === "manuel" ? "Elle gönderildi" : "Otomatik gönderildi";
    return { text: `✓ ${who} · ${when}`, className: "bg-green-100 text-green-700" };
  }
  if (autoConfigured) {
    return {
      text: "⏳ Otomatik hatırlatma bu gece gönderilecek",
      className: "bg-amber-100 text-amber-700",
    };
  }
  return {
    text: "⏳ Otomatik gönderim yakında aktif olacak",
    className: "bg-slate-100 text-slate-500",
  };
}

export function vehicleHasReminderConsent(vehicle: Vehicle): boolean {
  // Şu an için: telefon numarası girilmişse (bakım kaydı/araç ekleme formundaki
  // KVKK onay kutusu zaten "bakım hatırlatması için kullanılabileceği" ibaresini
  // kapsıyor — bkz. app/dashboard/araclar/yeni/page.tsx) hatırlatma gönderilebilir
  // kabul ediyoruz. İleride bayi bazlı bir "otomatik hatırlatmayı kapat" ayarı
  // eklenirse bu fonksiyon ona bakacak şekilde genişletilebilir.
  return Boolean(vehicle.ownerPhone && vehicle.ownerPhone.trim().length > 0);
}
