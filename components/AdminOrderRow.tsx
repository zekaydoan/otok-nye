"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STICKER_ORDER_STATUS_LABELS, type StickerOrder, type StickerOrderStatus } from "@/lib/types";
import { stickerOrderStatusBadgeClass } from "@/lib/stickerOrderUi";
import { useToast } from "@/components/Toast";

export default function AdminOrderRow({ order }: { order: StickerOrder }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<StickerOrderStatus>(order.status);
  const [trackingCarrier, setTrackingCarrier] = useState(order.trackingCarrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/siparisler/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingCarrier, trackingNumber }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kaydedilemedi.");
      return;
    }
    showToast("Sipariş güncellendi.");
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {order.shopName} — {order.quantity} adet — {order.totalPriceTry.toFixed(2)}₺
          </p>
          <p className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleString("tr-TR")} · Sipariş #{order.id.slice(0, 8)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            <br />
            {order.shippingAddress.addressLine}, {order.shippingAddress.district}/{order.shippingAddress.city}
            {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stickerOrderStatusBadgeClass(order.status)}`}
        >
          {STICKER_ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StickerOrderStatus)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            {(Object.keys(STICKER_ORDER_STATUS_LABELS) as StickerOrderStatus[]).map((key) => (
              <option key={key} value={key}>
                {STICKER_ORDER_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Kargo Firması</label>
          <input
            value={trackingCarrier}
            onChange={(e) => setTrackingCarrier(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Takip No</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Güncelle"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
