"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TR_BRANDS, TR_BRAND_MODELS, formatPlateForDisplay, validatePlate } from "@/lib/plates";
import type { Vehicle } from "@/lib/types";

export default function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [form, setForm] = useState({
    plate: vehicle.plateDisplay,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year || "",
    ownerName: vehicle.ownerName || "",
    ownerPhone: vehicle.ownerPhone || "",
  });
  const [plateError, setPlateError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingVehicleId, setExistingVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modelSuggestions = useMemo(() => TR_BRAND_MODELS[form.brand] || [], [form.brand]);

  function handlePlateBlur() {
    if (!form.plate) return;
    const result = validatePlate(form.plate);
    setPlateError(result.valid ? null : result.message || null);
    if (result.valid) {
      setForm({ ...form, plate: formatPlateForDisplay(result.normalized) });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExistingVehicleId(null);

    const plateCheck = validatePlate(form.plate);
    if (!plateCheck.valid) {
      setPlateError(plateCheck.message || "Geçersiz plaka.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plate: formatPlateForDisplay(plateCheck.normalized) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        if (data.vehicleId) setExistingVehicleId(data.vehicleId);
        return;
      }

      const query = data.plateChanged ? "?plakaGuncellendi=1" : "";
      router.push(`/dashboard/araclar/${vehicle.id}${query}`);
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Plaka *</label>
        <input
          required
          value={form.plate}
          onChange={(e) => {
            setForm({ ...form, plate: e.target.value });
            setPlateError(null);
          }}
          onBlur={handlePlateBlur}
          className={`mt-1 w-full rounded-lg border px-3 py-2 uppercase focus:outline-none ${
            plateError ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-brand-500"
          }`}
        />
        {plateError ? (
          <p className="mt-1 text-xs text-red-600">{plateError}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            Araç satıldıysa yeni plakayı buraya girin — QR etiketindeki bağlantı değişmez,
            yalnızca etiketin üzerindeki baskı güncelliğini yitirir.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Marka *</label>
          <input
            required
            list="brand-list-edit"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value, model: "" })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <datalist id="brand-list-edit">
            {TR_BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Model *</label>
          <input
            required
            list="model-list-edit"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <datalist id="model-list-edit">
            {modelSuggestions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Model Yılı</label>
        <input
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Araç Sahibi</label>
          <input
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sahip Telefonu</label>
          <input
            value={form.ownerPhone}
            onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="05XX XXX XX XX"
          />
          <p className="mt-1 text-xs text-slate-400">
            Araç satıldıysa yeni sahibinin telefonunu girmeyi unutmayın — bakım
            hatırlatmaları buraya gider.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
          {existingVehicleId && (
            <>
              {" "}
              <Link href={`/dashboard/araclar/${existingVehicleId}`} className="font-semibold underline">
                Mevcut kayda git →
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
        <Link
          href={`/dashboard/araclar/${vehicle.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-600 hover:bg-slate-50"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
