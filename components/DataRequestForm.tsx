"use client";

import { useState } from "react";
import { DATA_REQUEST_TYPE_LABELS, type DataRequestType } from "@/lib/types";

// KVKK m.11 kapsamındaki ilgili kişi haklarını (bilgi edinme, silme) araç
// sahibinin bayiye/desteğe yazmadan doğrudan iletebilmesi için — bkz.
// app/api/vehicles/[id]/veri-talebi, app/admin/veri-talepleri. Opt-out
// düğmesiyle aynı göze batmayan üslup: bir bağlantı, açılınca küçük bir form.
export default function DataRequestForm({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DataRequestType>("bilgi");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/veri-talebi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, contactInfo, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gönderilemedi, lütfen tekrar deneyin.");
        return;
      }
      setSent(true);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-3 text-center text-xs text-green-700">
        Talebiniz alındı, girdiğiniz iletişim bilgisinden size dönüş yapılacak.
      </p>
    );
  }

  if (!open) {
    return (
      <p className="mt-3 text-center text-xs text-slate-400">
        <button type="button" onClick={() => setOpen(true)} className="underline hover:text-slate-600">
          Verilerim hakkında bir talebim var
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-left text-xs">
      <div>
        <label className="block font-medium text-slate-600">Talebiniz</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DataRequestType)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
        >
          {(Object.keys(DATA_REQUEST_TYPE_LABELS) as DataRequestType[]).map((t) => (
            <option key={t} value={t}>
              {DATA_REQUEST_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium text-slate-600">E-posta veya telefon</label>
        <input
          required
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Size dönüş yapabilmemiz için"
          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-medium text-slate-600">Not (opsiyonel)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 underline">
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>
    </form>
  );
}
