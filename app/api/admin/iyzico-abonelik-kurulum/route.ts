import { NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  getIyzicoPricingPlanCode,
  getIyzicoSubscriptionProductCode,
  setIyzicoPricingPlanCode,
  setIyzicoSubscriptionProductCode,
} from "@/lib/blobStore";
import { createPricingPlan, createSubscriptionProduct, type PaymentInterval } from "@/lib/iyzicoSubscription";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

// iyzico'da "OtoHafıza Abonelik" ürününü ve Pro/İşletme/İşletme Yıllık için
// birer "ödeme planı" oluşturan, BİR KEZ çalıştırılması gereken kurulum aracı
// (bkz. app/admin/iyzico-abonelik — bu uç noktayı çağıran buton). İDEMPOTENT:
// zaten oluşturulmuş bir ürün/plan kodu varsa (settingsStore'da kayıtlıysa)
// yeniden oluşturmaz, tekrar tekrar çağırmak güvenlidir — Zeki yanlışlıkla iki
// kez tıklarsa iyzico'da tekrarlanan/çöp kayıt oluşmaz.
const PAID_PLANS: Plan[] = ["pro", "business", "business_yillik"];

function toIyzicoPrice(priceLabel: string): string {
  // "499₺" -> "499.00", "9.990₺" -> "9990.00" (nokta binlik ayracı, ondalık değil).
  const digits = priceLabel.replace(/[^\d]/g, "");
  return `${digits}.00`;
}

function toInterval(period: string): PaymentInterval {
  return period === "/yıl" ? "YEARLY" : "MONTHLY";
}

async function currentState() {
  const productReferenceCode = await getIyzicoSubscriptionProductCode();
  const plans = await Promise.all(
    PAID_PLANS.map(async (plan) => ({
      plan,
      label: PLAN_LIMITS[plan].label,
      priceDisplay: `${PLAN_LIMITS[plan].price}${PLAN_LIMITS[plan].period}`,
      referenceCode: await getIyzicoPricingPlanCode(plan),
    }))
  );
  return { productReferenceCode, plans };
}

export async function GET() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  return NextResponse.json(await currentState());
}

export async function POST() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  let productCode = await getIyzicoSubscriptionProductCode();
  if (!productCode) {
    const result = await createSubscriptionProduct(
      "OtoHafıza Abonelik",
      "OtoHafıza QR bakım defteri — Pro/İşletme abonelik planları"
    );
    if (result.status !== "success" || !result.referenceCode) {
      return NextResponse.json(
        { error: result.errorMessage || "iyzico ürünü oluşturulamadı." },
        { status: 502 }
      );
    }
    productCode = result.referenceCode;
    await setIyzicoSubscriptionProductCode(productCode);
  }

  const errors: string[] = [];
  for (const plan of PAID_PLANS) {
    const existing = await getIyzicoPricingPlanCode(plan);
    if (existing) continue;
    const info = PLAN_LIMITS[plan];
    const result = await createPricingPlan({
      productReferenceCode: productCode,
      name: info.label,
      price: toIyzicoPrice(info.price),
      paymentInterval: toInterval(info.period),
    });
    if (result.status !== "success" || !result.referenceCode) {
      errors.push(`${info.label}: ${result.errorMessage || "bilinmeyen hata"}`);
      continue;
    }
    await setIyzicoPricingPlanCode(plan, result.referenceCode);
  }

  const state = await currentState();
  if (errors.length > 0) {
    return NextResponse.json({ ...state, errors }, { status: 207 });
  }
  return NextResponse.json(state);
}
