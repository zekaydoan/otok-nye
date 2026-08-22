import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PLAN_LIMITS } from "./types";
import type { DailyStatsReport } from "./blobStore";

// Admin panelindeki "Bugünün İstatistikleri" indirme butonunun ürettiği PDF —
// Zeki'nin 22 Ağustos 2026 talebi: "panelden Bugünün istatistikleri pdf olarak
// insin. Kaç kişi ziyaret etti hangi şehirlerden ziyaret etti kaç kişi paket
// aldı kaç kişi partner olarak üye oldu bunların hepsini görelim". lib/pdf.ts
// (servis fişi) ile aynı pdf-lib deseni; ayrı bir dosyada tutulmasının nedeni
// ikisinin tamamen farklı okuyucu kitlesi/amaç taşıması (müşteriye verilen fiş
// vs. admin'in kendi kullanımı için özet rapor).
export interface DailyStatsReportPdfMeta {
  shopCount: number; // rapor anındaki toplam bayi sayısı (bağlam için)
  partnerCount: number; // rapor anındaki toplam partner sayısı (bağlam için)
}

// pdf-lib'in gömülü StandardFonts'u (Helvetica) WinAnsi kodlamasını kullanır —
// bu kodlama ğ/Ğ/ı/İ/ş/Ş harflerini içermez (bkz. lib/pdf.ts'teki aynı not).
// Özel bir Türkçe font gömmek yerine (ekstra bağımlılık + font dosyası
// gerektirir) burada da sadece desteklenmeyen dört harf ASCII karşılığına
// çevrilir — küçük bir görsel ödün, ama rapor her zaman güvenilir üretilir.
function winAnsiSafe(value: string): string {
  return value
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S");
}

const PAGE_WIDTH = 595; // A4
const PAGE_HEIGHT = 842;
const MARGIN = 48;

export async function generateDailyStatsReportPdf(
  report: DailyStatsReport,
  meta: DailyStatsReportPdfMeta
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const brand = rgb(0.145, 0.271, 0.635);
  const gray = rgb(0.4, 0.44, 0.5);
  const dark = rgb(0.06, 0.09, 0.16);
  const lineColor = rgb(0.85, 0.87, 0.9);

  let y = PAGE_HEIGHT - MARGIN;

  // Uzun şehir listelerinde tek sayfa dolarsa yeni sayfa açar — üst bilgiyi
  // tekrarlamadan sade şekilde devam eder.
  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function text(
    value: string,
    x: number,
    yy: number,
    opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}
  ) {
    page.drawText(winAnsiSafe(value), {
      x,
      y: yy,
      size: opts.size ?? 11,
      font: opts.bold ? fontBold : font,
      color: opts.color ?? dark,
    });
  }

  function hr(yy: number) {
    page.drawLine({
      start: { x: MARGIN, y: yy },
      end: { x: PAGE_WIDTH - MARGIN, y: yy },
      thickness: 0.75,
      color: lineColor,
    });
  }

  function sectionTitle(label: string) {
    ensureSpace(24);
    text(label, MARGIN, y, { size: 9, bold: true, color: gray });
    y -= 16;
  }

  function statRow(label: string, value: string) {
    ensureSpace(22);
    text(label, MARGIN, y, { size: 11, color: gray });
    text(value, PAGE_WIDTH - MARGIN - 140, y, { size: 13, bold: true });
    y -= 22;
  }

  // ---- Başlık ----
  text("OtoHafıza", MARGIN, y, { size: 20, bold: true, color: brand });
  y -= 24;
  const [yyyy, mm, dd] = report.date.split("-");
  text(`Gunluk Istatistik Raporu - ${dd}.${mm}.${yyyy}`, MARGIN, y, { size: 13, bold: true });
  y -= 8;
  hr(y);
  y -= 26;

  // ---- Genel özet ----
  sectionTitle("GENEL ÖZET");
  statRow("Toplam Ziyaret (Sayfa Görüntüleme)", report.pageviews.toLocaleString("tr-TR"));
  statRow("Yeni Bayi (Usta) Kaydı", report.newShopCount.toLocaleString("tr-TR"));
  statRow("Ücretli Pakete Geçen", report.totalPaidPlanStarts.toLocaleString("tr-TR"));
  statRow("Yeni Saha Satış Partneri", report.newPartnerCount.toLocaleString("tr-TR"));
  y -= 6;
  hr(y);
  y -= 24;

  // ---- Paket detayı (o gün ücretli plana başlayanlar) ----
  if (report.paidPlanStarts.length > 0) {
    sectionTitle("PAKET DETAYI");
    for (const p of report.paidPlanStarts) {
      statRow(PLAN_LIMITS[p.plan].label, p.count.toString());
    }
    y -= 6;
    hr(y);
    y -= 24;
  }

  // ---- Şehir dağılımı ----
  sectionTitle("ŞEHİRLERE GÖRE ZİYARET");
  if (report.cityVisits.length === 0) {
    text("Bu gün için şehir verisi yok.", MARGIN, y, { size: 10, color: gray });
    y -= 18;
  } else {
    for (const c of report.cityVisits) {
      ensureSpace(16);
      text(c.city, MARGIN, y, { size: 10 });
      text(c.count.toLocaleString("tr-TR"), PAGE_WIDTH - MARGIN - 140, y, { size: 10, bold: true });
      y -= 16;
    }
    if (report.unknownLocationViews > 0) {
      ensureSpace(16);
      text("Bilinmeyen konum", MARGIN, y, { size: 10, color: gray });
      text(report.unknownLocationViews.toLocaleString("tr-TR"), PAGE_WIDTH - MARGIN - 140, y, {
        size: 10,
        bold: true,
        color: gray,
      });
      y -= 16;
    }
  }
  y -= 10;
  hr(y);
  y -= 24;

  // ---- Bağlam (rapor anındaki toplamlar) ----
  sectionTitle("BAĞLAM (Rapor Anındaki Toplamlar)");
  statRow("Toplam Bayi Sayısı", meta.shopCount.toLocaleString("tr-TR"));
  statRow("Toplam Partner Sayısı", meta.partnerCount.toLocaleString("tr-TR"));

  // ---- Alt bilgi ----
  ensureSpace(20);
  const now = new Date();
  const generatedAt = now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  text(`OtoHafıza admin paneli ile ${generatedAt} tarihinde oluşturuldu.`, MARGIN, MARGIN - 8, {
    size: 8,
    color: gray,
  });

  return pdfDoc.save();
}
