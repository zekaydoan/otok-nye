import type { OilRecord, Vehicle } from "./types";

// Üretici bakım kılavuzları taraması (Ford, Toyota, VW, Fiat, Renault, Hyundai vb.)
// genel olarak tam sentetik yağda 10.000-15.000 km VEYA 12 ay (hangisi önce
// gelirse) öneriyor; 12.500 km / 12 ay bu aralığın ortalaması olarak alındı.
const DEFAULT_INTERVAL_MONTHS = 12;
const DEFAULT_INTERVAL_KM = 12500;

export function defaultNextServiceDate(fromDateISO: string): string {
  const d = new Date(fromDateISO);
  d.setMonth(d.getMonth() + DEFAULT_INTERVAL_MONTHS);
  return d.toISOString().slice(0, 10);
}

export function defaultNextServiceKm(currentKm?: number): number | undefined {
  if (!currentKm) return undefined;
  return currentKm + DEFAULT_INTERVAL_KM;
}

export function buildConfirmationMessage(vehicle: Vehicle, record: OilRecord): string {
  const parts = [
    `${vehicle.plateDisplay} aracınızın yağ bakımı ${record.date} tarihinde tamamlandı.`,
    `${record.oilBrand} ${record.oilModel} (${record.quantityKg} kg) kullanıldı.`,
  ];
  if (record.nextServiceDate) {
    parts.push(`Sonraki bakım önerilen tarih: ${record.nextServiceDate}.`);
  }
  parts.push(`Bakım geçmişiniz için: ${record.shopName}`);
  return parts.join(" ");
}

export function buildReminderMessage(vehicle: Vehicle, record: OilRecord): string {
  return `Merhaba, ${vehicle.plateDisplay} plakalı aracınızın yağ bakım zamanı yaklaşıyor (önerilen tarih: ${record.nextServiceDate}). Randevu için ${record.shopName} ile iletişime geçebilirsiniz.`;
}

// ---------- Kilometre Tutarlılığı ----------
export interface KmIssue {
  recordId: string;
  date: string;
  km: number;
  previousDate: string;
  previousKm: number;
}

// Kayıtları kronolojik sıraya dizip kilometrenin hiç geriye gitmediğini kontrol eder.
// Geriye gitme, ikinci el satışlarında km düşürme şüphesinin klasik göstergesidir.
export function checkKmConsistency(records: OilRecord[]): KmIssue[] {
  const sorted = [...records]
    .filter((r) => typeof r.km === "number")
    .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));

  const issues: KmIssue[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (typeof prev.km === "number" && typeof curr.km === "number" && curr.km < prev.km) {
      issues.push({
        recordId: curr.id,
        date: curr.date,
        km: curr.km,
        previousDate: prev.date,
        previousKm: prev.km,
      });
    }
  }
  return issues;
}

// ---------- Bakım Düzenliliği Skoru ----------
export type MaintenanceTier = "excellent" | "good" | "poor" | "insufficient";

export interface MaintenanceScore {
  tier: MaintenanceTier;
  label: string;
  onTimeRatio: number | null;
  onTimeCount: number;
  totalTransitions: number;
}

const GRACE_DAYS = 30;

// Bir kaydın önerdiği "sonraki bakım tarihi" ile bir sonraki gerçek kaydın tarihini
// karşılaştırarak bakımların zamanında yapılıp yapılmadığını puanlar.
export function computeMaintenanceScore(records: OilRecord[]): MaintenanceScore {
  const sorted = [...records].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));

  let onTimeCount = 0;
  let totalTransitions = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (!prev.nextServiceDate) continue;
    totalTransitions++;
    const expected = new Date(prev.nextServiceDate);
    expected.setDate(expected.getDate() + GRACE_DAYS);
    const actual = new Date(curr.date);
    if (actual.getTime() <= expected.getTime()) onTimeCount++;
  }

  if (totalTransitions === 0) {
    return {
      tier: "insufficient",
      label: "Yeterli Veri Yok",
      onTimeRatio: null,
      onTimeCount,
      totalTransitions,
    };
  }

  const ratio = onTimeCount / totalTransitions;
  if (ratio >= 0.8) {
    return { tier: "excellent", label: "Düzenli Bakımlı", onTimeRatio: ratio, onTimeCount, totalTransitions };
  }
  if (ratio >= 0.5) {
    return { tier: "good", label: "Bakımlı", onTimeRatio: ratio, onTimeCount, totalTransitions };
  }
  return { tier: "poor", label: "Düzensiz Bakım", onTimeRatio: ratio, onTimeCount, totalTransitions };
}
