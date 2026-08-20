import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerStockBatchById, listStickerTokensByBatch } from "@/lib/blobStore";
import { generateStickerLabelsPdf } from "@/lib/stickerLabelsPdf";

// Genel stok etiket partisini (bkz. lib/types.ts StickerStockBatch) yüksek
// çözünürlüklü, doğrudan indirilebilir bir PDF olarak üretir. Tarayıcının
// "Yazdır / PDF Kaydet" (window.print) yolundan BİLEREK ayrı: o yol, tarayıcının
// PDF motoruna ve kullanıcının yazıcı ayarlarına bağlı olarak QR kodları
// öngörülemeyen bir çözünürlükte rasterize edebiliyor. Burada her QR kendimiz
// 600x600px üretip pdf-lib ile gömüyoruz — çıktı her zaman keskin (bkz.
// lib/stickerLabelsPdf.ts, Zeki'nin 20 Ağustos 2026 talebi).
//
// Önemli: siteUrl için req.nextUrl.origin kullanılıyor (headers()/next-headers
// DEĞİL) ve logo lib/otohafizaIconBase64.ts'teki sabit base64'ten gömülüyor —
// ilk sürüm sitenin kendi domainine "self-fetch" ile logo indiriyordu, bu da
// üretimde HTTP 502 ile sonuçlandı (muhtemelen ek ağ isteğinin fonksiyon zaman
// aşımına katkı yapması). Artık dış bağımlılık yok, tamamen kendi içinde çalışır.
export async function GET(req: NextRequest, { params }: { params: { batchId: string } }) {
  try {
    const adminShopId = await getCurrentAdminShopId();
    if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

    const batch = await getStickerStockBatchById(params.batchId);
    if (!batch) return NextResponse.json({ error: "Parti bulunamadı." }, { status: 404 });

    const tokens = await listStickerTokensByBatch(batch.id);
    if (tokens.length === 0) {
      return NextResponse.json({ error: "Bu partide henüz etiket yok." }, { status: 400 });
    }

    const pdfBytes = await generateStickerLabelsPdf(
      req.nextUrl.origin,
      tokens.map((t) => ({ token: t.token }))
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="genel-stok-etiketleri-${batch.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // Ham bir exception fonksiyonun çökmesine (ve tarayıcıda opaque bir HTTP 502
    // görülmesine) yol açmasın diye — en azından okunabilir bir hata dönsün ve
    // Netlify fonksiyon loglarında görülebilsin diye console.error ile kaydedilir.
    console.error("Genel stok PDF üretim hatası:", err);
    return NextResponse.json({ error: "PDF üretilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
