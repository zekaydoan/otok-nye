import { BrandMark, CheckIcon } from "@/components/icons";

// Giriş/Kayıt sayfalarının geniş ekranda sağ tarafında görünen, markayla uyumlu
// tanıtım paneli. Sunucu tarafında render edilebilir (hook kullanmaz), bu yüzden
// "use client" sayfaların içine doğrudan gömülebilir. Küçük ekranlarda gizlenir
// (formun tamamı tek sütunda kalır) — bkz. "lg:flex" kullanım şekli.
export default function AuthSidePanel({
  tagline,
  points,
}: {
  tagline: string;
  points: string[];
}) {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl bg-brand-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl"
      />

      <div className="relative">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
          <BrandMark className="h-5 w-5" />
        </span>
        <p className="mt-8 text-2xl font-bold leading-snug">{tagline}</p>
      </div>

      <ul className="relative mt-10 space-y-4">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm text-brand-50">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
            {point}
          </li>
        ))}
      </ul>

      <div className="relative mt-10 rounded-xl bg-white/10 p-4 text-xs text-brand-50">
        Her araca özel bir QR kod üretin — okutulduğunda plaka, marka, model ve
        tüm yağ bakım geçmişi otomatik olarak ekrana gelir.
      </div>
    </div>
  );
}
