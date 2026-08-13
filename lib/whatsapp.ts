// Tam otomatik WhatsApp Business API entegrasyonu (Meta iş hesabı onayı, şablon mesaj
// incelemesi vb.) ek kurulum gerektirir. Bunun yerine, tamircinin tek tıkla mesaj
// gönderebileceği bir wa.me derin bağlantısı üretiyoruz — WhatsApp Web/uygulaması
// mesajı hazır şekilde açar, gönderme kararı tamircide kalır.
export function buildWhatsAppLink(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  let normalized: string | null = null;
  if (digits.length === 10 && digits.startsWith("5")) normalized = `90${digits}`;
  else if (digits.length === 11 && digits.startsWith("0")) normalized = `90${digits.slice(1)}`;
  else if (digits.length === 12 && digits.startsWith("90")) normalized = digits;

  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
