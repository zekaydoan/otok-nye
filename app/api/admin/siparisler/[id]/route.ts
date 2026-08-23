import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { deleteStickerOrder, getShopById, recordAdminAuditLog, updateStickerOrder } from "@/lib/blobStore";
import { STICKER_ORDER_STATUS_LABELS, type StickerOrderStatus } from "@/lib/types";
import { sendStickerOrderStatusEmail } from "@/lib/email";

const MAX_LEN = 120;

// Kargo takibi otomasyonu yok — admin, sipariş durumunu ve takip numarasını burada
// elle günceller (bkz. kapasite-analizi.md / ürün kararı: manuel takip).
//
// İade alanları da aynı şekilde MANUEL bir kayıttır — bu uç nokta iyzico'nun
// gerçek iade API'sini çağırmaz (para hareketi burada gerçekleşmez). Admin,
// parayı bankadan/iyzico panelinden elle iade ettikten SONRA burada işaretler;
// amaç yalnızca "bu sipariş için iade yapıldı mı, ne zaman, ne kadar" sorusuna
// panelden cevap verebilmek.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { status, trackingCarrier, trackingNumber, adminNote, refunded, refundAmountTry } = body as {
    status?: StickerOrderStatus;
    trackingCarrier?: string;
    trackingNumber?: string;
    adminNote?: string;
    refunded?: boolean;
    refundAmountTry?: number;
  };

  if (!status || !(status in STICKER_ORDER_STATUS_LABELS)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }
  if (
    (trackingCarrier && trackingCarrier.length > MAX_LEN) ||
    (trackingNumber && trackingNumber.length > MAX_LEN) ||
    (adminNote && adminNote.length > 1000)
  ) {
    return NextResponse.json({ error: "Girilen bilgilerden biri çok uzun." }, { status: 400 });
  }
  if (refundAmountTry !== undefined && (typeof refundAmountTry !== "number" || refundAmountTry < 0)) {
    return NextResponse.json({ error: "Geçersiz iade tutarı." }, { status: 400 });
  }

  // Audit log'a "gerçekten ne değişti" yazabilmek için (bkz. app/admin/aktivite),
  // güncelleme öncesi durumu closure dışında okunabilecek bir objede tutuyoruz —
  // aynı desen app/api/etiket-siparis/[id]/iptal/route.ts'te de kullanıldı (TS'in
  // closure-içi reassignment'ları await sonrası narrowlamaması sorununu önler).
  const before: {
    status: StickerOrderStatus | null;
    refundedAt?: string;
    trackingCarrier?: string;
    trackingNumber?: string;
  } = { status: null };

  let updated;
  try {
    updated = await updateStickerOrder(params.id, (order) => {
      before.status = order.status;
      before.refundedAt = order.refundedAt;
      before.trackingCarrier = order.trackingCarrier;
      before.trackingNumber = order.trackingNumber;
      return {
        ...order,
        status,
        trackingCarrier: trackingCarrier ?? order.trackingCarrier,
        trackingNumber: trackingNumber ?? order.trackingNumber,
        adminNote: adminNote ?? order.adminNote,
        refundedAt: refunded ? order.refundedAt || new Date().toISOString() : refunded === false ? undefined : order.refundedAt,
        refundAmountTry: refunded ? refundAmountTry ?? order.refundAmountTry : refunded === false ? undefined : order.refundAmountTry,
        updatedAt: new Date().toISOString(),
      };
    });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  if (before.status !== status) {
    await recordAdminAuditLog({
      actorEmail,
      action: "siparis_guncellendi",
      targetType: "sticker_order",
      targetId: params.id,
      targetLabel: `${updated.shopName} — ${updated.quantity} adet`,
      detail: `${STICKER_ORDER_STATUS_LABELS[before.status ?? status]} → ${STICKER_ORDER_STATUS_LABELS[status]}`,
    });
  }
  if (refunded && !before.refundedAt) {
    await recordAdminAuditLog({
      actorEmail,
      action: "iade_isaretlendi",
      targetType: "sticker_order",
      targetId: params.id,
      targetLabel: `${updated.shopName} — ${updated.quantity} adet`,
      detail: `${(refundAmountTry ?? updated.refundAmountTry ?? 0).toLocaleString("tr-TR")}₺ iade edildi olarak işaretlendi`,
    });
  }

  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 5): durum aynı kalsa
  // bile kargo firması/takip no'su değiştiyse (ör. yanlış girilen takip
  // numarasının düzeltilmesi) bunun da bir izi kalsın — önceden yalnızca
  // status değişince audit log yazılıyordu, kargo bilgisi düzenlemeleri hiç
  // görünmüyordu.
  if (before.trackingCarrier !== updated.trackingCarrier || before.trackingNumber !== updated.trackingNumber) {
    await recordAdminAuditLog({
      actorEmail,
      action: "siparis_kargo_guncellendi",
      targetType: "sticker_order",
      targetId: params.id,
      targetLabel: `${updated.shopName} — ${updated.quantity} adet`,
      detail: `Kargo bilgisi güncellendi: ${updated.trackingCarrier || "—"} / ${updated.trackingNumber || "—"}`,
    });
  }

  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 3): sipariş "kargoda"
  // veya "teslim_edildi" durumuna GEÇTİĞİNDE (yalnızca gerçek bir geçişte,
  // her kargo bilgisi düzenlemesinde değil) bayiye bilgilendirme e-postası
  // gönderilir. E-posta gönderimi başarısız olsa bile asıl kayıt zaten
  // yapıldığından admin'e hata dönülmez — yalnızca loglanır.
  if (before.status !== status && (status === "kargoda" || status === "teslim_edildi")) {
    try {
      const shop = await getShopById(updated.shopId);
      if (shop?.email) {
        await sendStickerOrderStatusEmail(shop.email, {
          status,
          quantity: updated.quantity,
          trackingCarrier: updated.trackingCarrier,
          trackingNumber: updated.trackingNumber,
        });
      }
    } catch (err) {
      console.error("[admin/siparisler] Bayi bildirim e-postası gönderilemedi:", err);
    }
  }

  return NextResponse.json({ order: updated });
}

// Yalnızca hiç ödemesi alınmamış (test/hatalı/yarım bırakılmış) siparişler için
// kalıcı silme — bkz. lib/blobStore.ts deleteStickerOrder'daki koruma mantığı.
// Ödemesi alınmış (şu an veya iptalden önce) bir sipariş burada 409 ile
// reddedilir; o siparişler mali kayıt olduğu için yalnızca PATCH ile durumu
// "iptal" yapılıp iade işaretlenebilir, asla silinemez.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  let deleted;
  try {
    deleted = await deleteStickerOrder(params.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Silinemedi.";
    const notFound = message === "Sipariş bulunamadı.";
    return NextResponse.json({ error: message }, { status: notFound ? 404 : 409 });
  }

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "siparis_silindi",
    targetType: "sticker_order",
    targetId: params.id,
    targetLabel: `${deleted.shopName} — ${deleted.quantity} adet`,
    detail: `${STICKER_ORDER_STATUS_LABELS[deleted.status]} durumundaki (ödenmemiş) sipariş kalıcı olarak silindi`,
  });

  return NextResponse.json({ ok: true });
}
