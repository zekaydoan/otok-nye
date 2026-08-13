import type { SVGProps } from "react";

// Uygulama genelinde kullanılan tutarlı bir SVG ikon seti — daha önce dağınık
// şekilde tekrarlanan emoji simgeleri (📷 ⚠️ ✅ ✏️ 📄 ★ 🔒) ve kopyala-yapıştır
// SVG'lerin (ör. onay işareti path'i) yerini alır. Her ikon `currentColor`
// kullanır, boyut/renk çağıran tarafın className'i ile ayarlanır
// (ör. `<CheckIcon className="h-4 w-4 text-green-600" />`).
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
