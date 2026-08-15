"use client";

import { useEffect } from "react";

const SESSION_ID_KEY = "otoHafizaVisitorSessionId";
const HEARTBEAT_INTERVAL_MS = 30 * 1000;

function getOrCreateSessionId(): string | null {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return null; // sessionStorage kapalıysa (gizli sekme kısıtlaması vb.) sessizce vazgeç.
  }
}

// Site genelinde tek bir yerden (bkz. app/layout.tsx) render edilen, görünmez bir
// izleyici — admin panelindeki "Şu An Sitede" sayacı için (bkz.
// app/api/admin/active-visitors, components/ActiveVisitorsCard.tsx). Sekme açık
// olduğu sürece her 30 saniyede bir sunucuya "hâlâ buradayım" sinyali gönderir;
// sekme kapanınca (ya da 5 dakika sinyal gelmeyince) sunucu tarafında otomatik
// düşer (bkz. lib/blobStore.ts getActiveVisitorCount). Sekme arka plandayken
// gereksiz istek atmamak için document.visibilityState kontrol edilir.
export default function ActiveVisitorTracker() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    function sendHeartbeat() {
      if (document.visibilityState !== "visible") return;
      const body = JSON.stringify({ sessionId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/heartbeat", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/analytics/heartbeat", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    }

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", sendHeartbeat);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", sendHeartbeat);
    };
  }, []);

  return null;
}
