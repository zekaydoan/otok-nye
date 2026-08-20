import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { OTOHAFIZA_ICON_160_PNG_BASE64 } from "./otohafizaIconBase64";

// Genel stok etiket ekranındaki (bkz. app/admin/stok/[batchId]) tarayıcının
// "Yazdır / PDF Kaydet" (window.print) yolu, kullanıcının yazıcı ayarlarına ve
// tarayıcının PDF motoruna bağlı olarak QR kodları rastgele bir çözünürlükte
// rasterize edebiliyor — Zeki'nin 20 Ağustos 2026 talebi ("çözünürlüğün
// bozulmayacağı bir indir butonu") tam olarak bunu hedefliyor. Bu dosya, her
// QR kodu yüksek çözünürlükte (600x600px) kendimiz üretip pdf-lib ile
// doğrudan bir PDF'e gömerek, tarayıcı/yazıcı ayarından tamamen bağımsız,
// her zaman keskin bir çıktı garanti eder.
//
// Not: pdf-lib WinAnsi kodlaması ğ/Ğ/ı/İ/ş/Ş harflerini desteklemez (bkz.
// lib/pdf.ts winAnsiSafe ile aynı bilinen kısıtlama) — burada da aynı ASCII
// karşılık dönüşümü kullanılır.
function winAnsiSafe(value: string): string {
  return value
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S");
}

export interface StickerLabelPdfItem {
  token: string;
}

export interface StickerLabelPdfOptions {
  // Etikette basılı görünecek bayi adı/telefonu — genel stok partilerinde YOK
  // (henüz hiçbir bayiye ait değiller), sadece mevcut sipariş bazlı akış için
  // ileride kullanılabilir diye opsiyonel bırakıldı.
  labelName?: string;
  labelPhone?: string;
  // Logoyu gömüp gömmeme (varsayılan true) — lib/otohafizaIconBase64.ts'teki
  // sabit base64'ten okunur, dosya sistemi/ağ erişimi GEREKTİRMEZ (bkz. o
  // dosyadaki yorum: self-fetch denemesi üretimde 502'ye yol açmıştı).
  includeLogo?: boolean;
}

const PAGE_WIDTH = 595.28; // A4, pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 28;
const GAP = 14;
const LABEL_WIDTH = 160;
const LABEL_HEIGHT = 196;
const QR_PIXEL_SIZE = 600; // baskıda pikselleşmeyecek kadar yüksek kaynak çözünürlük

const BRAND = rgb(0.145, 0.271, 0.635);
const DARK = rgb(0.06, 0.09, 0.16);
const GRAY = rgb(0.4, 0.44, 0.5);
const ACCENT = rgb(0.82, 0.42, 0.2);
const BORDER = rgb(0.72, 0.74, 0.78);

