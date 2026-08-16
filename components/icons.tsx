import type { SVGProps } from "react";

// Uygulama genelinde kullanılan tutarlı bir SVG ikon seti — daha önce dağınık
// şekilde tekrarlanan emoji simgeleri (📷 ⚠️ ✅ ✏️ 📄 ★ 🔒) ve kopyala-yapıştır
// SVG'lerin (ör. onay işareti path'i) yerini alır. Her ikon `currentColor`
// kullanır, boyut/renk çağıran tarafın className'i ile ayarlanır
// (ör. `<CheckIcon className="h-4 w-4 text-green-600" />`).
// SVGProps'un standart tip tanımı "title" özelliğini içermez (HTML elemanlarının
// aksine SVG'de bu React'in tip tanımlarına dahil edilmemiş) — ama tarayıcıda
// gayet geçerli bir tooltip özelliğidir (bkz. WarningIcon'un "Km tutarsızlığı"
// tooltip'i için kullanımı). Bu yüzden burada tip tanımına elle ekleniyor.
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12.5 2.5 2.5L16.5 9" />
    </svg>
  );
}

// Pazarlama sayfasındaki "elle defter tutmanın dezavantajları" karşılaştırma
// listesinde (bkz. app/page.tsx) CheckCircleIcon'un olumsuz karşılığı olarak
// kullanılır.
export function XCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.3 21.6 20H2.4L12 3.3Z" />
      <path strokeLinecap="round" d="M12 9.5v4" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="4" y="9" width="12" height="8" rx="1.5" />
      <path strokeLinecap="round" d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m13.3 3.7 3 3L7.6 15.4l-4 1 1-4L13.3 3.7Z"
      />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7.3A1.3 1.3 0 0 1 5.3 6h1.4l.7-1.2a1 1 0 0 1 .86-.5h3.48a1 1 0 0 1 .86.5L13.3 6h1.4A1.3 1.3 0 0 1 16 7.3v6.4A1.3 1.3 0 0 1 14.7 15H5.3A1.3 1.3 0 0 1 4 13.7V7.3Z"
      />
      <circle cx="10" cy="10.4" r="2.5" />
    </svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.5h5.5l3 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 3.5V7h3M7.3 11h5.4M7.3 13.5h5.4" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M10 2.3 12.3 7l5.2.6-3.8 3.6.9 5.1L10 13.8 5.4 16.3l.9-5.1L2.5 7.6 7.7 7 10 2.3Z" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 15.5 5 10a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 10l1.5 5.5M5.2 15.5h13.6a1 1 0 0 1 1 1v2.3a1 1 0 0 1-1 1h-1.1a1 1 0 0 1-1-1v-1H7.3v1a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1v-2.3a1 1 0 0 1 1-1Z"
      />
      <circle cx="7.7" cy="17.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.3" cy="17.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7.5 8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5v9l8 4 8-4v-9M12 11.5v9" />
    </svg>
  );
}

// "Nasıl çalışır?" adımlarındaki "araca yapıştırın" aşaması için — köşesi
// kıvrılmış bir etiket/sticker glifi.
export function StickerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 4.5h9.5L19.5 10v9.5h-15v-15Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4.5V10h5.5" />
    </svg>
  );
}

// WhatsApp/mesajlaşma bildirimlerini temsil eden basit bir konuşma balonu.
export function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.1 0-2.2-.2-3.1-.7L4 20l1.1-4.4A7.9 7.9 0 0 1 4 12Z"
      />
      <path strokeLinecap="round" d="m8.5 10.5 1.6 1.6L15.5 8" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path
        strokeLinecap="round"
        d="M10 2.8v1.7M10 15.5v1.7M17.2 10h-1.7M4.5 10H2.8M15.1 4.9l-1.2 1.2M6.1 13.9l-1.2 1.2M15.1 15.1l-1.2-1.2M6.1 6.1 4.9 4.9"
      />
    </svg>
  );
}

// Sesli kayıt girişi (bkz. components/VoiceInputButton) — bir form alanının
// yanında dikte etmeyi başlatan mikrofon düğmesi için.
export function MicIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="7.3" y="2.8" width="5.4" height="9" rx="2.7" />
      <path strokeLinecap="round" d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.3M7.3 17.3h5.4" />
    </svg>
  );
}

// Randevu/takvim ekranları için — dashboard başlığındaki nav bağlantısı ve
// "Yaklaşan Randevu Yok" boş durum kartında kullanılır (bkz. AppointmentsSection).
export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path strokeLinecap="round" d="M3 8h14M6.5 2.8v3M13.5 2.8v3" />
    </svg>
  );
}

// Pazarlama sayfasındaki özellik kartları (bkz. app/page.tsx) ve çoklu çalışan
// ekranı için — birden fazla kişiyi/ekibi temsil eder.
export function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.3a3 3 0 0 1 0 5.9M17.8 19.5a5.3 5.3 0 0 0-3.3-4.9" />
    </svg>
  );
}

