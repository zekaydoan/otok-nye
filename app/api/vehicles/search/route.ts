import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getVehicleByPlate } from "@/lib/blobStore";
import { validatePlate } from "@/lib/plates";

// Plaka ile arama — sadece giriş yapmış bayiler kullanabilir. Bulunursa aracın var
// olduğu bilgisini döner; asıl kayıt ekleme/görüntüleme işlemi mevcut araç detay
// sayfası üzerinden (bakım ekleme sırasında ilişkilendirme otomatik oluşur).
export async function GET(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const plate = req.nextUrl.searchParams.get("plate") || "";
  const check = validatePlate(plate);
  if (!check.valid) {
    return NextResponse.json({ error: check.message || "Geçersiz plaka." }, { status: 400 });
  }

  const vehicle = await getVehicleByPlate(check.normalized);
  if (!vehicle) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({ found: true, vehicle });
}
