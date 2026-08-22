import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentShopId } from "@/lib/auth";
import { createAppointment, getShopById, listAppointmentsForShop } from "@/lib/blobStore";
import type { Appointment } from "@/lib/types";

const MAX_LEN = 120;

export async function GET() {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const appointments = await listAppointmentsForShop(shopId);
  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  // V2: Fatura bilgisi zorunluluğu buradan kaldırıldı — bkz. app/api/vehicles/route.ts'teki aynı not.
  const body = await req.json();
  const { date, time, plateDisplay, customerName, customerPhone, note } = body as {
    date?: string;
    time?: string;
    plateDisplay?: string;
    customerName?: string;
    customerPhone?: string;
    note?: string;
  };

  if (!date || !time) {
    return NextResponse.json({ error: "Tarih ve saat zorunludur." }, { status: 400 });
  }
  if (
    (plateDisplay && plateDisplay.length > 15) ||
    (customerName && customerName.length > MAX_LEN) ||
    (customerPhone && customerPhone.length > 30) ||
    (note && note.length > 500)
  ) {
    return NextResponse.json({ error: "Girilen bilgilerden biri çok uzun." }, { status: 400 });
  }

  const appointment: Appointment = {
    id: randomUUID(),
    shopId,
    date,
    time,
    plateDisplay: plateDisplay?.trim() || undefined,
    customerName: customerName?.trim() || undefined,
    customerPhone: customerPhone?.trim() || undefined,
    note: note?.trim() || undefined,
    status: "bekliyor",
    createdAt: new Date().toISOString(),
  };

  await createAppointment(appointment);
  return NextResponse.json({ appointment });
}
