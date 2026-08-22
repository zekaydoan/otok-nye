import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentShopId } from "@/lib/auth";
import {
  createVehicle,
  getShopById,
  getVehicleByPlate,
  listVehiclesByShop,
  normalizePlate,
} from "@/lib/blobStore";
import { validatePlate } from "@/lib/plates";
import { PLAN_LIMITS } from "@/lib/types";
import type { Vehicle } from "@/lib/types";

export async function GET() {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const vehicles = await listVehiclesByShop(shopId);
  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const body = await req.json();
  const { plate, brand, model, year, ownerName, ownerPhone, currentKm } = body as {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    ownerName?: string;
    ownerPhone?: string;
    currentKm?: number | string;
  };

  if (!plate || !brand || !model) {
    return NextResponse.json({ error: "Plaka, marka ve model zorunludur." }, { status: 400 });
  }
  const MAX_LEN = 120;
  if (
    brand.length > MAX_LEN ||
    model.length > MAX_LEN ||
    (year && year.length > 10) ||
    (ownerName && ownerName.length > MAX_LEN) ||
    (ownerPhone && ownerPhone.length > 30)
  ) {
    return NextResponse.json({ error: "Girilen bilgilerden biri çok uzun." }, { status: 400 });
  }

  // V2: Yeni Araç Ekle formuna eklenen opsiyonel "Güncel KM" alanı — bakım
  // kaydı eklerken zaten yapılan km doğrulamasıyla (bkz.
  // app/api/vehicles/[id]/records/route.ts) aynı üst sınır kullanılır.
  let parsedCurrentKm: number | undefined;
  if (currentKm !== undefined && currentKm !== null && currentKm !== "") {
    parsedCurrentKm = Number(currentKm);
    if (!Number.isFinite(parsedCurrentKm) || parsedCurrentKm < 0 || parsedCurrentKm > 5_000_000) {
      return NextResponse.json({ error: "Geçersiz kilometre değeri." }, { status: 400 });
    }
  }

  const plateCheck = validatePlate(plate);
  if (!plateCheck.valid) {
    return NextResponse.json({ error: plateCheck.message || "Geçersiz plaka." }, { status: 400 });
  }

  const normalized = normalizePlate(plate);
  // Benzersizlik kontrolü yanlış negatif vermemeli (aynı plaka az önce başka bir
  // bayi tarafından eklenmişse bunu kaçırmamalıyız) — bu yüzden burada strong
  // consistency kullanıyoruz.
  const existing = await getVehicleByPlate(normalized, { consistency: "strong" });
  if (existing) {
    return NextResponse.json(
      { error: "Bu plaka zaten kayıtlı.", vehicleId: existing.id },
      { status: 409 }
    );
  }

  // Plan limitini kontrol et — panelde gösterilen "X / limit araç" sayacıyla aynı
  // listeye (listVehiclesByShop) göre hesaplanır, böylece kullanıcıyı şaşırtmaz.
  // Aynı liste, bu bayinin ilk aracını mı eklediğini (isFirstVehicle) güvenilir
  // biçimde belirlemek için de kullanılıyor — bkz. aşağıdaki yanıt ve
  // app/dashboard/araclar/yeni/page.tsx (Meta Pixel "FirstVehicleAdded" olayı).
  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  // V2: Fatura bilgisi zorunluluğu buradan kaldırıldı (Zeki'nin talebi — ücretsiz
  // kullanıcı satın alma yapmadığı sürece fatura bilgisi istenmemeli). Fatura
  // bilgisi artık yalnızca ücretli plan/etiket satın alımında zorunlu tutuluyor
  // (bkz. app/api/shop/plan/route.ts, app/api/etiket-siparis/route.ts).
  const currentVehicles = await listVehiclesByShop(shopId);
  const limit = PLAN_LIMITS[shop.plan].maxVehicles;
  if (limit !== Infinity && currentVehicles.length >= limit) {
    return NextResponse.json(
      {
        error: `${PLAN_LIMITS[shop.plan].label} planında en fazla ${limit} araç kaydedebilirsiniz. Daha fazla araç eklemek için planınızı yükseltin.`,
        code: "plan_limit",
      },
      { status: 403 }
    );
  }
  const isFirstVehicle = currentVehicles.length === 0;

  const vehicle: Vehicle = {
    id: randomUUID(),
    plate: normalized,
    plateDisplay: plate.toUpperCase().trim(),
    brand,
    model,
    year,
    ownerName,
    ownerPhone,
    ...(parsedCurrentKm !== undefined
      ? { lastKnownKm: parsedCurrentKm, lastKnownKmUpdatedAt: new Date().toISOString() }
      : {}),
    createdByShopId: shopId,
    createdAt: new Date().toISOString(),
  };

  await createVehicle(vehicle);
  return NextResponse.json({ vehicle, isFirstVehicle });
}