// Toplu araç içe aktarma özelliği (bkz. app/dashboard/araclar/toplu-ekle) için.
export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V4M8 8l4-4 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />
    </svg>
  );
}

// Otomatik hatırlatma (km/tarih bazlı, WhatsApp) özellikleri için.
export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5a6 6 0 0 1 12 0c0 4 1.3 5.3 1.5 5.8H4.5C4.7 15.8 6 14.5 6 10.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

// Bakım düzenliliği skoru / satış raporu gibi özet-istatistik özellikleri için.
export function ChartBarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V11M12 20V4M20 20v-7" />
    </svg>
  );
}

// QR etiket özelliği (bkz. app/page.tsx özellik kartları, StickerEditor) için —
// sadeleştirilmiş bir QR kare deseni.
export function QrIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path strokeLinecap="round" d="M14.5 15h2.5v2.5M20.5 15v2M14.5 20.5h3M19 20.5h1.5v-2" />
    </svg>
  );
}

// Referans/tavsiye programı teaser sayfası için (bkz. app/referans/page.tsx).
export function GiftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1.5" />
      <path strokeLinecap="round" d="M4 13.5h16" />
      <path strokeLinecap="round" d="M12 9.5v10.5" />
      <path d="M12 9.5c-1-2.5-3-3.5-4.2-3-1.2.5-1.5 2.2.2 3H12Z" />
      <path d="M12 9.5c1-2.5 3-3.5 4.2-3 1.2.5 1.5 2.2-.2 3H12Z" />
    </svg>
  );
}

// Sağ altta sabit duran WhatsApp destek butonu için (bkz.
// components/WhatsAppFloatButton.tsx) — ChatIcon'dan farklı olarak WhatsApp'ın
// klasik "konuşma balonu içinde ahize" silueti, marka tanınırlığı için.
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Zm0 1.8a7.7 7.7 0 0 1 6.5 11.8 7.7 7.7 0 0 1-8.9 3l-.4-.1-2.8.8.8-2.7-.2-.4A7.7 7.7 0 0 1 12 4.3Zm-3 3.5c-.2 0-.5.1-.7.3-.2.3-.9.8-.9 2s.9 2.3 1 2.5c.1.1 1.8 2.8 4.3 3.9.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3l-1.9-.9c-.3-.1-.5-.1-.6.1l-.4.5c-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.7-.1-.2 0-.4.1-.5l.3-.4c.1-.1.1-.3.1-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5Z" />
    </svg>
  );
}

// Footer'daki sosyal medya bağlantıları için (bkz. app/page.tsx) — Instagram'ın
// klasik kamera/çerçeve silueti, dış hatlarla (stroke) çizili.
export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Footer'daki sosyal medya bağlantıları için — Facebook'un klasik "f" logosu,
// dolu (solid) silüet olarak marka tanınırlığı için.
export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34v7.03C18.34 21.21 22 17.06 22 12.06Z" />
    </svg>
  );
}

// Mobil header'daki hamburger menü butonu için (bkz. components/MobileNavMenu.tsx).
export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// Mobil menü açıkken hamburger ikonunun yerini alan kapatma çarpısı.
export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Sayfayı en yukarı kaydırma butonu için (bkz. components/ScrollToTop.tsx).
export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 16V4M4.5 9.5 10 4l5.5 5.5" />
    </svg>
  );
}

// Ana sayfadaki İletişim bölümü için (bkz. app/page.tsx) — ileride telefon
// numarası eklendiğinde yanına PhoneIcon benzeri bir ikon daha eklenebilir.
export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 5.5 7 5.5 7-5.5" />
    </svg>
  );
}

// Öneri/geri bildirim ekranı (bkz. app/dashboard/oneriler) için — dashboard
// başlığındaki nav bağlantısında ve boş durum kartında kullanılır.
export function LightbulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 2.8a5 5 0 0 0-3 9c.6.5 1 1.2 1 2v.4h4v-.4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9Z"
      />
      <path strokeLinecap="round" d="M8.3 16.8h3.4M8.8 18.4h2.4" />
    </svg>
  );
}

// Marka rozeti (bkz. components/Logo.tsx) — jenerik "OK" baş harf kutusu yerine
// yağ damlası + onay işareti birleşimi: "yağ bakımı tamamlandı, kayıt altında"
// fikrini tek bir işarette somutlaştırır. Tek renk (currentColor) kullanır, bu
// yüzden marka rengi zemin üzerinde beyaz olarak kullanılır.
export function BrandMark(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 3.4c-1.3 2.1-5.1 7.7-5.1 11.1a5.1 5.1 0 0 0 10.2 0c0-3.4-3.8-9-5.1-11.1Z" />
      <path d="M9.3 13.7l1.9 1.9 3.5-3.9" />
    </svg>
  );
}

// "Yeni ekle" eylemleri (bkz. dashboard hızlı işlemler satırı) için basit artı işareti.
export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Veri dışa aktarma (CSV indirme) eylemleri için — UploadIcon'un ters yönlü eşi.
export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11M8 11l4 4 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />
    </svg>
  );
}
