import type { StickerOrderStatus } from "./types";

// Sipariş durum rengi ve kargo takip adımları — hem bayi tarafındaki sipariş
// geçmişinde (app/dashboard/etiket-siparis) hem de admin sipariş listesinde
// (components/AdminOrderRow) aynı görsel dili kullanmak için tek yerden yönetilir.
export function stickerOrderStatusBadgeClass(status: StickerOrderStatus): string {
  switch (status) {
    case "odendi":
    case "hazirlaniyor":
      return "bg-amber-100 text-amber-700";
    case "kargoda":
      return "bg-brand-50 text-brand-700";
    case "teslim_edildi":
      return "bg-green-100 text-green-700";
    case "odeme_basarisiz":
    case "iptal":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// Başarılı bir ödemeden sonraki normal akış — kargo takip mini-göstergesi bu
// sıraya göre dolu/boş nokta çizer. odeme_bekleniyor/odeme_basarisiz/iptal bu
// akışın dışındadır, ayrıca rozetle gösterilir.
export const STICKER_ORDER_TRACKING_STEPS: StickerOrderStatus[] = [
  "odendi",
  "hazirlaniyor",
  "kargoda",
  "teslim_edildi",
];

export function stickerOrderTrackingIndex(status: StickerOrderStatus): number {
  return STICKER_ORDER_TRACKING_STEPS.indexOf(status);
}

export function isStickerOrderInTrackingFlow(status: StickerOrderStatus): boolean {
  return stickerOrderTrackingIndex(status) !== -1;
}
