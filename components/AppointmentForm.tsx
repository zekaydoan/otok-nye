"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { Appointment } from "@/lib/types";

export default function AppointmentForm({
  onCreated,
}: {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/randevular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Plaka</label>
          <input
            value={form.plateDisplay}
            onChange={(e) => setForm({ ...form, plateDisplay: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            placeholder="34 ABC 123"
          />
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
