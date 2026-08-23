"use client";

import { QRCodeSVG } from "qrcode.react";
import { BrandMark, CheckIcon } from "@/components/icons";

// Ana sayfa hero'sundaki hareketli QR akış kartı. Zeki'nin geri bildirimi:
// statik bir etiket görseli yetmiyordu, "oynayan hareketli ve site
// içerisinden örneklerle anlatan" bir şey istendi. Bu yüzden üç adımı
// (1. Etiketi yapıştır -> 2. Müşteri telefonla okutur -> 3. Bakım geçmişi
// açılır) tek kartta, saf CSS ile (globals.css .animate-hero-flow, aynı
// ticker-cycle tekniği) döngüsel olarak canlandırıyoruz. Adım 1 ve 3
// gerçek ürün bileşenlerinin BİREBİR aynısı: adım 1 components/
// StickerEditor.tsx'teki etiket tasarımı, adım 3 ScoreBadge.tsx'teki
// "Düzenli Bakımlı" rozet renkleri (bg-green-100 text-green-700) ve
// yeni demo GIF'te kullanılan gerçek örnek veri (34 YOS 07, Volkswagen
// Passat, Mobil 1 ESP 5W-40) — yani "site içinden örnek" isteği burada
// karşılanıyor. QRCodeSVG hook kullanabildiği için bu bileşen ayrı bir
// "use client" dosyası (app/page.tsx bir server component).
// Sadece geniş ekranlarda (lg+) gösteriliyor — önceki hero'daki yüzen
// kartların mobilde taşma sorunu yaşattığı biliniyor (bkz. geçmiş QA
// notları); mobilde QR anlatımı app/page.tsx içindeki metin rozeti ile
// zaten sağlanıyor.
export default function HeroQrPreview() {
  return (
    <div
      aria-hidden
      className="animate-float-badge absolute right-10 top-14 hidden w-44 rotate-2 lg:block xl:right-20"
    >
      <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
        {/* Adım 1/3 — Etiketi yapıştır (gerçek StickerEditor tasarımı) */}
        <div className="animate-hero-flow absolute inset-0 flex flex-col text-center">
          <div className="flex items-center justify-center gap-1.5 bg-brand-700 py-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
              <BrandMark className="h-2.5 w-2.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Bakım Geçmişi</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="rounded-lg border-2 border-slate-800 bg-white p-1.5">
              <QRCodeSVG
                value="https://otohafiza.com"
                size={92}
                level="H"
                imageSettings={{ src: "/icon-512.png", height: 18, width: 18, excavate: true }}
              />
            </div>
            <div className="mt-2.5 flex overflow-hidden rounded-md border-2 border-slate-900">
              <div className="flex items-center bg-brand-700 px-1">
                <span className="text-[7px] font-bold leading-none text-white">TR</span>
              </div>
              <div className="bg-white px-2.5 py-0.5">
                <span className="text-base font-extrabold tracking-wide text-slate-900">34 YOS 07</span>
              </div>
            </div>
            <p className="mt-2 px-2 text-[10px] font-medium text-slate-500">
              1. Etiketi motor kaputuna yapıştırın
            </p>
          </div>
        </div>

        {/* Adım 2/3 — Müşteri telefonla okutuyor */}
        <div
          className="animate-hero-flow absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-800 px-5 text-center"
          style={{ animationDelay: "-4s" }}
        >
          <div className="relative flex h-16 w-11 items-center justify-center rounded-lg border-2 border-white/40">
            <span className="absolute inset-x-1.5 top-1.5 h-px animate-pulse bg-accent-400" />
            <span className="h-1.5 w-1.5 rounded-full border border-white/50" />
          </div>
          <p className="text-xs font-semibold text-white">
            2. Müşteri telefonla
            <br />
            etiketi okutuyor
          </p>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400 [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400 [animation-delay:0.4s]" />
          </span>
        </div>

        {/* Adım 3/3 — Bakım geçmişi açılıyor (gerçek örnek veri) */}
        <div
          className="animate-hero-flow absolute inset-0 flex flex-col justify-center gap-2 bg-white px-3.5 text-left"
          style={{ animationDelay: "-8s" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wide text-slate-900">34 YOS 07</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700">
              Düzenli Bakımlı
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Volkswagen Passat (2019)</p>
          <div className="mt-1 rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="flex items-center gap-1 text-[10px] font-medium text-slate-700">
              <CheckIcon className="h-3 w-3 shrink-0 text-brand-600" />
              20.08.2026 · Mobil 1 ESP 5W-40
            </p>
          </div>
          <p className="text-[10px] font-medium text-slate-500">3. Bakım geçmişi anında açılır</p>
        </div>
      </div>
    </div>
  );
}
