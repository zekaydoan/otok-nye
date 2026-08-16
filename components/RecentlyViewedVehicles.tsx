"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CarIcon } from "@/components/icons";
import { readRecentVehicles, type RecentVehicleEntry } from "@/lib/recentVehicles";

// bkz. lib/recentVehicles.ts — veri sunucudan gelmiyor, tarayıcının
// localStorage'ından okunuyor, bu yüzden istemci bileşeni ve mount-sonrası
// okuma gerekiyor (VehicleListSection'daki sessionStorage deseniyle aynı mantık).
export default function RecentlyViewedVehicles() {
  const [items, setItems] = useState<RecentVehicleEntry[]>([]);

  useEffect(() => {
    setItems(readRecentVehicles());
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Son görüntülediğiniz araçlar
      </h2>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {items.map((v) => (
          <Link
            key={v.id}
            href={`/dashboard/araclar/${v.id}`}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100 hover:ring-brand-300"
          >
            <CarIcon className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{v.plateDisplay}</span>
            <span className="text-xs text-slate-400">
              {v.brand} {v.model}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
