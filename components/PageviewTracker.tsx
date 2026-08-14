"use client";

import { useEffect } from "react";

const SESSION_FLAG_KEY = "otoHafizaPageviewSent";

// Site genelinde tek bir yerden (bkz. app/layout.tsx) render edilen, görünmez bir
// izleyici. Basit ve gizlilik dostu tutulmak için: kişi bazlı değil, günlük toplam
// sayaç tutar (bkz. lib/blobStore.ts incrementDailyPageview) ve aynı sekmede
// sayfalar arası gezinirken tekrar tekrar saymamak için sessionStorage'a bir bayrak
// bırakır — bu bayrak sekme kapanınca silinir, kişisel veri veya kalıcı tanımlayıcı
// değildir.
export default function PageviewTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_FLAG_KEY)) return;
      sessionStorage.setItem(SESSION_FLAG_KEY, "1");
    } catch {
      // sessionStorage kapalıysa (gizli sekme kısıtlaması vb.) sessizce vazgeç,
      // sayaç eksik kalır ama sayfa hiçbir şekilde etkilenmez.
    }

    const body = JSON.stringify({});
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/pageview", blob);
    } else {
      fetch("/api/analytics/pageview", { method: "POST", body, keepalive: true }).catch(() => {
        // Sessizce yok say — analitik hiçbir zaman kullanıcı deneyimini bozmamalı.
      });
    }
  }, []);

  return null;
}
