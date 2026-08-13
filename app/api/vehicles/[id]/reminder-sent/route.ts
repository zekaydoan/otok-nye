import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import {
  getVehicleById,
  isVehicleLinkedToShop,
  listOilRecordsForVehicle,
  markReminderSent,
} from "@/lib/blobStore";
import { checkRateLimit } from "@/lib/rateLimit";
import { reminderCycleKey } from "@/lib/whatsappReminder";

// Bayi panelden "WhatsApp'tan Hatırlat" butonuna bastığında (elle gönderim)
// bu uç nokta tetiklenir — otomatik gece taramasının aynı döngü için tekrar
// mesaj göndermesini engeller ve panelde "gönderildi" durumunun görünmesini
// sağlar (bkz. lib/blobStore.ts ReminderLogEntry, app/dashboard/hatirlatmalar).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  // Aracın gerçekten bu bayinin ilgilendiği (oluşturduğu ya da kayıt eklediği)
  // araçlardan biri olması gerekir — aksi hâlde ilgisiz bir bayi, başka bir
  // bayinin otomatik gece hatırlatmasını sessizce bastırabilirdi (araç
  // sayfasını görüntülemek serbest olsa da, hatırlatma günlüğünü değiştirmek
  // gibi yan etkili bir işlem için bu daha sıkı kontrol gerekli).
  const linked = await isVehicleLinkedToShop(shopId, params.id);
  if (!linked) {
    return NextResponse.json({ error: "Bu araç için yetkiniz yok." }, { status: 403 });
  }

  const rateLimit = await checkRateLimit("reminder-sent", shopId, 60, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen biraz sonra tekrar deneyin." }, { status: 429 });
  }

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const records = await listOilRecordsForVehicle(params.id);
  const latest = records[0];
  if (!latest) return NextResponse.json({ error: "Bakım kaydı bulunamadı." }, { status: 400 });

  await markReminderSent(vehicle.id, reminderCycleKey(latest), "manuel");
  return NextResponse.json({ ok: true });
}
