import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getShopById, recordPlanStart, updateShopFields } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  // Plan/fatura değişikliği yalnızca hesap sahibine açık — çalışan hesapları
  // bu uç noktayı çağırırsa 403 alır (bkz. lib/auth.ts SessionInfo.role).
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }
  const shopId = session.shopId;

  const { plan } = (await req.json()) as { plan?: Plan };
  if (!plan || !(plan in PLAN_LIMITS)) {
    return NextResponse.json({ error: "Geçersiz plan." }, { status: 400 });
  }

  // Ücretsiz olmayan her plan için fatura kesileceğinden (bkz. lib/billing.ts),
  // fatura bilgileri eksikse ödeme/plan değişikliğine izin verilmez — istemci
  // bu koddan yakalayıp /dashboard/fatura-bilgileri'ne yönlendirir (bkz.
  // components/PlanSelector.tsx).
  if (plan !== "free") {
    const shop = await getShopById(shopId);
    if (!shop || !isBillingInfoComplete(shop.billingInfo)) {
      return NextResponse.json(
        { error: "Devam etmeden önce fatura bilgilerinizi kaydetmeniz gerekiyor.", requiresBilling: true },
        { status: 409 }
      );
    }
  }

  try {
    await updateShopFields(shopId, (shop) => {
      shop.plan = plan;
      return shop;
    });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  await recordPlanStart(shopId, plan);

  return NextResponse.json({ ok: true });
}
