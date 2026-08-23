import { NextRequest, NextResponse } from "next/server";
import {
  accruePartnerRecurringCommission,
  checkAndAccruePartnerConversionBonus,
  getShopById,
  getSubscriptionCheckoutTokenLink,
  linkSubscriptionToShop,
  recordPlanStart,
  updateShopFields,
} from "@/lib/blobStore";
import { retrieveSubscriptionCheckoutFormResult } from "@/lib/iyzicoSubscription";
import { notifyAdmins, escapeHtml } from "@/lib/email";
import { PLAN_LIMITS } from "@/lib/types";

function getSiteUrl(req: NextRequest): string {
  return process.env.URL || req.nextUrl.origin;
}

// BİLEREK /dashboard/ altında DEĞİL (bkz. app/plan/sonuc/page.tsx'teki yorum) —
// iyzico'dan geri dönüş yönlendirmesi tarayıcı tarafından "siteler arası"
// sayıldığından dashboard'un oturum kontrolüne asla güvenilir şekilde
// ulaşamıyordu (aynı kök neden, etiket siparişi akışında canlıda doğrulandı).
function resultRedirect(req: NextRequest, params: Record<string, string>): NextResponse {
  const url = new URL("/plan/sonuc", getSiteUrl(req));
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, { status: 303 });
}

// iyzico, kullanıcının abonelik Checkout Form'unda kartıyla ödemeyi
// tamamlamasının ardından tarayıcıyı bu adrese bir form POST'uyla yönlendirir
// (yalnızca `token` alanını içerir) — bkz. app/api/etiket-siparis/callback ile
// aynı desen. Asıl doğrulama burada, token ile GET-Retrieve çağrısı yapılarak
// gerçekleşir — callback'teki verilere asla doğrudan güvenilmez.
//
// Plan değişikliği + partner komisyon mantığı BİLEREK burada da (webhook'la
// aynı şekilde) uygulanıyor — kullanıcı ödemeyi tamamlar tamamlamaz planının
// aktif olduğunu görsün diye (webhook'un gelmesini beklemek gereksiz bir
// gecikme olurdu). checkAndAccruePartnerConversionBonus/
// accruePartnerRecurringCommission İDEMPOTENT (bkz. lib/blobStore.ts) — aynı
// olay için webhook DAHA SONRA da tetiklenirse (iyzico'nun subscription.order.success
// bildirimi ilk ödeme için de gelebilir) çift kayıt/çift komisyon OLUŞMAZ.
export async function POST(req: NextRequest) {
  let token: string | null = null;
  try {
    const formData = await req.formData();
    token = (formData.get("token") as string) || null;
  } catch {
    // form-data ayrıştırılamadıysa token null kalır, aşağıda ele alınır.
  }
  if (!token) return resultRedirect(req, { durum: "hata" });

  const link = await getSubscriptionCheckoutTokenLink(token);
  if (!link) return resultRedirect(req, { durum: "hata" });

  const result = await retrieveSubscriptionCheckoutFormResult(token);

  if (
    result.status !== "success" ||
    result.data?.subscriptionStatus !== "ACTIVE" ||
    !result.data.referenceCode
  ) {
    return resultRedirect(req, { durum: "hata" });
  }

  const subscriptionReferenceCode = result.data.referenceCode;
  await linkSubscriptionToShop(subscriptionReferenceCode, link.shopId, link.plan);

  try {
    // Saha Partner Ağı: dönüşüm bonusu, planın DEĞİŞMEDEN önceki hâline göre
    // karar verilmeli — bu yüzden updateShopFields'tan önce mevcut plan okunur
    // (bkz. app/api/webhooks/iyzico-abonelik'teki aynı desen).
    const shopBefore = await getShopById(link.shopId);
    const previousPlan = shopBefore?.plan;

    await updateShopFields(link.shopId, (shop) => ({
      ...shop,
      plan: link.plan,
      iyzicoSubscriptionReferenceCode: subscriptionReferenceCode,
      planRenewsAt: new Date().toISOString(),
      pendingPlan: undefined,
      pendingPlanRequestedAt: undefined,
    }));
    await recordPlanStart(link.shopId, link.plan);

    if (previousPlan) {
      checkAndAccruePartnerConversionBonus(link.shopId, previousPlan).catch((err) =>
        console.error("[shop-plan-callback] Partner dönüşüm bonusu kontrolü başarısız:", err)
      );
    }
    const periodMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    accruePartnerRecurringCommission(link.shopId, periodMonth).catch((err) =>
      console.error("[shop-plan-callback] Partner recurring komisyon kontrolü başarısız:", err)
    );

    notifyAdmins(
      `Yeni abonelik başladı — ${shopBefore?.name ?? link.shopId}`,
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <p><strong>${escapeHtml(shopBefore?.name ?? "")}</strong>,
        <strong>${escapeHtml(PLAN_LIMITS[link.plan].label)}</strong> planına abone oldu (iyzico
        Abonelik, otomatik tekrarlayan tahsilat).</p>
        <p><a href="https://otohafiza.com/admin/bayiler">Admin panelinden görüntüle</a></p>
      </div>`
    ).catch(() => {});
  } catch (err) {
    console.error("[shop-plan-callback] Plan güncellenemedi:", err);
    return resultRedirect(req, { durum: "hata" });
  }

  return resultRedirect(req, { plan: link.plan, durum: "basarili" });
}
