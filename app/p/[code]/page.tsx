import { redirect } from "next/navigation";

// Saha Partnerinin paylaştığı kısa, kurumsal görünen link — bkz.
// components/PartnerReferralLink.tsx. Gerçek kayıt formu hâlâ app/kayit'te
// yaşıyor (ref parametresini orada okuyup doğruluyor, bkz. o dosyadaki yorum);
// bu sayfa yalnızca "otohafiza.com/p/KOD" -> "otohafiza.com/kayit?ref=KOD"
// yönlendirmesi yapan ince bir katman. Kodun geçerli olup olmadığını burada
// AYRICA doğrulamıyoruz — /kayit zaten bilinmeyen/geçersiz bir kodu sessizce
// yok sayıyor, burada tekrar bir veritabanı sorgusu yapmak gereksiz.
export default function PartnerShortLinkPage({ params }: { params: { code: string } }) {
  redirect(`/kayit?ref=${encodeURIComponent(params.code)}`);
}
