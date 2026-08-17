// Türkiye telefon numaralarını serbest metinden ("0555 000 00 00", "555 000 00 00",
// "+90 555 000 00 00" vb.) 90'lı, ülke koduyla başlayan 12 haneli bir dizgeye
// normalize eder (ör. "905550000000"). Tanınmayan bir biçimse null döner. Hem
// wa.me derin bağlantıları (aşağıda) hem de iyzico Abonelik API'sinin zorunlu
// tuttuğu "+90'lı" gsmNumber alanı için (bkz. app/api/shop/plan) ortak kullanılır.
export function normalizeTrPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("90")) return digits;
  return null;
}

// Tam otomatik WhatsApp Business API entegrasyonu (Meta iş hesabı onayı, şablon mesaj
// incelemesi vb.) ek kurulum gerektirir. Bunun yerine, tamircinin tek tıkla mesaj
// gönderebileceği bir wa.me derin bağlantısı üretiyoruz — WhatsApp Web/uygulaması
// mesajı hazır şekilde açar, gönderme kararı tamircide kalır.
export function buildWhatsAppLink(phone: string, message: string): string | null {
  const normalized = normalizeTrPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
