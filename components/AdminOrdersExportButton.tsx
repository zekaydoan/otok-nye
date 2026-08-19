"use client";

import { STICKER_ORDER_STATUS_LABELS, type StickerOrder } from "@/lib/types";
import { buildCsv, downloadCsv } from "@/lib/csv";

// Muhasebe/vergi döneminde işe yarasın diye — bkz. app/admin/siparisler.
// Sunucu tarafında zaten çekilmiş olan sipariş listesi prop olarak alınır,
// ayrı bir API isteği yapılmaz.
export default function AdminOrdersExportButton({ orders }: { orders: StickerOrder[] }) {
  function exportCsv() {
    const csv = buildCsv(
      [
        "Sipariş ID",
        "Firma",
        "Adet",
        "Tutar (TRY)",
        "Durum",
        "Şehir",
        "Kargo Firması",
        "Takip No",
        "İade Edildi",
        "İade Tutarı (TRY)",
        "Hediye",
        "Sipariş Tarihi",
      ],
      orders.map((o) => [
        o.id,
        o.shopName,
        o.quantity,
        o.totalPriceTry,
        STICKER_ORDER_STATUS_LABELS[o.status],
        o.shippingAddress?.city || "",
        o.trackingCarrier || "",
        o.trackingNumber || "",
        o.refundedAt ? "Evet" : "Hayır",
        o.refundAmountTry ?? "",
        o.isGift ? "Evet" : "Hayır",
        o.createdAt.slice(0, 10),
      ])
    );
    downloadCsv(`etiket-siparisleri-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      CSV indir ({orders.length})
    </button>
  );
}
