import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";

// Sitenin herkese açık (pazarlama) sayfalarında sağ altta sabit duran destek
// butonu — bu sektörde (usta/esnaf) telefon/WhatsApp her zaman e-postadan daha
// çok tercih edildiği için, bir form doldurmadan doğrudan mesaj atabilme.
//
// Kurumsal WhatsApp Business numarası — ülke koduyla, boşluksuz (ör.
// "905XXXXXXXXX"). Sabit boşken bileşen hiçbir şey render etmiyor (kırık/boş
// bir link göstermemek için); bu artık geçerli değil, numara tanımlı.
const WHATSAPP_NUMBER = "905425756918";
const DEFAULT_MESSAGE = "Merhaba, OtoHafıza hakkında bilgi almak istiyorum.";

export default function WhatsAppFloatButton() {
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp'tan bize yazın"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-1 ring-black/5 transition hover:bg-green-600 active:scale-95 sm:bottom-6 sm:left-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </Link>
  );
}
