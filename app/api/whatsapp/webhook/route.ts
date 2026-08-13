import { randomUUID } from "crypto";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAppointment, getVehicleById, listOilRecordsForVehicle } from "@/lib/blobStore";
import { decodeConfirmationPayload, reminderCycleKey } from "@/lib/whatsappReminder";
import type { Appointment } from "@/lib/types";

// WhatsApp Business Platform'un gelen mesajları bildirdiği webhook. İki işi var:
// 1. GET: Meta, webhook URL'sini kaydederken bir doğrulama isteği (handshake) atar.
// 2. POST: Müşteri hatırlatma mesajındaki "Evet"/"Hayır" butonuna bastığında buraya
//    bir bildirim düşer — "Evet" ise otomatik randevu açılır (bkz. lib/blobStore
//    createAppointment), panelde Randevular sayfasında ve header'daki rozette görünür.
//
// DURUM: WHATSAPP_API_KEY/URL gibi bu uç nokta da dormant değil — Meta bu URL'yi
// çağırabilmek için önce Meta App ayarlarında tanımlanmış olmalı, o da şirket
// kuruluşu + WhatsApp Business hesabı kurulumunu bekliyor (bkz. README). Kod
// tarafı hazır; sağlayıcı bağlanınca Meta App ayarlarına bu URL girilip
// WHATSAPP_WEBHOOK_VERIFY_TOKEN ve (varsa) WHATSAPP_APP_SECRET tanımlanması
// yeterli.

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!expectedToken) {
    console.warn("[whatsapp-webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN tanımlı değil, doğrulama reddedildi.");
    return new NextResponse("not_configured", { status: 403 });
  }

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

// Meta, App Secret tanımlıysa her POST isteğine gövdenin HMAC-SHA256 imzasını
// X-Hub-Signature-256 header'ında ekler — sahte isteklere karşı bu imza
// doğrulanmalı. WHATSAPP_APP_SECRET tanımlı değilken (henüz kurulum
// tamamlanmadığında) doğrulamayı atlıyoruz ama loglayarak uyarıyoruz; canlıya
// alınmadan önce bu değişkenin mutlaka tanımlanması gerekir.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn("[whatsapp-webhook] WHATSAPP_APP_SECRET tanımlı değil, imza doğrulaması atlandı.");
    return true;
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf-8").digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

interface WhatsAppInboundMessage {
  from?: string;
  interactive?: { type?: string; button_reply?: { id?: string; title?: string } };
  button?: { payload?: string; text?: string };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!isValidSignature(rawBody, signature)) {
    return new NextResponse("invalid_signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("invalid_json", { status: 400 });
  }

  const messages = extractMessages(payload);

  for (const message of messages) {
    // Şablonlardaki "quick reply" butonları sağlayıcıya göre `interactive.button_reply.id`
    // ya da (Meta'nın klasik template-buton bildirimlerinde) `button.payload` olarak
    // gelebiliyor — ikisini de deniyoruz. Kesin sağlayıcı netleşince bu kısım
    // gerekirse daraltılır.
    const buttonId = message.interactive?.button_reply?.id ?? message.button?.payload;
    if (!buttonId) continue;

    const decoded = decodeConfirmationPayload(buttonId);
    if (!decoded) continue;

    try {
      await handleConfirmation(decoded, message.from);
    } catch (err) {
      console.error("[whatsapp-webhook] Onay işlenemedi:", err);
    }
  }

  // Meta hızlı bir 200 bekliyor; işleme hataları müşteriye tekrar mesaj olarak
  // yansımasın diye burada her koşulda 200 dönüyoruz.
  return NextResponse.json({ ok: true });
}

function extractMessages(payload: unknown): WhatsAppInboundMessage[] {
  const entries = (payload as { entry?: unknown[] })?.entry;
  if (!Array.isArray(entries)) return [];
  const messages: WhatsAppInboundMessage[] = [];
  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const value = (change as { value?: { messages?: unknown[] } })?.value;
      if (Array.isArray(value?.messages)) {
        messages.push(...(value!.messages as WhatsAppInboundMessage[]));
      }
    }
  }
  return messages;
}

async function handleConfirmation(
  decoded: { vehicleId: string; cycleKey: string; answer: "evet" | "hayir" },
  fromPhone?: string
): Promise<void> {
  const vehicle = await getVehicleById(decoded.vehicleId);
  if (!vehicle) return;

  const records = await listOilRecordsForVehicle(decoded.vehicleId);
  const latest = records[0];
  if (!latest) return;

  // Araç bu cevap gönderildikten sonra yeni bir bakım kaydı almış (yeni bir
  // döngüye geçmiş) olabilir — bu durumda eski hatırlatmaya geç gelen cevabı
  // sessizce yok sayıyoruz, yanlış/eski bir randevu açılmasın diye.
  if (reminderCycleKey(latest) !== decoded.cycleKey) return;

  if (decoded.answer !== "evet") return; // "Hayır" için otomatik bir kayıt açılmıyor.

  const appointment: Appointment = {
    id: randomUUID(),
    shopId: latest.shopId,
    date: new Date().toISOString().slice(0, 10),
    time: "",
    plateDisplay: vehicle.plateDisplay,
    customerName: vehicle.ownerName,
    customerPhone: fromPhone || vehicle.ownerPhone,
    note: "WhatsApp hatırlatmasına \"Evet\" cevabıyla otomatik oluşturuldu.",
    status: "bekliyor",
    createdAt: new Date().toISOString(),
    source: "whatsapp_onay",
    seenByShop: false,
  };
  await createAppointment(appointment);
}
