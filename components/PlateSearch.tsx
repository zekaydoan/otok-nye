"use client";

import { useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { CarIcon } from "@/components/icons";

export default function PlateSearch({ currentShopId }: { currentShopId: string }) {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ found: boolean; vehicle?: Vehicle } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(plate)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      setResult(data);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-700">
        Plaka ile Ara — sistemde kayıtlı mı?
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Araç başka bir bayi tarafından eklenmiş olsa bile bulup bakım kaydı
        ekleyebilirsiniz; bu araç da sizin listenize eklenir.
      </p>
      <form onSubmit={handleSearch} className="mt-3 flex gap-2">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="34 ABC 123"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Aranıyor..." : "Ara"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result && result.found && result.vehicle && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 p-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{result.vehicle.plateDisplay}</p>
            <p className="text-xs text-slate-600">
              {result.vehicle.brand} {result.vehicle.model}
              {result.vehicle.createdByShopId !== currentShopId && (
                <span className="ml-1 text-slate-400">· başka bir bayi tarafından eklenmiş</span>
              )}
            </p>
          </div>
          <Link
            href={`/dashboard/araclar/${result.vehicle.id}`}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Görüntüle / Bakım Ekle
          </Link>
        </div>
      )}

      {result && !result.found && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <CarIcon className="h-4 w-4 text-slate-400" />
            Bu plaka sistemde kayıtlı değil.
          </p>
          <Link
            href={`/dashboard/araclar/yeni?plate=${encodeURIComponent(plate)}`}
            className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            Yeni Araç Olarak Ekle
          </Link>
        </div>
      )}
    </div>
  );
}
