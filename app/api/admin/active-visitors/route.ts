import { NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getActiveVisitorCount } from "@/lib/blobStore";

// Admin İstatistikler sayfasındaki "Şu An Sitede" kartı (bkz.
// components/ActiveVisitorsCard.tsx) bu uç noktayı birkaç saniyede bir
// çağırarak sayacı tazeler — sayfa yenilemeden neredeyse anlık güncellenir.
export async function GET() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const count = await getActiveVisitorCount();
  return NextResponse.json({ count });
}
