// Otomatik WhatsApp bakım hatırlatması — merkezi (Oto Künye) hattan gönderim.
//
// Neden merkezi: Her bayinin kendi WhatsApp Business hesabını platforma bağlaması
// (Meta "Embedded Signup") teknik olarak mümkün ama her bayi için ayrı Meta iş
// doğrulaması + ayrı numara gerektirir — küçük esnaf için ciddi bir kayıt engeli.
// Bunun yerine tek bir Oto Künye WhatsApp hattından gönderiyoruz; mesaj içeriğinde
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

// Sağlayıcı bağlandığında yalnızca bu fonksiyonun içi doldurulacak — çağıran
// kodun (netlify/functions/send-maintenance-reminders.ts) değişmesine gerek yok.
export async function sendWhatsAppReminder(
  phone: string,
  message: string
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
        `(Alıcı: ${normalized}) Mesaj: ${message}`
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
      body: JSON.stringify({ to: normalized, message }),
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

export function reminderCycleKey(record: OilRecord): string {
  // Bir bakım kaydına ait hedef tarih/km değişmediği sürece aynı döngü için
  // ikinci kez hatırlatma gönderilmesini engeller (bkz. blobStore.hasReminderBeenSent).
  return `${record.id}:${record.nextServiceDate ?? ""}:${record.nextServiceKm ?? ""}`;
}

export function vehicleHasReminderConsent(vehicle: Vehicle): boolean {
  // Şu an için: telefon numarası girilmişse (bakım kaydı/araç ekleme formundaki
  // KVKK onay kutusu zaten "bakım hatırlatması için kullanılabileceği" ibaresini
  // kapsıyor — bkz. app/dashboard/araclar/yeni/page.tsx) hatırlatma gönderilebilir
  // kabul ediyoruz. İleride bayi bazlı bir "otomatik hatırlatmayı kapat" ayarı
  // eklenirse bu fonksiyon ona bakacak şekilde genişletilebilir.
  return Boolean(vehicle.ownerPhone && vehicle.ownerPhone.trim().length > 0);
}
