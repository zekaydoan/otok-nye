"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Bayiye/siparişe bağlı olmayan "genel stok" QR etiket partisi oluşturur (bkz.
// lib/types.ts StickerStockBatch — Zeki'nin 20 Ağustos 2026 talebi: "Hiçbir
// bayiye bağlı olmayan, genel stok etiket"). AdminGiftStickerForm'dan farkı: bayi
// seçimi ve teslimat adresi YOK — çünkü bu etiketler henüz hiçbir bayiye ait değil,
// admin kendi matbaasından bastırıp elinde tutacak. Oluşturulduktan sonra
// /admin/stok/[batchId] sayfasında görüntülenip yazdırılabilir.
export default function AdminStockStickerForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("50");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Geçerli bir adet giriniz.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/etiket-stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty, note: note || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Kaydedilemedi.");
        return;
      }
      const data = await res.json();
      showToast(`${qty} adet genel stok etiketi oluşturuldu.`);
      setQuantity("50");
      setNote("");
      setOpen(false);
      router.push(`/admin/stok/${data.batch.id}`);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-slate-100 hover:bg-brand-50"
      >
        📦 Genel Stok Etiket Oluştur
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">📦 Genel Stok Etiket Oluştur</p>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Kapat
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Hiçbir bayiye bağlı değildir — kendi matbaanızdan bastırıp stokta
        tutabilirsiniz. Bir bayi bu etiketlerden birini bir araca ilk kez
        bağladığında etiket o bayiye kalıcı olarak atanır.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600">Adet</label>
          <input
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Not (opsiyonel)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ör. Ağustos matbaa baskısı"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Oluşturuluyor..." : "Parti Oluştur"}
        </button>
      </div>
    </div>
  );
}
