import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentShopId } from "@/lib/auth";
import {
  bindStickerToken,
  createVehicle,
  getShopById,
  getStickerToken,
  getVehicleByPlate,
  listVehiclesByShop,
  normalizePlate,
} from "@/lib/blobStore";
import { validatePlate } from "@/lib/plates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { PLAN_LIMITS } from "@/lib/types";
import type { Vehicle } from "@/lib/types";

const MAX_LEN = 120;
// Bir bayinin normal kullanımında (yeni gelen bir etiket siparişini tek tek
// araçlara bağlama) art arda birçok bind denemesi olağandır; eşik bunu
// engellemeyecek kadar cömert, otomatik/kaba kuvvet denemesini ise
// engelleyecek kadar düşük tutuldu (bkz. SECURITY_FIX_PLAN.md H2).
const MAX_BIND_ATTEMPTS_PER_HOUR = 30;

// Fiziksel, plakasız basılmış bir etiketi (bkz. app/e/[token]) ilk kez bir araca
// bağlar. Etiket sipariş anında belirli bir bayiye ait olarak üretildiyse yalnızca
// o bayi, kendi hesabıyla giriş yapmışken bu etiketi bir araca bağlayabilir. Genel
// stok etiketlerinde (bkz. lib/types.ts StickerToken, StickerStockBatch) ise bayi
// baştan belli olmadığından, giriş yapmış olan HERHANGİ bir bayi ilk bağlamayı
// yapabilir ve etiket o an o bayiye kalıcı olarak atanır.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const rate = await checkRateLimit(
    "etiket-bind",
    `${shopId}|${getClientIp(req)}`,
    MAX_BIND_ATTEMPTS_PER_HOUR,
    60 * 60 * 1000
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme yaptınız. ${rate.retryAfterSeconds} saniye sonra tekrar deneyin.` },
      { status: 429 }
    );
  }

  const tokenRecord = await getStickerToken(params.token, { consistency: "strong" });
  if (!tokenRecord) return NextResponse.json({ error: "Etiket bulunamadı." }, { status: 404 });
  // Genel stok etiketlerinde (bkz. lib/types.ts StickerToken yorumu) shopId üretim
  // anında boştur — bu durumda giriş yapmış olan HERHANGİ bir bayi ilk bağlamayı
  // yapabilir, aşağıdaki bindStickerToken çağrısı token'ı o bayiye kalıcı olarak atar.
  if (tokenRecord.shopId && tokenRecord.shopId !== shopId) {
    return NextResponse.json({ error: "Bu etiket başka bir yetkili servise ait." }, { status: 403 });
  }
  if (tokenRecord.vehicleId) {
    return NextResponse.json({ error: "Bu etiket zaten bir araca bağlı." }, { status: 409 });
  }

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
  const existing = await getVehicleByPlate(normalized, { consistency: "strong" });
  if (existing) {
    return NextResponse.json(
      { error: "Bu plaka zaten kayıtlı.", vehicleId: existing.id },
      { status: 409 }
    );
  }

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  // Bu bayinin ilk aracını mı eklediğini (isFirstVehicle) güvenilir biçimde
  // belirlemek için aynı liste kullanılıyor — bkz. aşağıdaki yanıt ve
  // components/BindStickerForm.tsx (Meta Pixel "FirstVehicleAdded" olayı).
  // (Not: bu uç nokta, plakasız basılmış bir etiketi YENİ bir araca bağlar —
  // yukarıdaki getVehicleByPlate kontrolü zaten bu plakanın önceden var
  // OLMADIĞINI doğruluyor, dolayısıyla bu gerçek bir "yeni araç" oluşturma
  // akışıdır, sistemde zaten var olan bir aracı hesaba bağlama değildir.)
  const currentVehicles = await listVehiclesByShop(shopId);
  const limit = PLAN_LIMITS[shop.plan].maxVehicles;
  if (limit !== Infinity && currentVehicles.length >= limit) {
    return NextResponse.json(
      {
        error: `${PLAN_LIMITS[shop.plan].label} planında en fazla ${limit} araç kaydedebilirsiniz. Daha fazla araç eklemek için planınızı yükseltin.`,
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
  await bindStickerToken(params.token, vehicle.id, shopId);

  return NextResponse.json({ vehicleId: vehicle.id, isFirstVehicle });
}
