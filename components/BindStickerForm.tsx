"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TR_BRANDS, TR_BRAND_MODELS, formatPlateForDisplay, validatePlate } from "@/lib/plates";
import { trackFirstVehicleAdded } from "@/components/AdPixels";

// Bayiye özel, plakasız basılmış bir etiket ilk kez okutulduğunda (bkz.
// app/e/[token]) bu form üzerinden aracın bilgileri girilir ve etiket o araca
// kalıcı olarak bağlanır (bkz. app/api/etiket-token/[token]/bind).
export default function BindStickerForm({ token }: { token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    ownerName: "",
    ownerPhone: "",
  });
  const [plateError, setPlateError] = useState<string | null>(null);
  const [ownerConsent, setOwnerConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modelSuggestions = useMemo(() => TR_BRAND_MODELS[form.brand] || [], [form.brand]);

  function handlePlateBlur() {
    if (!form.plate) return;
    const result = validatePlate(form.plate);
    setPlateError(result.valid ? null : result.message || null);
    if (result.valid) setForm({ ...form, plate: formatPlateForDisplay(result.normalized) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
    try {
      const res = await fetch(`/api/etiket-token/${token}/bind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plate: formatPlateForDisplay(plateCheck.normalized) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      if (data.isFirstVehicle) trackFirstVehicleAdded();
      router.push(`/dashboard/araclar/${data.vehicleId}`);
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
        {plateError && <p className="mt-1 text-xs text-red-600">{plateError}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Marka *</label>
          <input
            required
            list="bind-brand-list"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value, model: "" })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="Volkswagen"
          />
          <datalist id="bind-brand-list">
            {TR_BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Model *</label>
          <input
            required
            list="bind-model-list"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="Passat"
          />
          <datalist id="bind-model-list">
            {modelSuggestions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
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
          Araç sahibinin bilgilerinin dijital ortamda saklanacağı ve QR kod ile
          görüntülenebileceği konusunda kendisini bilgilendirdiğimi onaylıyorum.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Bağlanıyor..." : "Aracı Kaydet ve Etikete Bağla"}
      </button>
    </form>
  );
}
