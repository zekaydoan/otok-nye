"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STICKER_ORDER_STATUS_LABELS, type StickerOrder, type StickerOrderStatus } from "@/lib/types";
import { stickerOrderStatusBadgeClass } from "@/lib/stickerOrderUi";
import { useToast } from "@/components/Toast";

// Kalıcı silme yalnızca hiç ödemesi alınmamış siparişler için sunulur (bkz.
// lib/blobStore.ts deleteStickerOrder) — istemci tarafı bu kontrolü yalnızca
// butonu göstermek/gizlemek için yapar, gerçek koruma sunucu tarafındadır.
const PAID_STATUSES: StickerOrderStatus[] = ["odendi", "hazirlaniyor", "kargoda", "teslim_edildi"];

export default function AdminOrderRow({ order }: { order: StickerOrder }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<StickerOrderStatus>(order.status);
  const [trackingCarrier, setTrackingCarrier] = useState(order.trackingCarrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [refunded, setRefunded] = useState(!!order.refundedAt);
  const [refundAmountTry, setRefundAmountTry] = useState(
    order.refundAmountTry ?? order.totalPriceTry
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const canDelete = !PAID_STATUSES.includes(order.status) && !order.cancelledWithPayment;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/siparisler/${order.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Silinemedi.");
        setConfirmingDelete(false);
        return;
      }
      setDeleted(true);
      showToast("Sipariş silindi.");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/siparisler/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingCarrier,
          trackingNumber,
          refunded,
          refundAmountTry: refunded ? refundAmountTry : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Kaydedilemedi.");
        return;
      }
      showToast("Sipariş güncellendi.");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (deleted) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            {order.shopName} — {order.quantity} adet —{" "}
            {order.isGift ? "Ücretsiz (hediye)" : `${order.totalPriceTry.toFixed(2)}₺`}
            {order.isGift && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                🎁 Hediye
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleString("tr-TR")} · Sipariş #{order.id.slice(0, 8)}
          </p>
          {order.adminNote && (
            <p className="mt-1 text-xs italic text-slate-400">Not: {order.adminNote}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            <br />
            {order.shippingAddress.addressLine}, {order.shippingAddress.district}/{order.shippingAddress.city}
            {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Etikette: {order.labelName || order.shopName} · {order.labelPhone || order.shippingAddress.phone}
          </p>
          <Link
            href={`/admin/siparisler/${order.id}/etiketler`}
            className="mt-1 inline-block text-xs font-semibold text-brand-600 underline"
          >
            Etiket QR listesini görüntüle ({order.quantity})
          </Link>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stickerOrderStatusBadgeClass(order.status)}`}>
            {STICKER_ORDER_STATUS_LABELS[order.status]}
          </span>
          {order.refundedAt && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              ↩ {order.refundAmountTry?.toFixed(2)}₺ iade edildi
            </span>
          )}
        </div>
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

      {status === "iptal" && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3">
          {order.cancelledBy === "bayi" && (
            <p className="w-full text-xs text-slate-500">
              Bayi tarafından panelden iptal edildi
              {order.cancelledAt
                ? ` — ${new Date(order.cancelledAt).toLocaleString("tr-TR")}`
                : ""}
              .
            </p>
          )}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={refunded}
              onChange={(e) => setRefunded(e.target.checked)}
            />
            Ödeme bankadan/iyzico panelinden elle iade edildi
          </label>
          {refunded && (
            <div>
              <label className="block text-xs font-medium text-slate-600">İade Tutarı (₺)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={refundAmountTry}
                onChange={(e) => setRefundAmountTry(Number(e.target.value))}
                className="mt-1 w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {canDelete && (
        <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Siparişi kalıcı olarak sil
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Emin misiniz? Bu işlem geri alınamaz.
              </span>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-xs font-medium text-slate-500 hover:underline disabled:opacity-60"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Siliniyor..." : "Evet, sil"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
