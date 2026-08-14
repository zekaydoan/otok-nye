import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { updateStickerOrder } from "@/lib/blobStore";
import { STICKER_ORDER_STATUS_LABELS, type StickerOrderStatus } from "@/lib/types";

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

  try {
    const updated = await updateStickerOrder(params.id, (order) => ({
      ...order,
      status,
      trackingCarrier: trackingCarrier ?? order.trackingCarrier,
      trackingNumber: trackingNumber ?? order.trackingNumber,
      adminNote: adminNote ?? order.adminNote,
      refundedAt: refunded ? order.refundedAt || new Date().toISOString() : refunded === false ? undefined : order.refundedAt,
      refundAmountTry: refunded ? refundAmountTry ?? order.refundAmountTry : refunded === false ? undefined : order.refundAmountTry,
      updatedAt: new Date().toISOString(),
    }));
    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }
}
