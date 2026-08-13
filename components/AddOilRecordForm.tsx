"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resizeImageFile } from "@/lib/imageClient";
import { useToast } from "@/components/Toast";
import { StarIcon } from "@/components/icons";
import type { FavoriteOil } from "@/lib/types";

export default function AddOilRecordForm({
  vehicleId,
  hasOwnerPhone,
  favoriteOils = [],
}: {
  vehicleId: string;
  hasOwnerPhone: boolean;
  favoriteOils?: FavoriteOil[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteOil[]>(favoriteOils);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    oilBrand: "",
    oilModel: "",
    quantityKg: "",
    km: "",
    filterChanged: false,
    note: "",
    nextServiceDate: "",
    nextServiceKm: "",
    notifyOwner: true,
  });
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAddFavorite() {
    if (!form.oilBrand || !form.oilModel) return;
    setSavingFavorite(true);
    const res = await fetch("/api/shop/oils", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: form.oilBrand, model: form.oilModel }),
    });
    const data = await res.json();
    setSavingFavorite(false);
    if (res.ok) {
      setFavorites(data.favoriteOils || []);
      showToast("Sık kullanılanlara eklendi.");
    }
  }

  const isFavorite = favorites.some(
    (f) => f.brand === form.oilBrand && f.model === form.oilModel
  );

  async function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setPhoto: (v: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageFile(file);
      setPhoto(resized);
      setPhotoError(null);
    } catch {
      setPhotoError("Fotoğraf işlenemedi, tekrar deneyin.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/vehicles/${vehicleId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        nextServiceKm: form.nextServiceKm || undefined,
        nextServiceDate: form.nextServiceDate || undefined,
        beforePhoto,
        afterPhoto,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Bir hata oluştu.");
      return;
    }
    setOpen(false);
    setForm({
      ...form,
      oilBrand: "",
      oilModel: "",
      quantityKg: "",
      km: "",
      note: "",
      nextServiceDate: "",
      nextServiceKm: "",
    });
    setBeforePhoto(null);
    setAfterPhoto(null);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent-500 px-4 py-2 font-semibold text-white hover:bg-accent-600"
      >
        + Yağ Bakım Kaydı Ekle
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tarih *</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Saat *</label>
          <input
            required
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>
      {favorites.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-slate-500">Sık Kullandıklarım</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {favorites.map((f) => (
              <button
                key={`${f.brand}-${f.model}`}
                type="button"
                onClick={() => setForm({ ...form, oilBrand: f.brand, oilModel: f.model })}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  form.oilBrand === f.brand && form.oilModel === f.model
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.brand} {f.model}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <StarIcon className="h-3 w-3" />
          Yağ markası/modeli girip aşağıdan "sık kullanılanlara ekle" diyerek hızlı erişim
          listesi oluşturabilirsiniz.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Yağ Markası *</label>
          <input
            required
            value={form.oilBrand}
            onChange={(e) => setForm({ ...form, oilBrand: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="Castrol"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Yağ Modeli *</label>
          <input
            required
            value={form.oilModel}
            onChange={(e) => setForm({ ...form, oilModel: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="Edge 5W-30"
          />
        </div>
      </div>
      {form.oilBrand && form.oilModel && !isFavorite && (
        <button
          type="button"
          onClick={handleAddFavorite}
          disabled={savingFavorite}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-60"
        >
          {savingFavorite ? (
            "Ekleniyor..."
          ) : (
            <>
              <StarIcon className="h-3.5 w-3.5" />
              Bunu sık kullanılanlara ekle
            </>
          )}
        </button>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Miktar (kg) *</label>
          <input
            required
            type="number"
            step="0.1"
            min="0"
            value={form.quantityKg}
            onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="4.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kilometre</label>
          <input
            type="number"
            min="0"
            value={form.km}
            onChange={(e) => setForm({ ...form, km: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="85000"
          />
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 p-3">
        <p className="text-xs font-semibold text-brand-700">Sonraki Bakım Hatırlatması</p>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600">Önerilen Tarih</label>
            <input
              type="date"
              value={form.nextServiceDate}
              onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">Boş bırakılırsa +6 ay olarak ayarlanır.</p>
          </div>
          <div>
            <label className="block text-xs text-slate-600">Önerilen Km</label>
            <input
              type="number"
              min="0"
              value={form.nextServiceKm}
              onChange={(e) => setForm({ ...form, nextServiceKm: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">Boş bırakılırsa +10.000 km olarak ayarlanır.</p>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.filterChanged}
          onChange={(e) => setForm({ ...form, filterChanged: e.target.checked })}
        />
        Yağ filtresi de değiştirildi
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Öncesi Fotoğraf</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, setBeforePhoto)}
            className="mt-1 w-full text-xs"
          />
          {beforePhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beforePhoto} alt="Öncesi" className="mt-2 h-20 w-full rounded-lg object-cover" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sonrası Fotoğraf</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, setAfterPhoto)}
            className="mt-1 w-full text-xs"
          />
          {afterPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={afterPhoto} alt="Sonrası" className="mt-2 h-20 w-full rounded-lg object-cover" />
          )}
        </div>
      </div>
      {photoError && <p className="text-xs text-red-600">{photoError}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700">Not</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          rows={2}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.notifyOwner}
          onChange={(e) => setForm({ ...form, notifyOwner: e.target.checked })}
          disabled={!hasOwnerPhone}
        />
        Araç sahibine SMS ile bilgilendirme gönder
        {!hasOwnerPhone && (
          <span className="text-xs text-slate-400">(telefon numarası kayıtlı değil)</span>
        )}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
