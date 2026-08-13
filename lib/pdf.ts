import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import type { OilRecord, Shop, Vehicle } from "./types";

export async function generateServiceReceiptPdf(
  shop: Shop,
  vehicle: Vehicle,
  record: OilRecord,
  verifyUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 595]); // A5 benzeri
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 36;
  let y = 595 - margin;

  const brand = rgb(0.145, 0.271, 0.635); // brand-700 yaklaşık
  const gray = rgb(0.4, 0.44, 0.5);
  const dark = rgb(0.06, 0.09, 0.16);

  // pdf-lib'in gömülü StandardFonts'u (Helvetica) WinAnsi kodlamasını kullanır — bu
  // kodlama ğ/Ğ, ı/İ, ş/Ş harflerini içermez (ç/ö/ü/Ç/Ö/Ü Latin-1'de olduğu için
  // sorunsuz). Bu harfler geçtiğinde pdf-lib hata fırlatıp isteği 500 ile
  // çökertiyordu (ör. "Yağ Filtresi", "Değiştirildi" etiketleri). Özel bir Türkçe
  // font gömmek yerine (ekstra bağımlılık + font dosyası gerektirir), burada sadece
  // desteklenmeyen dört harfi ASCII karşılığına çeviriyoruz — küçük bir görsel
  // ödün, ama fiş her zaman güvenilir şekilde üretiliyor.
  function winAnsiSafe(value: string): string {
    return value
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "G")
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "S");
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

  function line(yy: number) {
    page.drawLine({
      start: { x: margin, y: yy },
      end: { x: 420 - margin, y: yy },
      thickness: 0.75,
      color: rgb(0.85, 0.87, 0.9),
    });
  }

  // Başlık
  text(shop.name, margin, y, { size: 16, bold: true, color: brand });
  y -= 18;
  text("Yağ Bakım Servis Fişi", margin, y, { size: 11, color: gray });
  y -= 8;
  line(y);
  y -= 24;

  // Araç bilgisi
  text("ARAÇ", margin, y, { size: 9, bold: true, color: gray });
  y -= 16;
  text(vehicle.plateDisplay, margin, y, { size: 18, bold: true });
  y -= 20;
  text(
    `${vehicle.brand} ${vehicle.model}${vehicle.year ? " (" + vehicle.year + ")" : ""}`,
    margin,
    y,
    { size: 12 }
  );
  y -= 24;
  line(y);
  y -= 24;

  // Bakım detayları
  text("BAKIM DETAYLARI", margin, y, { size: 9, bold: true, color: gray });
  y -= 18;

  const rows: [string, string][] = [
    ["Tarih / Saat", `${record.date}  ${record.time}`],
    ["Yağ", `${record.oilBrand} ${record.oilModel}`],
    ["Miktar", `${record.quantityKg} kg`],
  ];
  if (record.km) rows.push(["Kilometre", `${record.km} km`]);
  rows.push(["Yağ Filtresi", record.filterChanged ? "Değiştirildi" : "Değiştirilmedi"]);
  if (record.nextServiceDate) rows.push(["Sonraki Bakım (önerilen)", record.nextServiceDate]);
  if (record.nextServiceKm) rows.push(["Sonraki Bakım Km (önerilen)", `${record.nextServiceKm} km`]);

  for (const [label, value] of rows) {
    text(label, margin, y, { size: 10, color: gray });
    text(value, margin + 190, y, { size: 10, bold: true });
    y -= 18;
  }

  if (record.note) {
    y -= 6;
    text("Not:", margin, y, { size: 10, color: gray });
    y -= 14;
    text(record.note, margin, y, { size: 10 });
    y -= 18;
  }

  y -= 12;
  line(y);
  y -= 24;

  // QR doğrulama
  const qrPng = await QRCode.toBuffer(verifyUrl, { type: "png", margin: 1, width: 220 });
  const qrImage = await pdfDoc.embedPng(qrPng);
  const qrSize = 90;
  page.drawImage(qrImage, {
    x: 420 - margin - qrSize,
    y: y - qrSize + 10,
    width: qrSize,
    height: qrSize,
  });
  text("Bakım geçmişini görüntülemek", margin, y - 20, { size: 9, color: gray });
  text("için QR kodu okutun.", margin, y - 32, { size: 9, color: gray });
  text(shop.name, margin, y - 52, { size: 9, bold: true });
  if (shop.phone) text(shop.phone, margin, y - 66, { size: 9, color: gray });

  text("Oto Künye ile oluşturulmuştur.", margin, 24, { size: 8, color: gray });

  return pdfDoc.save();
}
