"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 10 * 1000;

interface ProvinceCount {
  province: string;
  count: number;
}

// Admin İstatistikler sayfasındaki diğer kartlar (bkz. app/admin/istatistikler/page.tsx)
// sunucuda bir kerelik hesaplanıp render edilir — bu kart ise "şu an" anlamını
// koruyabilmek için istemci tarafında periyodik olarak tazelenir (bkz.
// app/api/admin/active-visitors, lib/blobStore.ts getActiveVisitorStats). İl
// bazlı döküm (byProvince) yalnızca il bilgisi belirlenebilen sekmeleri
// listeler — toplam sayı (count) her zaman gerçek toplamı yansıtır, ikisi
// birbirini tutmayabilir (ör. "2 Kişi" ama listede tek il görünebilir).
export default function ActiveVisitorsCard({
  initialCount,
  initialByProvince,
}: {
  initialCount: number;
  initialByProvince: ProvinceCount[];
}) {
  const [count, setCount] = useState(initialCount);
  const [byProvince, setByProvince] = useState(initialByProvince);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/admin/active-visitors");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (typeof data.count === "number") setCount(data.count);
        if (Array.isArray(data.byProvince)) setByProvince(data.byProvince);
      } catch {
        // Sessizce yok say — bir sonraki taramada tekrar denenir.
      }
    }
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Şu An Sitede
      </p>
      <p className="mt-1 text-xl font-bold text-slate-900">{count}</p>
      {byProvince.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
          {byProvince.map((p) => (
            <li key={p.province} className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">{p.count} Kişi</span> {p.province}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
