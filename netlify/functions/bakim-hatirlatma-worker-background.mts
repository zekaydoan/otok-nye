import { getStore } from "@netlify/blobs";
import { buildReminderMessage, defaultNextServiceDate } from "../../lib/maintenance";
import { sendSms } from "../../lib/sms";
import type { OilRecord, Vehicle } from "../../lib/types";

// Bu bir Background Function'dır (dosya adındaki "-background" son eki Netlify
// tarafından otomatik tanınır) — 15 dakikaya kadar çalışabilir. Ağır işi burada
// yapıyoruz; netlify/functions/bakim-hatirlatma.mts gerçek Scheduled Function'dır
// (30 saniyelik sert sınıra tabidir) ve sadece bu worker'ı HTTP ile tetikleyen
// ince bir katmandır. Araç sayısı büyüdükçe tüm filoyu tek bir 30 saniyelik
// çalıştırmada taramak imkansız hale gelir; bu ayrım o riski ortadan kaldırır.

const REMINDER_WINDOW_DAYS = 3;
const MAX_RUNTIME_MS = 13 * 60 * 1000; // 15 dk sınırının altında güvenli pay bırak
const CONCURRENCY = 15; // Blobs'u aşırı yüklememek için araçları küçük gruplar halinde işle

export default async () => {
  const startedAt = Date.now();
  const vehiclesStore = getStore("vehicles");
  const oilRecordsStore = getStore("oilrecords");
  const reminderLogStore = getStore("reminder_log");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checked = 0;
  let sent = 0;
  let scannedVehicles = 0;
  let truncated = false;

  async function processVehicle(key: string) {
    const vehicle = (await vehiclesStore.get(key, { type: "json" })) as Vehicle | null;
    if (!vehicle || !vehicle.ownerPhone) return;

    const { blobs: recordBlobs } = await oilRecordsStore.list({ prefix: `${vehicle.id}/` });
    if (recordBlobs.length === 0) return;

    const records = (
      await Promise.all(
        recordBlobs.map(
          (b) => oilRecordsStore.get(b.key, { type: "json" }) as Promise<OilRecord | null>
        )
      )
    )
      .filter((r): r is OilRecord => !!r)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

    const latest = records[0];
    if (!latest) return;
    checked++;

    const nextServiceDate =
      latest.nextServiceDate || defaultNextServiceDate(latest.date) || undefined;
    if (!nextServiceDate) return;

    const target = new Date(nextServiceDate);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > REMINDER_WINDOW_DAYS) return; // henüz zamanı gelmedi

    const alreadySent = await reminderLogStore.get(vehicle.id, { type: "text" });
    if (alreadySent === nextServiceDate) return; // bu döngü için zaten gönderildi

    const recordForMessage: OilRecord = { ...latest, nextServiceDate };
    const result = await sendSms(vehicle.ownerPhone, buildReminderMessage(vehicle, recordForMessage));
    if (result.sent) {
      await reminderLogStore.set(vehicle.id, nextServiceDate);
      sent++;
    }
  }

  // paginate:true ile tüm araç listesini belleğe tek seferde çekmek yerine sayfa
  // sayfa (1000'lik gruplar) işliyoruz; her sayfa içinde de küçük eşzamanlı
  // gruplar halinde ilerliyoruz. Zaman bütçesi dolarsa (çok büyük filo durumunda)
  // döngüyü güvenle kesip ne kadarının işlendiğini logluyoruz.
  outer: for await (const page of vehiclesStore.list({ paginate: true })) {
    const keys = page.blobs.map((b) => b.key);
    for (let i = 0; i < keys.length; i += CONCURRENCY) {
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        truncated = true;
        break outer;
      }
      const batch = keys.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map((k) => processVehicle(k)));
      scannedVehicles += batch.length;
    }
  }

  console.log(
    `[bakim-hatirlatma] ${scannedVehicles} araç tarandı, ${checked} bakım kaydı olan araç kontrol edildi, ${sent} hatırlatma gönderildi.` +
      (truncated
        ? " UYARI: 13 dakikalık zaman bütçesi doldu, tüm araçlar bu çalıştırmada taranamadı. " +
          "Filo büyüklüğü bu noktaya ulaştıysa (muhtemelen on binlerce araç), sıraya alma " +
          "(queue) tabanlı bir tasarıma geçilmesi önerilir."
        : "")
  );
};
