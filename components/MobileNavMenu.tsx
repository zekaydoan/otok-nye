"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";

// Header'daki Nasıl Çalışır/Kimler İçin/Fiyatlar/SSS linkleri sadece
// "sm:inline" ile görünür — mobilde (640px altında) tamamen kayboluyor ve
// yerlerine hiçbir alternatif (hamburger menü vb.) konmamıştı, yani mobil
// kullanıcı bu sayfalara header'dan hiç ulaşamıyordu (bkz. kullanıcının
// "mobil uyumluluğu kontrol ettin mi" sorusu üzerine yapılan inceleme). Bu
// bileşen sadece mobilde (sm:hidden) görünen bir hamburger buton + aşağı
// açılan basit bir panel sağlıyor; masaüstünde hiç render edilmiyor çünkü
// asıl linkler zaten sm:inline ile orada duruyor.
//
// V2 ana sayfa yeniden kurgusu (23 Ağustos 2026, Zeki onayı): link seti yeni
// bölüm sırasına göre güncellendi (Özellikler/Fiyatlandırma/İletişim/Blog ->
// Nasıl Çalışır/Kimler İçin/Fiyatlar/SSS + Giriş Yap + Partner Girişi). Alttaki
// "Ücretsiz Başla" butonu kaldırıldı — CTA artık header'da mobilde de her
// zaman görünen birincil buton olduğundan burada tekrarına gerek kalmadı.
const links = [
  { href: "#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "#kimler-icin", label: "Kimler İçin" },
  { href: "#fiyatlandirma", label: "Fiyatlar" },
  { href: "#sss", label: "SSS" },
  { href: "/giris", label: "Giriş Yap" },
  { href: "/partner-girisi", label: "Partner Girişi" },
];

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b bg-white px-4 py-3 shadow-lg">
          <nav className="flex flex-col divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
