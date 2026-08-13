"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function AdminPriceSetting({ currentPriceTry }: { currentPriceTry: number }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [value, setValue] = useState(String(currentPriceTry));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/etiket-fiyat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitPriceTry: Number(value) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Kaydedilemedi.");
        return;
      }
      showToast("Etiket fiyatı güncellendi.");
      router.refresh();
    } catch {
      setMessage("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div>
        <label className="block text-xs font-medium text-slate-600">Etiket Birim Fiyatı (₺)</label>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Kaydediliyor..." : "Fiyatı Güncelle"}
      </button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}
