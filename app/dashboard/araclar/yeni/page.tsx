"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TR_BRANDS, TR_BRAND_MODELS, formatPlateForDisplay, validatePlate } from "@/lib/plates";

export default function NewVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    plate: searchParams.get("plate")?.toUpperCase() || "",
    brand: "",
    model: "",
    year: "",
    ownerName: "",
    ownerPhone: "",
  });
  const [plateError, setPlateError] = useState<string | null>(null);
  const [ownerConsent, setOwnerConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingVehicleId, setExistingVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modelSuggestions = useMemo(() => {
    return TR_BRAND_MODELS[form.brand] || [];
  }, [form.brand]);

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
    if (!ownerConsent) {
      setError("Devam etmek için KVKK bilgilendirme onayını işaretleyin.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plate: formatPlateForDisplay(plateCheck.normalized) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Bir hata oluştu.");
      if (data.vehicleId) setExistingVehicleId(data.vehicleId);
      return;
    }
    router.push(`/dashboard/araclar/${data.vehicle.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="text-sm text-brand-600">
        ← Araçlarım
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Yeni Araç Ekle</h1>
      <p className="mt-1 text-sm text-slate-500">
        Araç bilgilerini girin. Kayıt sonrası QR etiketini yazdırabilirsiniz.
      </p>

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
            placeholder="34 ABC 123"
          />
          {plateError ? (
            <p className="mt-1 text-xs text-red-600">{plateError}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Format otomatik doğrulanır (il kodu + harf + rakam grubu).
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Marka *</label>
            <input
              required
              list="brand-list"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value, model: "" })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              placeholder="Volkswagen"
            />
            <datalist id="brand-list">
              {TR_BRANDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Model *</label>
            <input
              required
              list="model-list"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              placeholder="Passat"
            />
            <datalist id="model-list">
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
            placeholder="2019"
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
              Bakım hatırlatma SMS/WhatsApp göndermek için kullanılır.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={ownerConsent}
            onChange={(e) => setOwnerConsent(e.target.checked)}
          />
          <span>
            Araç sahibinin bilgilerinin (plaka, iletişim, bakım geçmişi) dijital ortamda
            saklanacağı, QR kod ile görüntülenebileceği ve bakım hatırlatması için
            kullanılabileceği konusunda kendisini bilgilendirdiğimi onaylıyorum. Detaylar:{" "}
            <Link href="/kvkk" target="_blank" className="font-medium text-brand-600 underline">
              KVKK Aydınlatma Metni
            </Link>
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600">
            {error}
            {existingVehicleId && (
              <>
                {" "}
                <Link
                  href={`/dashboard/araclar/${existingVehicleId}`}
                  className="font-semibold underline"
                >
                  Mevcut kayda git →
                </Link>
              </>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Aracı Kaydet"}
        </button>
      </form>
    </div>
  );
}
