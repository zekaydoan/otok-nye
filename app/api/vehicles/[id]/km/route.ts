import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { updateVehicleKm } from "@/lib/blobStore";

// Aracın "bilinen güncel km" bilgisini tam bir bakım kaydı eklemeden, hızlıca
// güncellemek için — ör. araç sadece kontrole geldiğinde. Km bazlı bakım
// hatırlatması (bkz. lib/blobStore.listUpcomingServicesForShop) bu değere dayanır.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const body = await req.json();
  const { km } = body as { km?: number };
  const parsed = Number(km);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5_000_000) {
    return NextResponse.json({ error: "Geçersiz kilometre değeri." }, { status: 400 });
  }

  try {
    const vehicle = await updateVehicleKm(params.id, parsed);
    return NextResponse.json({ vehicle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Güncellenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
