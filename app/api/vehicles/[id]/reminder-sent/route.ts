import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getVehicleById, listOilRecordsForVehicle, markReminderSent } from "@/lib/blobStore";
import { reminderCycleKey } from "@/lib/whatsappReminder";

// Bayi panelden "WhatsApp'tan Hatırlat" butonuna bastığında (elle gönderim)
// bu uç nokta tetiklenir — otomatik gece taramasının aynı döngü için tekrar
// mesaj göndermesini engeller ve panelde "gönderildi" durumunun görünmesini
// sağlar (bkz. lib/blobStore.ts ReminderLogEntry, app/dashboard/hatirlatmalar).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const records = await listOilRecordsForVehicle(params.id);
  const latest = records[0];
  if (!latest) return NextResponse.json({ error: "Bakım kaydı bulunamadı." }, { status: 400 });

  await markReminderSent(vehicle.id, reminderCycleKey(latest), "manuel");
  return NextResponse.json({ ok: true });
}
