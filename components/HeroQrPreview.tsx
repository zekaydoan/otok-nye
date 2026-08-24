"use client";

import { QRCodeSVG } from "qrcode.react";
import { BrandMark, CheckIcon, DocumentIcon, WhatsAppIcon } from "@/components/icons";

// Ana sayfa hero'sundaki hareketli akış kartı. Zeki'nin geri bildirimi
// (2. tur): "usta"ya (ürünü satın alan bayi sahibi) TAM OLARAK GÖREVİNİ
// anlatan bir tasarım istendi — önceki sürümde adım 2 ("müşteri telefonla
// okutuyor") aracın SAHİBİNİN eylemiydi, ustanın değil, bu yüzden kafa
// karıştırıyordu. Şimdi üç adımın ÜÇÜ DE ustanın kendi panelde yaptığı
// gerçek işler, hero'nun kendi başlığıyla ("Bakım zamanı gelen
// müşterinizi kaybetmeyin") birebir örtüşüyor:
//   1. Bakımı panele kaydet   — bkz. components/AddOilRecordForm.tsx
//      ("+ Bakım Kaydı Ekle" butonu, aynı accent-500 rengi)
//   2. QR etiketi yapıştır    — bkz. components/StickerEditor.tsx (aynı kart)
//   3. Zamanı gelince hatırlat — bkz. components/WhatsAppReminderButton.tsx
//      (aynı yeşil "WhatsApp'tan Hatırlat" rozeti + gerçek "Sonraki Bakım"
//      ifadesi, bkz. VehicleDetailView.tsx)
// Üç panel de saf CSS ile (globals.css .animate-hero-flow, ticker-cycle
// tekniği) döngüsel olarak sırayla belirir/kaybolur. QRCodeSVG hook
// kullanabildiği için bu bileşen ayrı bir "use client" dosyası (app/
// page.tsx bir server component). Sadece geniş ekranlarda (lg+)
// gösteriliyor — önceki hero'daki yüzen kartların mobilde taşma sorunu
// yaşattığı biliniyor (bkz. geçmiş QA notları); mobilde QR anlatımı
// app/page.tsx içindeki metin rozeti ile zaten sağlanıyor.
export default function HeroQrPreview() {
  return (
    <div
      aria-hidden
      className="animate-float-badge absolute right-10 top-14 hidden w-48 rotate-2 lg:block xl:right-20"
    >
      <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
        {/* Adım 1/3 — Bakımı panele kaydet (gerçek "+ Bakım Kaydı Ekle" rengi) */}
        <div className="animate-hero-flow absolute inset-0 flex flex-col bg-white px-4 pt-4 text-left">
          <div className="flex items-center gap-1.5 text-slate-900">
            <DocumentIcon className="h-4 w-4 text-accent-600" />
            <span className="text-xs font-bold">Bakım Kaydı</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="rounded-md bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
              Yağ: Mobil 1 ESP 5W-40
            </div>
            <div className="rounded-md bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
              Km: 62.000
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-accent-500 py-2 text-center text-[11px] font-bold text-white">
            + Bakım Kaydı Ekle
          </div>
          <p className="mt-auto pb-4 text-[10px] font-medium text-slate-500">
            1. Yaptığınız bakımı panele kaydedin
          </p>
        </div>

        {/* Adım 2/3 — QR etiketi yapıştır (gerçek StickerEditor tasarımı) */}
        <div
          className="animate-hero-flow absolute inset-0 flex flex-col bg-white text-center"
          style={{ animationDelay: "-4s" }}
        >
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
          </div>
          <p className="pb-4 text-[10px] font-medium text-slate-500">2. Aracına QR etiketi yapıştırın</p>
        </div>

        {/* Adım 3/3 — Zamanı gelince hatırlat (gerçek WhatsAppReminderButton) */}
        <div
          className="animate-hero-flow absolute inset-0 flex flex-col bg-white px-4 pt-4 text-left"
          style={{ animationDelay: "-8s" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wide text-slate-900">34 YOS 07</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700">
              Düzenli Bakımlı
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">Volkswagen Passat (2019)</p>
          <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
            <p className="text-[10px] font-semibold text-amber-800">Sonraki Bakım</p>
            <p className="text-[10px] text-amber-700">12.500 km kaldı</p>
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-green-300 bg-green-50 py-2 text-[11px] font-semibold text-green-700">
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp'tan Hatırlat
          </div>
          <p className="mt-auto flex items-center gap-1 pb-4 text-[10px] font-medium text-slate-500">
            <CheckIcon className="h-3 w-3 shrink-0 text-brand-600" />
            3. Zamanı gelince tek tıkla hatırlatın
          </p>
        </div>
      </div>
    </div>
  );
}
