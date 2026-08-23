"use client";

import { QRCodeSVG } from "qrcode.react";
import { BrandMark } from "@/components/icons";

// Ana sayfa hero'sundaki QR etiket önizleme kartı — dashboard'daki gerçek
// etiket tasarımının aynısı (bkz. components/StickerEditor.tsx): aynı
// QRCodeSVG, aynı marka başlığı, aynı TR plaka rozeti. Ayrı bir "use client"
// bileşeni olarak tutuluyor çünkü app/page.tsx bir server component ve
// QRCodeSVG'nin içeride hook kullanması (StickerEditor'da da bu yüzden
// "use client" var) server component ağacında hataya yol açabilir.
// Sadece geniş ekranlarda (lg+) gösteriliyor — önceki hero'daki yüzen
// kartların mobilde taşma sorunu yaşattığı biliniyor (bkz. geçmiş QA
// notları), aynı hatayı tekrar etmemek için. Mobilde QR anlatımı
// app/page.tsx içindeki metin rozeti ile zaten sağlanıyor.
export default function HeroQrPreview() {
  return (
    <div
      aria-hidden
      className="absolute right-10 top-14 hidden w-40 rotate-3 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white text-center shadow-2xl lg:flex xl:right-20"
    >
      <div className="flex items-center justify-center gap-1.5 bg-brand-700 py-1.5">
        <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
          <BrandMark className="h-2.5 w-2.5" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">Bakım Geçmişi</span>
      </div>
      <div className="flex flex-col items-center px-4 pb-3 pt-4">
        <div className="rounded-lg border-2 border-slate-800 bg-white p-1.5">
          <QRCodeSVG
            value="https://otohafiza.com"
            size={110}
            level="H"
            imageSettings={{ src: "/icon-512.png", height: 22, width: 22, excavate: true }}
          />
        </div>
        <div className="mt-3 flex overflow-hidden rounded-md border-2 border-slate-900">
          <div className="flex items-center bg-brand-700 px-1">
            <span className="text-[7px] font-bold leading-none text-white">TR</span>
          </div>
          <div className="bg-white px-3 py-1">
            <span className="text-lg font-extrabold tracking-wide text-slate-900">34 XX 000</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-500">QR kodu okutup bakım geçmişini görün</p>
      </div>
    </div>
  );
}
