"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 10 * 1000;

// Admin İstatistikler sayfasındaki diğer kartlar (bkz. app/admin/istatistikler/page.tsx)
// sunucuda bir kerelik hesaplanıp render edilir — bu kart ise "şu an" anlamını
// koruyabilmek için istemci tarafında periyodik olarak tazelenir (bkz.
// app/api/admin/active-visitors, lib/blobStore.ts getActiveVisitorCount).
export default function ActiveVisitorsCard({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/admin/active-visitors");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") setCount(data.count);
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
    </div>
  );
}
