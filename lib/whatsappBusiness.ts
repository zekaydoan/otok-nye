// OtoHafıza'nın kurumsal WhatsApp Business hattı — ülke koduyla, boşluksuz
// (ör. "905XXXXXXXXX"). components/WhatsAppFloatButton.tsx, ana sayfa İletişim
// bölümü, Şifremi Unuttum akışı ve etiket sipariş sayfası aynı numarayı buradan
// okur — numara değişirse tek yerden güncellenir.
export const WHATSAPP_BUSINESS_NUMBER = "905425756918";

export function buildBusinessWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}
