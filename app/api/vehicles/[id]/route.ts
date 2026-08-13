import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import {
  getVehicleById,
  getVehicleByPlate,
  linkShopVehicle,
  listOilRecordsForVehicle,
  normalizePlate,
  updateVehicleInfo,
} from "@/lib/blobStore";
import { validatePlate } from "@/lib/plates";

// Tam araç + bakım kaydı detayını döner. Üyelere özeldir — genel QR sayfası (/arac/[id])
// bu uç noktayı kullanmaz, doğrudan sunucu tarafında render eder ve girişsiz
// ziyaretçilere yalnızca özet gösterir.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });
  const records = await listOilRecordsForVehicle(vehicle.id);
  return NextResponse.json({ vehicle, records });
}

const MAX_LEN = 120;

// Araç satıldığında plaka ve/veya sahibi bilgisi güncellenebilsin diye — paylaşımlı
// defter politikasıyla tutarlı olarak, aracı ilk ekleyen bayi olmasa bile giriş
// yapmış herhangi bir yetkili bayi düzenleyebilir.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id, { consistency: "strong" });
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const body = await req.json();
  const { plate, brand, model, year, ownerName, ownerPhone } = body as {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    ownerName?: string;
    ownerPhone?: string;
  };

  if (!plate || !brand || !model) {
    return NextResponse.json({ error: "Plaka, marka ve model zorunludur." }, { status: 400 });
  }
  if (
    brand.length > MAX_LEN ||
    model.length > MAX_LEN ||
    (year && year.length > 10) ||
    (ownerName && ownerName.length > MAX_LEN) ||
    (ownerPhone && ownerPhone.length > 30)
  ) {
    return NextResponse.json({ error: "Girilen bilgilerden biri çok uzun." }, { status: 400 });
  }

  const plateCheck = validatePlate(plate);
  if (!plateCheck.valid) {
    return NextResponse.json({ error: plateCheck.message || "Geçersiz plaka." }, { status: 400 });
  }
  const normalized = normalizePlate(plate);
  const plateChanged = normalized !== vehicle.plate;

  if (plateChanged) {
    const existing = await getVehicleByPlate(normalized, { consistency: "strong" });
    if (existing && existing.id !== vehicle.id) {
      return NextResponse.json(
        { error: "Bu plaka başka bir araca kayıtlı.", vehicleId: existing.id },
        { status: 409 }
      );
    }
  }

  const updated = await updateVehicleInfo(vehicle.id, {
    plate: normalized,
    plateDisplay: plate.toUpperCase().trim(),
    brand,
    model,
    year,
    ownerName,
    ownerPhone,
  });

  // Düzenleyen bayi de bu aracı kendi "Araçlarım" listesinde görsün — genelde bir
  // servis ziyareti sırasında güncelleme yapılır.
  await linkShopVehicle(shopId, vehicle.id);

  return NextResponse.json({ vehicle: updated, plateChanged });
}
