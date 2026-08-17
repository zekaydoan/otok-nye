import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  getIyzicoPricingPlanCode,
  getShopById,
  linkSubscriptionCheckoutToken,
  recordPlanStart,
  updateShopFields,
} from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PAID_PLANS_DISABLED_MESSAGE, PAID_PLANS_ENABLED } from "@/lib/planAvailability";
import { initializeSubscriptionCheckoutForm } from "@/lib/iyzicoSubscription";
import { normalizeTrPhone } from "@/lib/whatsapp";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

const IDENTITY_NUMBER_REGEX = /^\d{11}$/;

function getSiteUrl(req: NextRequest): string {
  return process.env.URL || req.nextUrl.origin;
}

// 18 Ağustos 2026: bu uç nokta artık ücretli bir plan seçildiğinde admin'e
// "onay bekliyor" e-postası atmıyor — doğrudan iyzico Abonelik Checkout
// Form'unu başlatıp embed edilecek `checkoutFormContent`'i döner (bkz.
// components/SubscriptionCheckoutForm, app/dashboard/plan/odeme). Gerçek plan
// değişikliği/komisyon tahakkuku KART ÖDEMESİ onaylandıktan sonra
// app/api/shop/plan/callback'te yapılır — bu uç nokta yalnızca ödemeyi
// BAŞLATIR, planı hemen değiştirmez (free'ye anında dönüş hariç, o risksiz).
//
// PAID_PLANS_ENABLED hâlâ false olduğu sürece bu akışa hiçbir istek
// ulaşamaz (aşağıdaki kontrol) — canlıya, iyzico sandbox'ta uçtan uca test
// edilip Zeki bilinçli olarak bayrağı açana kadar hiçbir gerçek bayi buraya
// erişemez.
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  // Plan/fatura değişikliği yalnızca hesap sahibine açık — çalışan hesapları
  // bu uç noktayı çağırırsa 403 alır (bkz. lib/auth.ts SessionInfo.role).
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }
  const shopId = session.shopId;

  const body = await req.json();
  const { plan, identityNumber } = body as { plan?: Plan; identityNumber?: string };
  if (!plan || !(plan in PLAN_LIMITS)) {
    return NextResponse.json({ error: "Geçersiz plan." }, { status: 400 });
  }

  // Şirket kuruluşu tamamlanana kadar yalnızca Free plan kabul ediliyor (bkz.
  // lib/planAvailability.ts) — free'ye dönüş bu kısıtlamadan etkilenmez.
  if (plan !== "free" && !PAID_PLANS_ENABLED) {
    return NextResponse.json(
      { error: PAID_PLANS_DISABLED_MESSAGE, code: "paid_plans_disabled" },
      { status: 403 }
    );
  }

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  // free'ye dönüş risksiz — anında uygulanır, bekleyen bir yükseltme talebi de
  // bu vazgeçmeyle birlikte iptal edilir.
  if (plan === "free") {
    try {
      await updateShopFields(shopId, (s) => ({
        ...s,
        plan: "free",
        pendingPlan: undefined,
        pendingPlanRequestedAt: undefined,
      }));
    } catch {
      return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
    }
    await recordPlanStart(shopId, "free");
    return NextResponse.json({ ok: true });
  }

  if (shop.plan === plan) {
    return NextResponse.json({ error: "Zaten bu plandasınız." }, { status: 400 });
  }

  // Ücretsiz olmayan her plan için fatura kesileceğinden (bkz. lib/billing.ts),
  // fatura bilgileri eksikse ödeme başlatılmaz — istemci bu koddan yakalayıp
  // /dashboard/fatura-bilgileri'ne yönlendirir.
  if (!isBillingInfoComplete(shop.billingInfo)) {
    return NextResponse.json(
      { error: "Devam etmeden önce fatura bilgilerinizi kaydetmeniz gerekiyor.", requiresBilling: true },
      { status: 409 }
    );
  }

  if (!identityNumber || !IDENTITY_NUMBER_REGEX.test(identityNumber)) {
    return NextResponse.json({ error: "Geçerli bir T.C. Kimlik No giriniz (11 hane)." }, { status: 400 });
  }

  const pricingPlanReferenceCode = await getIyzicoPricingPlanCode(plan);
  if (!pricingPlanReferenceCode) {
    // Admin henüz app/admin/iyzico-abonelik'ten kurulumu çalıştırmadı — bu,
    // gerçek bayilerin asla göremeyeceği bir durum (PAID_PLANS_ENABLED zaten
    // kapalıyken buraya kimse gelemez), ama Zeki test ederken kurulumu atlarsa
    // anlamlı bir hata görsün diye kontrol ediliyor.
    return NextResponse.json(
      { error: "Abonelik sistemi henüz hazır değil, lütfen daha sonra tekrar deneyin." },
      { status: 503 }
    );
  }

  const gsmDigits = normalizeTrPhone(shop.billingInfo!.phone || shop.phone);
  if (!gsmDigits) {
    return NextResponse.json(
      {
        error:
          "Kayıtlı telefon numaranız geçerli formatta değil, lütfen fatura bilgilerinizden güncelleyin.",
      },
      { status: 400 }
    );
  }

  const [firstName, ...rest] = shop.name.trim().split(/\s+/);
  const contactName = shop.billingInfo!.fullName || shop.billingInfo!.companyName || shop.name;
  const siteUrl = getSiteUrl(req);

  const initResult = await initializeSubscriptionCheckoutForm({
    pricingPlanReferenceCode,
    callbackUrl: `${siteUrl}/api/shop/plan/callback`,
    conversationId: `${shopId}_${plan}_${Date.now()}`,
    subscriptionInitialStatus: "ACTIVE",
    customer: {
      name: firstName || shop.name,
      surname: rest.join(" ") || "İşletme",
      email: shop.email,
      gsmNumber: `+${gsmDigits}`,
      identityNumber,
      billingAddress: {
        address: shop.billingInfo!.address,
        contactName,
        city: shop.city || "İstanbul",
        country: "Turkey",
      },
    },
  });

  if (initResult.status !== "success" || !initResult.token || !initResult.checkoutFormContent) {
    return NextResponse.json(
      { error: initResult.errorMessage || "Ödeme başlatılamadı, lütfen tekrar deneyin." },
      { status: 502 }
    );
  }

  await linkSubscriptionCheckoutToken(initResult.token, shopId, plan);

  return NextResponse.json({ checkoutFormContent: initResult.checkoutFormContent, token: initResult.token });
}
