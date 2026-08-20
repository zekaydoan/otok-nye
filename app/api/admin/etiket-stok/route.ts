import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  createStickerStockBatch,
  createStickerStockTokens,
  recordAdminAuditLog,
} from "@/lib/blobStore";
import type { StickerStockBatch } from "@/lib/types";

const MAX_QUANTITY = 500;
const MAX_NOTE_LEN = 1000;

// Admin panelinden, HERHANGİ bir bayiye/siparişe bağlı olmadan toplu QR etiket
// partisi üretir (bkz. lib/types.ts StickerStockBatch, components/AdminStockStickerForm
// — Zeki'nin 20 Ağustos 2026 talebi: "Hiçbir bayiye bağlı olmayan, genel stok etiket").
// Sonuçtaki token'lar kendi matbaasından bastırılıp elde stok olarak tutulabilir;
// hangi bayiye gideceği önceden belirlenmez — bir bayi etiketi bir araca ilk kez
// bağladığında (bkz. app/api/etiket-token/[token]/bind) o bayiye kalıcı olarak atanır.
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { quantity, note } = body as { quantity?: number; note?: string };

  if (!quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json({ error: `Adet 1 ile ${MAX_QUANTITY} arasında olmalıdır.` }, { status: 400 });
  }
  if (note && note.length > MAX_NOTE_LEN) {
    return NextResponse.json({ error: "Not çok uzun." }, { status: 400 });
  }

  const batchId = randomUUID();
  const now = new Date().toISOString();
  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  const batch: StickerStockBatch = {
    id: batchId,
    quantity,
    note: note?.trim() || undefined,
    createdAt: now,
    createdByAdminEmail: actorEmail,
  };
  await createStickerStockBatch(batch);
  await createStickerStockTokens(batchId, quantity);

  await recordAdminAuditLog({
    actorEmail,
    action: "genel_stok_etiket_olusturuldu",
    targetType: "sticker_stock_batch",
    targetId: batchId,
    targetLabel: `Genel Stok — ${quantity} adet`,
    detail: `${quantity} adet bayiye bağlı olmayan stok etiketi oluşturuldu${
      note?.trim() ? " — " + note.trim() : ""
    }`,
  });

  return NextResponse.json({ batch });
}
