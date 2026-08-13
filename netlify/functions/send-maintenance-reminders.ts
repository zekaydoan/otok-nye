// Netlify Scheduled Function — her gün belirli bir saatte otomatik çalışır
// (bkz. aşağıdaki `config.schedule`). Bakım zamanı yaklaşan/geçen araçları
// tarar, daha önce aynı döngü için hatırlatma gönderilmemişse WhatsApp
// hatırlatması yollar.
//
// ÖNEMLİ: lib/whatsappReminder.ts içindeki sendWhatsAppReminder, WHATSAPP_API_KEY
// ve WHATSAPP_API_URL ortam değişkenleri tanımlanana kadar hiçbir gerçek mesaj
// göndermez — sadece konsola loglar. Yani bu fonksiyon bugün devreye alınsa bile
// sağlayıcı (Netgsm WhatsApp modülü vb.) bağlanana kadar "sessiz" çalışır, hiçbir
// müşteriye mesaj gitmez. Sağlayıcı bağlandığında tek yapılması gereken Netlify
// ortam değişkenlerini tanımlamak — bu dosyada değişiklik gerekmez.
//
// Devreye almak için: Netlify → Site ayarları → Environment variables →
// WHATSAPP_API_KEY, WHATSAPP_API_URL eklenir; bu dosya deploy'da otomatik olarak
// zamanlanmış fonksiyon olarak kaydedilir, elle bir "cron kur" adımı gerekmez.
import type { Config } from "@netlify/functions";
import {
  hasReminderBeenSent,
  listDueReminders,
  markReminderSent,
} from "../../lib/blobStore";
import {
  buildAutoReminderMessage,
  describeReminderReason,
  encodeConfirmationPayload,
  reminderCycleKey,
  sendWhatsAppReminder,
  vehicleHasReminderConsent,
} from "../../lib/whatsappReminder";

export default async () => {
  const due = await listDueReminders();
  let sent = 0;
  let skippedNoPhone = 0;
  let skippedAlreadySent = 0;
  let failed = 0;

  for (const { vehicle, record, daysUntil, kmRemaining } of due) {
    if (!vehicleHasReminderConsent(vehicle)) {
      skippedNoPhone++;
      continue;
    }

    const cycleKey = reminderCycleKey(record);
    const alreadySent = await hasReminderBeenSent(vehicle.id, cycleKey);
    if (alreadySent) {
      skippedAlreadySent++;
      continue;
    }

    const message = buildAutoReminderMessage({
      ownerName: vehicle.ownerName,
      plateDisplay: vehicle.plateDisplay,
      shopName: record.shopName,
      shopPhone: record.shopPhone,
      reasonText: describeReminderReason(daysUntil, kmRemaining),
    });

    // Müşteri butona basınca app/api/whatsapp/webhook bu id'yi geri alıp hangi
    // araç/döngü için "evet" dendiğini çözüyor ve otomatik randevu açıyor.
    const buttons = [
      { id: encodeConfirmationPayload(vehicle.id, cycleKey, "evet"), title: "Evet, randevu oluşturalım" },
      { id: encodeConfirmationPayload(vehicle.id, cycleKey, "hayir"), title: "Hayır, şimdilik değil" },
    ];

    const result = await sendWhatsAppReminder(vehicle.ownerPhone!, message, buttons);
    if (result.sent) {
      sent++;
      await markReminderSent(vehicle.id, cycleKey);
    } else {
      // "not_configured" bekleniyor demektir (sağlayıcı henüz bağlanmadı) —
      // bu durumda cycleKey'i işaretlemiyoruz ki sağlayıcı bağlandığında aynı
      // araç bir sonraki koşuda tekrar denensin.
      failed++;
    }
  }

  console.log(
    `[send-maintenance-reminders] taranan: ${due.length}, gönderildi: ${sent}, ` +
      `telefon yok: ${skippedNoPhone}, zaten gönderilmiş: ${skippedAlreadySent}, ` +
      `gönderilemedi: ${failed}`
  );

  return new Response(
    JSON.stringify({ scanned: due.length, sent, skippedNoPhone, skippedAlreadySent, failed }),
    { headers: { "Content-Type": "application/json" } }
  );
};

// Her gün Türkiye saatiyle sabah 09:00 civarı (06:00 UTC) çalışır — müşterinin
// telefonuna gece/çok erken saatte bildirim gitmemesi için iş saatleri içinde
// bir zaman seçildi.
export const config: Config = {
  schedule: "0 6 * * *",
};
