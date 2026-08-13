"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { PencilIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/types";

// Araç detay sayfasındaki "Güncel Km" alanı — tam bir bakım kaydı eklemeden,
// araç sadece kontrole/muayeneye geldiğinde kilometreyi hızlıca güncellemek
// içindir. Bu değer km bazlı bakım hatırlatmasının (bkz.
// listUpcomingServicesForShop) girdisidir; bir bakım kaydı eklenirken zaten
// otomatik güncellendiği için (bkz. createOilRecord) burası daha çok "ara
// ziyaret" senaryosu için var.
export default function VehicleKmUpdate({
  vehicleId,
  initialKm,
  onUpdated,
}: {
  vehicleId: string;
  initialKm?: number;
  onUpdated?: (vehicle: Vehicle) => void;
}) {
  const { showToast } = useToast();
  const [km, setKm] = useState<number | undefined>(initialKm);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialKm ? String(initialKm) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/km`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ km: Number(value) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Güncellenemedi.");
        return;
      }
      setKm(data.vehicle.lastKnownKm);
      onUpdated?.(data.vehicle);
      showToast("Güncel km güncellendi.");
      setEditing(false);
    } catch {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <p className="text-xs text-slate-400">Güncel Km</p>
        <button
          type="button"
          onClick={() => {
            setValue(km ? String(km) : "");
            setError(null);
            setEditing(true);
          }}
          className="mt-0.5 flex items-center gap-1 text-lg font-bold text-slate-900 hover:text-brand-700"
        >
          {km ? `${km.toLocaleString("tr-TR")} km` : "—"}
          <PencilIcon className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-wrap items-center gap-1.5">
      <input
        autoFocus
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
        placeholder="85000"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "..." : "Kaydet"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        disabled={loading}
        className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-60"
      >
        Vazgeç
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
