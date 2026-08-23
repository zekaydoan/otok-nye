"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { Appointment, Vehicle } from "@/lib/types";

// Plaka eşleştirmesi için boşlukları yok sayan, büyük harfe çeviren sade bir
// normalize — "45 abb999" da "45ABB999" da aynı aracı bulabilsin diye.
function normalizePlate(value: string): string {
  return value.toLocaleUpperCase("tr-TR").replace(/\s+/g, "");
}

export default function AppointmentForm({
  vehicles,
  onCreated,
}: {
  // V2 Paket 2: Plaka alanına yazarken bayinin kendi kayıtlı araçları içinde
  // sade bir eşleşme önerisi göstermek için (bkz. madde 2-3). Boş dizi
  // gönderilirse öneri listesi hiç görünmez, form eskisi gibi tamamen manuel
  // çalışmaya devam eder.
  vehicles: Vehicle[];
  // Randevu sunucuda oluşturulduğunda API'nin döndürdüğü tam nesneyi üst bileşene
  // iletir — liste, Netlify Blobs'un .list() gecikmesini beklemeden anında güncellenir
  // (bkz. VehicleDetailView / AddOilRecordForm'daki aynı desen).
  onCreated?: (appointment: Appointment) => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const now = new Date();
  const emptyForm = {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    plateDisplay: "",
    customerName: "",
    customerPhone: "",
    note: "",
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  // V2 Paket 2 madde 3/5: Kullanıcı öneri listesinden kayıtlı bir araç seçtiğinde
  // burada tutulur ve kayıt oluşturulurken API'ye gönderilir. Kullanıcı plaka
  // metnini elle değiştirirse (madde 4 — kayıtlı olmayan müşteri özgürlüğü
  // bozulmasın diye) hemen temizlenir.
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const plateSuggestions = useMemo(() => {
    const term = normalizePlate(form.plateDisplay);
    if (term.length < 2) return [];
    return vehicles
      .filter((v) => normalizePlate(v.plateDisplay).includes(term))
      .slice(0, 5);
  }, [form.plateDisplay, vehicles]);

  function selectVehicle(v: Vehicle) {
    setForm({
      ...form,
      plateDisplay: v.plateDisplay,
      customerName: v.ownerName || form.customerName,
      customerPhone: v.ownerPhone || form.customerPhone,
    });
    setSelectedVehicle(v);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/randevular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleId: selectedVehicle?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresBilling) {
          router.push(`/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent("/dashboard/randevular")}`);
          return;
        }
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      showToast("Randevu eklendi.");
      if (data.appointment) onCreated?.(data.appointment);
      setForm(emptyForm);
      setSelectedVehicle(null);
      setOpen(false);
    } catch {
      setError("Bağlantı hatası, randevu eklenemedi. Lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 active:scale-[0.98]"
      >
        + Randevu Ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700">Plaka</label>
          <input
            value={form.plateDisplay}
            onChange={(e) => {
              setForm({ ...form, plateDisplay: e.target.value });
              // Madde 4: kayıtlı olmayan müşteri için serbest metin girişi
              // korunur — kullanıcı seçtiği aracın plakasını elle değiştirirse
              // araç bağlantısı sessizce iptal edilir, randevu yine de manuel
              // olarak kaydedilebilir.
              if (selectedVehicle) setSelectedVehicle(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-brand-500 focus:outline-none"
            placeholder="34 ABC 123"
            autoComplete="off"
          />
          {/* V2 Paket 2 madde 2: Kendi işletmesine ait kayıtlı araçlar içinde
              sade bir eşleşme önerisi — yeni/büyük bir arama sistemi değil,
              zaten yüklenmiş olan araç listesi üzerinde basit bir filtre. */}
          {showSuggestions && plateSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              {plateSuggestions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectVehicle(v);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-brand-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{v.plateDisplay}</span>
                  <span className="text-xs text-slate-500">
                    {v.brand} {v.model} {v.year ? `(${v.year})` : ""}
                    {v.ownerName ? ` · ${v.ownerName}` : ""}
                    {v.ownerPhone ? ` · ${v.ownerPhone}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedVehicle && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-700">
              ✓ Kayıtlı araç seçildi
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="font-normal text-slate-400 underline hover:text-slate-600"
              >
                Değiştir
              </button>
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Müşteri Adı</label>
          <input
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="Ahmet Yılmaz"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Telefon</label>
        <input
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          placeholder="0555 000 00 00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Not</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          rows={2}
          placeholder="Örn. Ön fren balatası kontrolü istendi"
        />
      </div>

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
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
