"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STICKER_ORDER_STATUS_LABELS, type StickerOrder } from "@/lib/types";
import {
  STICKER_ORDER_TRACKING_STEPS,
  getStickerOrderTrackingUrl,
  isStickerOrderCancelableByShop,
  isStickerOrderInTrackingFlow,
  stickerOrderStatusBadgeClass,
  stickerOrderTrackingIndex,
} from "@/lib/stickerOrderUi";
import { useToast } from "@/components/Toast";

// "Siparişlerim" listesi — bkz. app/dashboard/etiket-siparis/page.tsx. Sunucu
// tarafında çekilen siparişler burada prop olarak alınır; yalnızca "İptal Et"
// butonunun tıklama/onay/istek akışı için ayrı bir istemci bileşenine
// taşındı (sayfanın geri kalanı server component olarak kalabilsin diye).
export default function StickerOrderList({ orders: initialOrders }: { orders: StickerOrder[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function cancelOrder(orderId: string) {
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/etiket-siparis/${orderId}/iptal`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Sipariş iptal edilemedi, lütfen tekrar deneyin.");
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      showToast("Sipariş iptal edildi.");
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setCancellingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {orders.map((order) => {
        const inFlow = isStickerOrderInTrackingFlow(order.status);
        const currentIdx = stickerOrderTrackingIndex(order.status);
        const cancelable = isStickerOrderCancelableByShop(order.status);
        const isConfirming = confirmingId === order.id;
        const isCancelling = cancellingId === order.id;
        // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 2): bilinen bir
        // kargo firmasıysa takip no'su tıklanabilir bir linke dönüşür,
        // bilinmeyen firmalarda (veya kargo bilgisi hiç girilmemişse) eskisi
        // gibi düz metin olarak kalır.
        const trackingUrl = getStickerOrderTrackingUrl(order.trackingCarrier, order.trackingNumber);

        return (
          <div key={order.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.quantity} adet — {order.totalPriceTry.toFixed(2)}₺
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  {order.trackingNumber && (
                    <>
                      {" · Takip No: "}
                      {trackingUrl ? (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-brand-600 underline hover:text-brand-700"
                        >
                          {order.trackingNumber}
                        </a>
                      ) : (
                        order.trackingNumber
                      )}
                    </>
                  )}
                </p>
              </div>
              {!inFlow && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stickerOrderStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {STICKER_ORDER_STATUS_LABELS[order.status]}
                </span>
              )}
            </div>

            {/* Ödemesi onaylanmış siparişler için mini kargo takip göstergesi. */}
            {inFlow && (
              <div className="mt-3 flex items-center">
                {STICKER_ORDER_TRACKING_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        i <= currentIdx ? "bg-brand-600" : "bg-slate-200"
                      }`}
                      title={STICKER_ORDER_STATUS_LABELS[step]}
                    />
                    {i < STICKER_ORDER_TRACKING_STEPS.length - 1 && (
                      <span
                        className={`h-px w-6 sm:w-10 ${i < currentIdx ? "bg-brand-600" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                ))}
                <span className="ml-2 text-xs font-medium text-brand-700">
                  {STICKER_ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            )}

            {cancelable && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                {isConfirming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-slate-600">
                      {order.status === "odeme_bekleniyor"
                        ? "Bu siparişi iptal etmek istediğinize emin misiniz?"
                        : "Ödemesi alınmış bu siparişi iptal etmek istediğinize emin misiniz? İade sürecini ekibimiz başlatacak."}
                    </p>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => cancelOrder(order.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {isCancelling ? "İptal ediliyor..." : "Evet, iptal et"}
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setConfirmingId(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Vazgeç
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(order.id)}
                    className="text-xs font-semibold text-red-600 underline hover:text-red-700"
                  >
                    Siparişi İptal Et
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
