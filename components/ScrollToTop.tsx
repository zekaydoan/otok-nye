"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/icons";

// Sayfa uzun içerikli sayfalarda (ana sayfa, SSS, dashboard listeleri vb.)
// aşağı kaydırıldığında kullanıcının başa dönmek için tekrar tekrar kaydırmak
// zorunda kalmaması için — sağ alt köşede, yalnızca belirli bir eşiğin
// (500px) altında görünen sabit bir "yukarı çık" butonu. app/layout.tsx'te
// global olarak render edilir, bu sayede tüm sayfalarda (public + dashboard +
// admin) otomatik olarak çalışır.
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Sayfanın başına dön"
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-1 ring-black/5 transition hover:bg-brand-700 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
