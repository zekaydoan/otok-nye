"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";

// Header'daki Özellikler/Fiyatlandırma/İletişim/Blog linkleri sadece
// "sm:inline" ile görünürdü — mobilde (640px altında) tamamen kayboluyor ve
// yerlerine hiçbir alternatif (hamburger menü vb.) konmamıştı, yani mobil
// kullanıcı bu sayfalara header'dan hiç ulaşamıyordu (bkz. kullanıcının
// "mobil uyumluluğu kontrol ettin mi" sorusu üzerine yapılan inceleme). Bu
// bileşen sadece mobilde (sm:hidden) görünen bir hamburger buton + aşağı
// açılan basit bir panel sağlıyor; masaüstünde hiç render edilmiyor çünkü
// asıl linkler zaten sm:inline ile orada duruyor.
const links = [
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
  { href: "#iletisim", label: "İletişim" },
  { href: "/blog", label: "Blog" },
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
            {/* Header'da mobilde artık "Giriş Yap" öncelikli (düzenli
                kullanan bayiler için) — "Ücretsiz Başla" CTA'sı buraya,
                menünün en altına, öne çıkan bir buton olarak taşındı. */}
            <Link
              href="/kayit"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-brand-600 px-3 py-2.5 text-center font-semibold text-white hover:bg-brand-700"
            >
              Ücretsiz Başla
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
