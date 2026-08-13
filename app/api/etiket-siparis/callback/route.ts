import { NextRequest, NextResponse } from "next/server";
import { getStickerOrderIdByToken, updateStickerOrder } from "@/lib/blobStore";
import { retrieveCheckoutForm } from "@/lib/iyzico";

function getSiteUrl(req: NextRequest): string {
  return process.env.URL || process.env.DEPLOY_URL || req.nextUrl.origin;
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
      await updateStickerOrder(orderId, (order) => ({
        ...order,
        status: "odendi",
        paymentToken: token as string,
        paymentId: retrieveResult.paymentId,
        updatedAt: new Date().toISOString(),
      }));
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
