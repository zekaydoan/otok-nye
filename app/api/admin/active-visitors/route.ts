import { NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getActiveVisitorStats } from "@/lib/blobStore";

// Admin İstatistikler sayfasındaki "Şu An Sitede" kartı (bkz.
// components/ActiveVisitorsCard.tsx) bu uç noktayı birkaç saniyede bir
// çağırarak sayacı ve il bazlı dökümü tazeler — sayfa yenilemeden neredeyse
// anlık güncellenir.
export async function GET() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const stats = await getActiveVisitorStats();
  return NextResponse.json(stats);
}
