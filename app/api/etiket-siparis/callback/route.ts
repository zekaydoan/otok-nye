import { NextRequest, NextResponse } from "next/server";
import { getStickerOrderIdByToken, updateStickerOrder } from "@/lib/blobStore";
import { escapeHtml, notifyAdmins } from "@/lib/email";
import { retrieveCheckoutForm } from "@/lib/iyzico";

function getSiteUrl(req: NextRequest): string {
  return process.env.URL || req.nextUrl.origin;
}

function resultRedirect(req: NextRequest, params: Record<string, string>): NextResponse {
  const url = new URL("/dashboard/etiket-siparis/sonuc", getSiteUrl(req));
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, { status: 303 });
}

// iyzico, kullanıcının kartıyla ödemeyi tamamlamasının ardından tarayıcıyı bu adrese
// bir form POST'u ile yönlendirir (yalnızca `token` alanını içerir — sipariş kimliğini
// içermez, bu yüzden initialize sırasında kaydettiğimiz token->sipariş eşlemesini
// kullanıyoruz). Asıl doğrulama burada, token ile CF-Retrieve çağrısı yapılarak
// gerçekleşir — callback'teki verilere asla doğrudan güvenilmez.
export async function POST(req: NextRequest) {
  let token: string | null = null;
  try {
    const formData = await req.formData();
    token = (formData.get("token") as string) || null;
  } catch {
    // form-data ayrıştırılamadıysa token null kalır, aşağıda ele alınır.
  }
  if (!token) return resultRedirect(req, { durum: "hata" });

  const orderId = await getStickerOrderIdByToken(token);
  if (!orderId) return resultRedirect(req, { durum: "hata" });

  const retrieveResult = await retrieveCheckoutForm(token, orderId);

  try {
    if (retrieveResult.status === "success" && retrieveResult.paymentStatus === "SUCCESS") {
      const paidOrder = await updateStickerOrder(orderId, (order) => ({
        ...order,
        status: "odendi",
        paymentToken: token as string,
        paymentId: retrieveResult.paymentId,
        updatedAt: new Date().toISOString(),
      }));
      // Muhasebe/ölçüm tutarlılığı için: iyzico'nun doğruladığı gerçek tahsilat
      // (paidPrice) ile bizim sipariş üzerinde hesapladığımız tutarı (totalPriceTry)
      // karşılaştır ve uyuşmazlık varsa logla. Bu, Meta Pixel Purchase eventinin
      // hangi tutarla gönderileceğini ETKİLEMEZ (o her zaman totalPriceTry'yi
      // kullanır, bkz. purchase-tracked uç noktası) — ödeme zaten iyzico
      // tarafından SUCCESS olarak doğrulandı, burada akışı durdurmuyoruz, sadece
      // sonradan incelenebilmesi için bir uyarı bırakıyoruz.
      if (
        typeof retrieveResult.paidPrice === "number" &&
        Math.abs(retrieveResult.paidPrice - paidOrder.totalPriceTry) > 0.01
      ) {
        console.warn(
          `[etiket-siparis] Tutar uyuşmazlığı — sipariş ${orderId}: totalPriceTry=${paidOrder.totalPriceTry}, iyzico paidPrice=${retrieveResult.paidPrice}`
        );
      }

      // Admin'e siparişin gerçekten ödendiğinde haber verilir — henüz ödeme
      // yapılmamış/başarısız denemelerde bildirim atılmaz, aksi hâlde her
      // yarım kalan ödeme denemesinde admin'i gereksiz yere uyarmış oluruz.
      await notifyAdmins(
        `Yeni etiket siparişi ödendi — ${paidOrder.shopName}`,
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <p><strong>${escapeHtml(paidOrder.shopName)}</strong>, ${paidOrder.quantity} adet etiket için
          ${paidOrder.totalPriceTry.toLocaleString("tr-TR")}₺ ödedi.</p>
          <p><a href="https://otohafiza.com/admin/siparisler">Admin panelinden görüntüle</a></p>
        </div>`
      );
    } else {
      await updateStickerOrder(orderId, (order) => ({
        ...order,
        status: "odeme_basarisiz",
        paymentToken: token as string,
        updatedAt: new Date().toISOString(),
      }));
    }
  } catch {
    // Eşzamanlı güncelleme çakışması — sipariş sonuç sayfasında yine de mevcut
    // durum gösterilecek, kullanıcı deneyimini bozmamak için hata yutuluyor.
  }

  return resultRedirect(req, { siparis: orderId });
}
