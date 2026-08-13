import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getOrCreateReportToken, getVehicleById } from "@/lib/blobStore";

// Giriş yapmış herhangi bir bayi (aracı o oluşturmasa bile) bu araç için paylaşılabilir
// bir satış raporu bağlantısı üretebilir — paylaşımlı defter felsefesiyle tutarlı.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const token = await getOrCreateReportToken(vehicle.id);
  const url = `${req.nextUrl.origin}/arac/${vehicle.id}/rapor/${token}`;
  return NextResponse.json({ url });
}
