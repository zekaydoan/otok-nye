import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createVehicle,
  getShopById,
  getVehicleByPlate,
  listVehiclesByShop,
} from "@/lib/blobStore";
import { getCurrentShopId } from "@/lib/auth";
import { validatePlate } from "@/lib/plates";
import { PLAN_LIMITS } from "@/lib/types";
import type { Vehicle } from "@/lib/types";

const MAX_LEN = 120;
// Netlify Function zaman aşımı ve her satır için ek bir strong-consistency plaka
// kontrolü (getVehicleByPlate) gerektirdiğinden tek seferde işlenebilecek satır
// sayısını sınırlıyoruz — daha büyük listeler birden fazla parçaya bölünerek
// yüklenebilir.
const MAX_ROWS = 200;

interface BulkRow {
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  ownerName?: string;
  ownerPhone?: string;
}

interface SkippedRow {
  row: number;
  plate?: string;
  reason: string;
}

// Toplu araç içe aktarma — tek tek "Yeni Araç Ekle" formunu doldurmak yerine, mevcut
// müşteri listesini CSV olarak yapıştırıp/yükleyip bir defada eklemek içindir (bkz.
// app/dashboard/araclar/toplu-ekle). Her satır tek araç eklemeyle (POST
// /api/vehicles) aynı doğrulama kurallarına tabidir; geçersiz/çakışan satırlar
// atlanır ve nedeniyle birlikte raporlanır — tüm istek tek bir hatalı satır
// yüzünden başarısız olmaz.
export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const body = await req.json();
  const { rows } = body as { rows?: BulkRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "İçe aktarılacak satır bulunamadı." }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Tek seferde en fazla ${MAX_ROWS} araç içe aktarabilirsiniz.` },
      { status: 400 }
    );
  }

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  // V2: Fatura bilgisi zorunluluğu buradan kaldırıldı — bkz. app/api/vehicles/route.ts'teki aynı not.
  const limit = PLAN_LIMITS[shop.plan].maxVehicles;
  let currentCount = 0;
  if (limit !== Infinity) {
    currentCount = (await listVehiclesByShop(shopId)).length;
  }

  const created: Vehicle[] = [];
  const skipped: SkippedRow[] = [];
  const seenInBatch = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const { plate, brand, model, year, ownerName, ownerPhone } = rows[i] || {};

    if (!plate || !brand || !model) {
      skipped.push({ row: rowNum, plate, reason: "Plaka, marka veya model eksik." });
      continue;
    }
    if (
      brand.length > MAX_LEN ||
      model.length > MAX_LEN ||
      (year && year.length > 10) ||
      (ownerName && ownerName.length > MAX_LEN) ||
      (ownerPhone && ownerPhone.length > 30)
    ) {
      skipped.push({ row: rowNum, plate, reason: "Bir alan çok uzun." });
      continue;
    }

    const plateCheck = validatePlate(plate);
    if (!plateCheck.valid) {
      skipped.push({ row: rowNum, plate, reason: plateCheck.message || "Geçersiz plaka." });
      continue;
    }

    if (seenInBatch.has(plateCheck.normalized)) {
      skipped.push({ row: rowNum, plate, reason: "Bu listede tekrar ediyor." });
      continue;
    }

    if (limit !== Infinity && currentCount + created.length >= limit) {
      skipped.push({
        row: rowNum,
        plate,
        reason: `${PLAN_LIMITS[shop.plan].label} plan limiti (${limit} araç) doldu.`,
      });
      continue;
    }

    // Plaka benzersizlik kontrolü — tek araç eklemedeki gibi strong consistency
    // kullanılır, aksi hâlde aynı plaka az önce başka bir satırda/istekte eklenmiş
    // olsa bile bu kontrol yanlış negatif verebilir.
    const existing = await getVehicleByPlate(plateCheck.normalized, { consistency: "strong" });
    if (existing) {
      skipped.push({ row: rowNum, plate, reason: "Bu plaka zaten kayıtlı." });
      continue;
    }

    const vehicle: Vehicle = {
      id: randomUUID(),
      plate: plateCheck.normalized,
      plateDisplay: plate.toUpperCase().trim(),
      brand,
      model,
      year: year || undefined,
      ownerName: ownerName || undefined,
      ownerPhone: ownerPhone || undefined,
      createdByShopId: shopId,
      createdAt: new Date().toISOString(),
    };
    await createVehicle(vehicle);
    created.push(vehicle);
    seenInBatch.add(plateCheck.normalized);
  }

  return NextResponse.json({ created, skipped });
}
