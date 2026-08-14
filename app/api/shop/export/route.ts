import { NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { listOilRecordsForVehicle, listVehiclesByShop } from "@/lib/blobStore";

// Bayinin kendi araç + bakım verisini CSV olarak indirebilmesi için — CSV içe
// aktarma (bkz. app/dashboard/araclar/toplu-ekle) zaten vardı ama dışa aktarma
// hiç yoktu; bir bayi verisini yedeklemek ya da başka bir sisteme taşımak
// isterse elinde hiçbir yol yoktu. Her araç için en güncel bakım kaydının
// özetini de tek satırda birleştirir (tam bakım geçmişi değil — o, araç
// sayısı × kayıt sayısı kadar satır gerektirir, ilk sürüm için kapsam dışı
// bırakıldı).
function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? "" : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicles = await listVehiclesByShop(shopId);

  const header = [
    "Plaka",
    "Marka",
    "Model",
    "Yıl",
    "Sahibi",
    "Telefon",
    "Güncel Km",
    "Son Bakım Tarihi",
    "Son Yağ",
    "Sonraki Bakım Tarihi",
    "Sonraki Bakım Km",
  ];

  const rows = await Promise.all(
    vehicles.map(async ({ vehicle }) => {
      const records = await listOilRecordsForVehicle(vehicle.id);
      const latest = records[0];
      return [
        vehicle.plateDisplay,
        vehicle.brand,
        vehicle.model,
        vehicle.year ?? "",
        vehicle.ownerName ?? "",
        vehicle.ownerPhone ?? "",
        vehicle.lastKnownKm ?? "",
        latest?.date ?? "",
        latest ? `${latest.oilBrand} ${latest.oilModel}` : "",
        latest?.nextServiceDate ?? "",
        latest?.nextServiceKm ?? "",
      ]
        .map(csvEscape)
        .join(",");
    })
  );

  // Excel'in Türkçe karakterleri doğru göstermesi için UTF-8 BOM eklenir.
  const csv = "﻿" + [header.map(csvEscape).join(","), ...rows].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="otohafiza-araclar-${today}.csv"`,
    },
  });
}
