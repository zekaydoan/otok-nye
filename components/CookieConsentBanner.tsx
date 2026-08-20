"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Zorunlu olmayan (analitik/pazarlama) çerezlerin onaya bağlı yüklenmesi için
// — bkz. hukuki/07_Cerez_Politikasi.md Madde 4 ve components/AdPixels.tsx.
// Karar, `ok_cookie_consent` çerezine "granted"/"denied" olarak 1 yıllığına
// yazılır; AdPixels bu çerezi okuyup GA4/Meta Pixel'i yalnızca "granted"
// olduğunda yükler. Zorunlu (`ok_session`) çerez bu banner'dan etkilenmez —
// oturum yönetimi için KVKK m.5/2 kapsamında zaten ayrı rıza gerektirmiyor.
export const COOKIE_CONSENT_COOKIE = "ok_cookie_consent";
export const COOKIE_CONSENT_EVENT = "ok-cookie-consent-changed";

function readConsentCookie(): "granted" | "denied" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "granted" || value === "denied" ? value : null;
}

function writeConsentCookie(value: "granted" | "denied") {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Karar daha önce verilmişse banner hiç gösterilmez — yalnızca ilk
    // ziyarette (veya kullanıcı çerezleri temizlerse) tekrar sorulur.
    setVisible(readConsentCookie() === null);
  }, []);

  if (!visible) return null;

  function decide(value: "granted" | "denied") {
    writeConsentCookie(value);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Sitemizi kullanırken oturumunuzu yönetmek için zorunlu çerezler kullanılır. Analitik ve
          reklam performansı ölçümü için ek çerezleri yalnızca onayınızla yüklüyoruz. Ayrıntılar için{" "}
          <Link href="/cerez-politikasi" className="font-medium text-brand-600 underline">
            Çerez Politikası
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Yalnızca Zorunlu
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
