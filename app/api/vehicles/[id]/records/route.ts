import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentShopId } from "@/lib/auth";
import { createOilRecord, getShopById, getVehicleById, savePhoto } from "@/lib/blobStore";
import { defaultNextServiceDate, defaultNextServiceKm } from "@/lib/maintenance";
import type { OilRecord } from "@/lib/types";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // base64 karakter sayısı için kaba üst sınır
// SVG gibi biçimler <script> içerebileceğinden ve doğrudan URL üzerinden açıldığında
// tarayıcıda çalıştırılabileceğinden (depolanan XSS riski), yalnızca zararsız raster
// görsel biçimlerine izin veriyoruz.
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_TEXT_LEN = 120;
const MAX_NOTE_LEN = 1000;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const {
    date,
    time,
    oilBrand,
    oilModel,
    quantityKg,
    km,
    filterChanged,
    note,
    nextServiceDate,
    nextServiceKm,
    notifyOwner,
    beforePhoto,
    afterPhoto,
  } = body as {
    date?: string;
    time?: string;
    oilBrand?: string;
    oilModel?: string;
    quantityKg?: number;
    km?: number;
    filterChanged?: boolean;
    note?: string;
    nextServiceDate?: string;
    nextServiceKm?: number;
    notifyOwner?: boolean;
    beforePhoto?: string; // "data:image/jpeg;base64,...."
    afterPhoto?: string;
  };

  if (!date || !oilBrand || !oilModel || !quantityKg) {
    return NextResponse.json(
      { error: "Tarih, yağ markası, yağ modeli ve kg zorunludur." },
      { status: 400 }
    );
  }
  if (oilBrand.length > MAX_TEXT_LEN || oilModel.length > MAX_TEXT_LEN) {
    return NextResponse.json({ error: "Yağ markası/modeli çok uzun." }, { status: 400 });
  }
  if (note && note.length > MAX_NOTE_LEN) {
    return NextResponse.json({ error: "Not çok uzun." }, { status: 400 });
  }

  const parsedKm = km ? Number(km) : undefined;
  if (parsedKm !== undefined && (!Number.isFinite(parsedKm) || parsedKm < 0 || parsedKm > 5_000_000)) {
    return NextResponse.json({ error: "Geçersiz kilometre değeri." }, { status: 400 });
  }
  const parsedQuantity = Number(quantityKg);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > 1000) {
    return NextResponse.json({ error: "Geçersiz yağ miktarı." }, { status: 400 });
  }

  const record: OilRecord = {
    id: randomUUID(),
    vehicleId: vehicle.id,
    shopId: shop.id,
    shopName: shop.name,
    shopPhone: shop.phone,
    date,
    time: time || new Date().toTimeString().slice(0, 5),
    oilBrand,
    oilModel,
    quantityKg: parsedQuantity,
    km: parsedKm,
    filterChanged: !!filterChanged,
    note,
    nextServiceDate: nextServiceDate || defaultNextServiceDate(date),
    nextServiceKm: nextServiceKm ? Number(nextServiceKm) : defaultNextServiceKm(parsedKm),
    createdAt: new Date().toISOString(),
  };

  for (const [type, dataUrl] of [
    ["before", beforePhoto],
    ["after", afterPhoto],
  ] as const) {
    if (!dataUrl) continue;
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) continue;
    const [, contentType, base64] = match;
    if (!ALLOWED_PHOTO_TYPES.has(contentType)) continue; // izin verilmeyen biçimleri sessizce atla
    if (base64.length > MAX_PHOTO_BYTES) continue; // aşırı büyük dosyaları sessizce atla
    await savePhoto(record.id, type, base64, contentType);
    if (type === "before") record.hasBeforePhoto = true;
    if (type === "after") record.hasAfterPhoto = true;
  }

  await createOilRecord(record);

  return NextResponse.json({ record });
}
