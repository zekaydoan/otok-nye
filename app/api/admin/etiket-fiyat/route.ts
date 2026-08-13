import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { setStickerUnitPriceTry } from "@/lib/blobStore";

// Etiket birim fiyatı, baskı tedarikçisi araştırması tamamlanana kadar admin
// panelinden değiştirilebilir tutuluyor (bkz. lib/blobStore.ts getStickerUnitPriceTry).
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const { unitPriceTry } = (await req.json()) as { unitPriceTry?: number };
  if (!unitPriceTry || !Number.isFinite(unitPriceTry) || unitPriceTry <= 0 || unitPriceTry > 10000) {
    return NextResponse.json({ error: "Geçerli bir fiyat giriniz." }, { status: 400 });
  }

  await setStickerUnitPriceTry(Math.round(unitPriceTry * 100) / 100);
  return NextResponse.json({ ok: true });
}
