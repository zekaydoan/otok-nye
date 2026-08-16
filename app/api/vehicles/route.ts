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
import { isBillingInfoComplete } from "@/lib/billing";
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

  // Fatura bilgisi eksikken hiçbir bayi (free plan dahil) yeni araç ekleyemez —
  // bkz. lib/billing.ts. İstemci bu koddan yakalayıp /dashboard/fatura-bilgileri'ne
  // yönlendirir (bkz. app/dashboard/araclar/yeni/page.tsx).
  if (!isBillingInfoComplete(shop.billingInfo)) {
    return NextResponse.json(
      { error: "Devam etmeden önce fatura bilgilerinizi kaydetmeniz gerekiyor.", requiresBilling: true },
      { status: 409 }
    );
  }

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
    createdByShopId: shopId,
    createdAt: new Date().toISOString(),
  };

  await createVehicle(vehicle);
  return NextResponse.json({ vehicle, isFirstVehicle });
}