export async function generateStickerLabelsPdf(
  baseUrl: string,
  items: StickerLabelPdfItem[],
  opts: StickerLabelPdfOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const includeLogo = opts.includeLogo !== false;
  const logoImage = includeLogo
    ? await pdfDoc.embedPng(Buffer.from(OTOHAFIZA_ICON_160_PNG_BASE64, "base64"))
    : null;

  const cols = Math.max(1, Math.floor((PAGE_WIDTH - 2 * MARGIN + GAP) / (LABEL_WIDTH + GAP)));
  const rows = Math.max(1, Math.floor((PAGE_HEIGHT - 2 * MARGIN + GAP) / (LABEL_HEIGHT + GAP)));
  const perPage = cols * rows;

  // Her QR kodunun PNG'sini ÖNCEDEN, hepsini birden paralel üretiyoruz — önceki
  // sürümde her etiket için sırayla (bir bir await ederek) üretiliyordu, bu da
  // büyük partilerde toplam süreyi katlayıp Netlify fonksiyon zaman aşımına
  // (ve gözlemlenen HTTP 502'ye) katkı yapıyordu (bkz. 20 Ağustos 2026).
  const qrPngs = await Promise.all(
    items.map((item) =>
      QRCode.toBuffer(`${baseUrl}/e/${item.token}`, {
        type: "png",
        errorCorrectionLevel: "H",
        margin: 1,
        width: QR_PIXEL_SIZE,
      })
    )
  );

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let indexOnPage = 0;

  for (let i = 0; i < items.length; i++) {
    if (indexOnPage === perPage) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      indexOnPage = 0;
    }
    const col = indexOnPage % cols;
    const row = Math.floor(indexOnPage / cols);
    const x = MARGIN + col * (LABEL_WIDTH + GAP);
    // pdf-lib'te y ekseni sayfanın ALTINDAN yukarı doğru artar — en üst satırdan
    // başlamak için sayfa yüksekliğinden düşülerek hesaplanır.
    const y = PAGE_HEIGHT - MARGIN - LABEL_HEIGHT - row * (LABEL_HEIGHT + GAP);

    // Dış çerçeve
    page.drawRectangle({
      x,
      y,
      width: LABEL_WIDTH,
      height: LABEL_HEIGHT,
      borderColor: BORDER,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    // Üst marka şeridi
    const headerHeight = 18;
    page.drawRectangle({
      x,
      y: y + LABEL_HEIGHT - headerHeight,
      width: LABEL_WIDTH,
      height: headerHeight,
      color: BRAND,
    });
    const headerText = winAnsiSafe("BAKIM GEÇMİŞİ");
    const headerFontSize = 7.5;
    const headerTextWidth = fontBold.widthOfTextAtSize(headerText, headerFontSize);
    page.drawText(headerText, {
      x: x + (LABEL_WIDTH - headerTextWidth) / 2,
      y: y + LABEL_HEIGHT - headerHeight + 6,
      size: headerFontSize,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // QR kodu — yukarıda paralel üretilmiş PNG'lerden gömülür
    const qrImage = await pdfDoc.embedPng(qrPngs[i]);
    const qrDrawSize = 100;
    const qrX = x + (LABEL_WIDTH - qrDrawSize) / 2;
    const qrY = y + LABEL_HEIGHT - headerHeight - qrDrawSize - 16;

    page.drawRectangle({
      x: qrX - 4,
      y: qrY - 4,
      width: qrDrawSize + 8,
      height: qrDrawSize + 8,
      borderColor: DARK,
      borderWidth: 1.5,
      color: rgb(1, 1, 1),
    });
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrDrawSize, height: qrDrawSize });

    // Marka bilinirliği için ortadaki logo — client tarafındaki qrcode.react
    // imageSettings ile aynı oran (~%20), bkz. components/StickerTokenGrid.tsx
    if (logoImage) {
      const logoSize = qrDrawSize * 0.2;
      page.drawImage(logoImage, {
        x: qrX + (qrDrawSize - logoSize) / 2,
        y: qrY + (qrDrawSize - logoSize) / 2,
        width: logoSize,
        height: logoSize,
      });
    }

    // Alt açıklama
    const caption = winAnsiSafe("QR kodu okutup aracınıza kaydedin");
    const captionFontSize = 6.5;
    const captionWidth = font.widthOfTextAtSize(caption, captionFontSize);
    page.drawText(caption, {
      x: x + (LABEL_WIDTH - captionWidth) / 2,
      y: qrY - 14,
      size: captionFontSize,
      font,
      color: GRAY,
    });

    // Bayi adı/telefonu (varsa) — genel stok partilerinde basılmaz
    if (opts.labelName) {
      const name = winAnsiSafe(opts.labelName);
      const nameFontSize = 8;
      const nameWidth = fontBold.widthOfTextAtSize(name, nameFontSize);
      page.drawText(name, {
        x: x + (LABEL_WIDTH - nameWidth) / 2,
        y: y + 14,
        size: nameFontSize,
        font: fontBold,
        color: ACCENT,
      });
      if (opts.labelPhone) {
        const phone = winAnsiSafe(opts.labelPhone);
        const phoneFontSize = 7;
        const phoneWidth = font.widthOfTextAtSize(phone, phoneFontSize);
        page.drawText(phone, {
          x: x + (LABEL_WIDTH - phoneWidth) / 2,
          y: y + 5,
          size: phoneFontSize,
          font,
          color: GRAY,
        });
      }
    }

    indexOnPage++;
  }

  return pdfDoc.save();
}
