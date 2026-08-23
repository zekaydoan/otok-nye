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

// Bayi, siparişini yalnızca fiziksel olarak kargoya verilmeden önce iptal
// edebilir — "kargoda"/"teslim_edildi" durumunda artık bir ürün yolda/elinde
// olduğundan bu, iptal değil iade/cayma hakkı sürecidir (bkz. Mesafeli Satış
// Sözleşmesi, 14 günlük cayma hakkı — bu durumda müşteri bizimle iletişime
// geçmeli, panelden tek tıkla "iptal" bu aşamada yanıltıcı olur). Zaten
// iptal edilmiş veya ödemesi başarısız olmuş bir siparişte de gösterecek bir
// "iptal et" işlemi yoktur.
export function isStickerOrderCancelableByShop(status: StickerOrderStatus): boolean {
  return status === "odeme_bekleniyor" || status === "odendi" || status === "hazirlaniyor";
}

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 1): "teslim_edildi" ve
// "iptal" fiilen sonuç durumlarıdır — bir sipariş bu noktaya geldikten sonra
// başka bir duruma dönmesi normal akışta beklenmez (yanlışlıkla tıklama
// dışında). Admin panelinde (bkz. components/AdminOrderRow.tsx) bu durumlara
// GİRERKEN veya bu durumlardan ÇIKARKEN onay istenir — veri modelinde sert bir
// engel yok (admin gerçekten düzeltme yapması gerekiyorsa yapabilmeli), sadece
// yanlışlık payını azaltan bir onay adımı.
export function isStickerOrderTerminalStatus(status: StickerOrderStatus): boolean {
  return status === "teslim_edildi" || status === "iptal";
}

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 2): bilinen kargo
// firmaları için bayi tarafında tıklanabilir bir takip linki üretir. Kargo
// firması adı serbest metin olarak girildiğinden (bkz. components/AdminOrderRow.tsx)
// eşleştirme basit, büyük/küçük harf duyarsız bir alt-dize kontrolüdür.
// Bilinmeyen/eşleşmeyen bir firma adında undefined döner ve arayan taraf düz
// metne geri düşer — link URL'leri "iyi niyetli" (best-effort) kabul edilir,
// kargo firmalarının takip sayfası query parametrelerini değiştirmesi
// durumunda link kırılabilir, bu kritik bir işlem değildir.
const CARRIER_TRACKING_URL_BUILDERS: { matches: string[]; buildUrl: (trackingNumber: string) => string }[] = [
  { matches: ["yurtiçi", "yurtici"], buildUrl: (no) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(no)}` },
  { matches: ["aras"], buildUrl: (no) => `https://kargotakip.araskargo.com.tr/CargoTracking.aspx?code=${encodeURIComponent(no)}` },
  { matches: ["mng"], buildUrl: (no) => `https://www.mngkargo.com.tr/gonderitakip?takipNo=${encodeURIComponent(no)}` },
  { matches: ["ptt"], buildUrl: (no) => `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(no)}` },
  { matches: ["sürat", "surat"], buildUrl: (no) => `https://www.suratkargo.com.tr/KargoTakip?TakipNo=${encodeURIComponent(no)}` },
  { matches: ["ups"], buildUrl: (no) => `https://www.ups.com/track?loc=tr_TR&tracknum=${encodeURIComponent(no)}` },
  { matches: ["trendyol", "tex"], buildUrl: (no) => `https://tex.com.tr/tr/gonderi-takip?code=${encodeURIComponent(no)}` },
  { matches: ["hepsijet"], buildUrl: (no) => `https://hepsijet.com/gonderi-takip?code=${encodeURIComponent(no)}` },
];

export function getStickerOrderTrackingUrl(
  trackingCarrier: string | undefined,
  trackingNumber: string | undefined
): string | undefined {
  if (!trackingCarrier || !trackingNumber) return undefined;
  const normalizedCarrier = trackingCarrier.trim().toLocaleLowerCase("tr-TR");
  const builder = CARRIER_TRACKING_URL_BUILDERS.find((c) =>
    c.matches.some((m) => normalizedCarrier.includes(m))
  );
  return builder?.buildUrl(trackingNumber.trim());
}
