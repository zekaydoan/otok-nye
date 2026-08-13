import { NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getVehicleById, listOilRecordsForVehicle, markReminderSent } from "@/lib/blobStore";
import { buildReminderMessage } from "@/lib/maintenance";
import { sendSms } from "@/lib/sms";
import { checkRateLimit } from "@/lib/rateLimit";

// SMS gönderimi ücretlidir (Netgsm) — bir aracın sahibine kısa sürede tekrar tekrar
// mesaj gönderilerek maliyet/istismar oluşturulmasını önlemek için araç başına sınır.
const MAX_MANUAL_REMINDERS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 saat

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const rateLimit = await checkRateLimit("remind", params.id, MAX_MANUAL_REMINDERS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bu araç için kısa sürede çok fazla hatırlatma gönderildi. Lütfen biraz sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });
  if (!vehicle.ownerPhone) {
    return NextResponse.json({ error: "Araç sahibinin telefonu kayıtlı değil." }, { status: 400 });
  }

  const records = await listOilRecordsForVehicle(vehicle.id);
  const latest = records[0];
  if (!latest || !latest.nextServiceDate) {
    return NextResponse.json({ error: "Hatırlatma için bakım kaydı bulunamadı." }, { status: 400 });
  }

  const result = await sendSms(vehicle.ownerPhone, buildReminderMessage(vehicle, latest));
  if (result.sent) {
    await markReminderSent(vehicle.id, latest.nextServiceDate);
  }

  return NextResponse.json(result);
}
