import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerStockBatchById, listStickerTokensByBatch } from "@/lib/blobStore";
import { generateStickerLabelsPdf } from "@/lib/stickerLabelsPdf";

// Fiziksel etikete kalıcı olarak basılacak QR kodları her zaman sitenin gerçek,
// kalıcı adresine gitmelidir — bkz. app/admin/stok/[batchId]/page.tsx'teki aynı
// gerekçe (process.env.URL/DEPLOY_URL güvenilir değil, host header kullanılır).
function getPermanentSiteUrl(): string {
  const host = headers().get("host");
  if (!host) return process.env.URL || "https://otohafiza.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

// Genel stok etiket partisini (bkz. lib/types.ts StickerStockBatch) yüksek
// çözünürlüklü, doğrudan indirilebilir bir PDF olarak üretir. Tarayıcının
// "Yazdır / PDF Kaydet" (window.print) yolundan BİLEREK ayrı: o yol, tarayıcının
// PDF motoruna ve kullanıcının yazıcı ayarlarına bağlı olarak QR kodları
// öngörülemeyen bir çözünürlükte rasterize edebiliyor. Burada her QR kendimiz
// 600x600px üretip pdf-lib ile gömüyoruz — çıktı her zaman keskin (bkz.
// lib/stickerLabelsPdf.ts, Zeki'nin 20 Ağustos 2026 talebi).
export async function GET(req: NextRequest, { params }: { params: { batchId: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const batch = await getStickerStockBatchById(params.batchId);
  if (!batch) return NextResponse.json({ error: "Parti bulunamadı." }, { status: 404 });

  const tokens = await listStickerTokensByBatch(batch.id);
  if (tokens.length === 0) {
    return NextResponse.json({ error: "Bu partide henüz etiket yok." }, { status: 400 });
  }

  const siteUrl = getPermanentSiteUrl();

  // Logo dosyasını sunucu dosya sisteminden değil, sitenin kendi public
  // klasöründen HTTP ile indiriyoruz — Netlify serverless fonksiyon
  // paketlemesinde public/ dosyalarına doğrudan fs erişimi güvenilir değil,
  // ama /icon-512.png zaten istemci tarafında (bkz. StickerEditor,
  // StickerTokenGrid) sorunsuz servis ediliyor.
  let logoPngBytes: Uint8Array | undefined;
  try {
    const logoRes = await fetch(`${siteUrl}/icon-512.png`);
    if (logoRes.ok) {
      logoPngBytes = new Uint8Array(await logoRes.arrayBuffer());
    }
  } catch {
    // Logo alınamazsa PDF logosuz üretilir — indirme işlemini engellemeye değmez.
  }

  const pdfBytes = await generateStickerLabelsPdf(
    siteUrl,
    tokens.map((t) => ({ token: t.token })),
    { logoPngBytes }
  );

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="genel-stok-etiketleri-${batch.id.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
