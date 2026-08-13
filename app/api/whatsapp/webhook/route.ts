import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAppointment, getVehicleById, listOilRecordsForVehicle } from "@/lib/blobStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { decodeConfirmationPayload, reminderCycleKey } from "@/lib/whatsappReminder";
import type { Appointment } from "@/lib/types";

// WhatsApp Business Platform'un gelen mesajları bildirdiği webhook. İki işi var:
// 1. GET: Meta, webhook URL'sini kaydederken bir doğrulama isteği (handshake) atar.
// 2. POST: Müşteri hatırlatma mesajındaki "Evet"/"Hayır" butonuna bastığında buraya
//    bir bildirim düşer — "Evet" ise otomatik randevu açılır (bkz. lib/blobStore
//    createAppointment), panelde Randevular sayfasında ve header'daki rozette görünür.
//
// DURUM: Meta bu URL'yi çağırabilmek için önce Meta App ayarlarında tanımlanmış
// olmalı, o da şirket kuruluşu + WhatsApp Business hesabı kurulumunu bekliyor
// (bkz. README). Kod tarafı hazır; sağlayıcı bağlanınca Meta App ayarlarına bu
// URL girilip WHATSAPP_WEBHOOK_VERIFY_TOKEN VE WHATSAPP_APP_SECRET'ın (ikisi de
// zorunlu, opsiyonel değil — bkz. isValidSignature) tanımlanması yeterli.

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
// doğrulanmalı. Bu uç nokta dışa açık ve isteği tetiklediğinde gerçek para/veri
// etkisi olan bir işlem (otomatik randevu açma) yaptığı için, diğer "dormant"
// modüllerin aksine (ör. lib/email.ts, lib/whatsappReminder.ts — anahtar
// yokken sessizce no-op) burada GÜVENLİ TARAF seçildi: WHATSAPP_APP_SECRET
// tanımlı değilken istek KABUL EDİLMEZ (fail-closed). Aksi hâlde imza kontrolü
// fiilen devre dışı kalır ve herkes rastgele bir vehicleId biliyorsa sahte
// randevu açtırabilirdi.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn("[whatsapp-webhook] WHATSAPP_APP_SECRET tanımlı değil, istek reddedildi (fail-closed).");
    return false;
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
  // İmza doğrulaması geçersiz isteği zaten reddediyor, ama imza kontrolünün
  // kendisi (HMAC hesaplama) ucuz değil — IP başına kaba bir hız sınırı,
  // birinin bu uç noktayı sürekli yeniden denemesini/kaynak tüketmesini
  // en baştan engeller.
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("whatsapp-webhook", ip, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return new NextResponse("rate_limited", { status: 429 });
  }

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
