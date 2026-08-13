import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { deleteAppointment, updateAppointment } from "@/lib/blobStore";
import type { AppointmentStatus } from "@/lib/types";

const VALID_STATUSES: AppointmentStatus[] = ["bekliyor", "geldi", "iptal"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const body = await req.json();
  const { status } = body as { status?: AppointmentStatus };
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  try {
    const appointment = await updateAppointment(shopId, params.id, (a) => ({ ...a, status }));
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Randevu bulunamadı veya güncellenemedi." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  await deleteAppointment(shopId, params.id);
  return NextResponse.json({ ok: true });
}
