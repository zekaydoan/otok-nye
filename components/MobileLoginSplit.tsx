"use client";

import { useState } from "react";
import Link from "next/link";

// Tek bir "Giriş Yap" butonu iki farklı kitleyi (bayi/usta ve saha partneri)
// aynı ekrana (/giris) yönlendiriyordu. Önce yalnızca mobilde bu şekildeydi,
// masaüstünde ayrı bir "Saha Partneri Girişi" linki vardı — ama iki ayrı link
// masaüstünde de yer kaplayıp düzeni kalabalıklaştırdığından, artık HER
// boyutta (mobil + masaüstü) aynı tek buton kullanılıyor: dokunulduğunda/
// tıklandığında "Kullanıcı Girişi"/"Saha Partneri Girişi" diye ikiye ayrılan
// küçük bir açılır menü açılıyor — MobileNavMenu.tsx'teki aynı açık/kapalı
// state deseni. Dosya adı "Mobile" ile başlıyor olsa da artık her ekran
// boyutunda kullanılıyor (yeniden adlandırmak yerine mevcut dosya korundu).
export default function MobileLoginSplit() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Giriş seçeneklerini kapat" : "Giriş seçeneklerini aç"}
        className="rounded-lg bg-accent-500 px-3 py-2 font-semibold text-white hover:bg-accent-600 sm:px-4"
      >
        Giriş Yap
      </button>

      {open && (
        <>
          {/* Menü dışına dokunulduğunda kapanması için tüm ekranı kaplayan
              görünmez bir katman — MobileNavMenu'de bu yok çünkü o zaten
              tam genişlikte bir panel, burada küçük bir açılır menü olduğu
              için dışına tıklamayı da yakalamak gerekiyor. */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
            <Link
              href="/giris"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Kullanıcı Girişi
              <span className="mt-0.5 block text-xs font-normal text-slate-400">
                Oto servis/tamirci hesabı
              </span>
            </Link>
            <div className="border-t border-slate-100" />
            <Link
              href="/partner-girisi"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-brand-600 hover:bg-slate-50"
            >
              Saha Partneri Girişi
              <span className="mt-0.5 block text-xs font-normal text-slate-400">
                Referans/komisyon paneli
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
