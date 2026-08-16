import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getShopById, recordPlanStart, updateShopFields } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PAID_PLANS_DISABLED_MESSAGE, PAID_PLANS_ENABLED } from "@/lib/planAvailability";
import { notifyAdmins, escapeHtml } from "@/lib/email";
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

  // Şirket kuruluşu tamamlanana kadar yalnızca Free plan kabul ediliyor (bkz.
  // lib/planAvailability.ts) — ücretli plan talepleri, fatura bilgisi eksik olsa
  // da olmasa da burada tamamen reddedilir. free'ye dönüş bu kısıtlamadan
  // etkilenmez, her zaman serbesttir.
  if (plan !== "free" && !PAID_PLANS_ENABLED) {
    return NextResponse.json(
      { error: PAID_PLANS_DISABLED_MESSAGE, code: "paid_plans_disabled" },
      { status: 403 }
    );
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

  // free'ye dönüş risksiz — anında uygulanır, olası bekleyen bir yükseltme
  // talebi de bu vazgeçmeyle birlikte iptal edilir. Ücretli bir plana geçiş
  // ise kart ile otomatik tahsilat entegrasyonu kurulana kadar (bkz. README
  // "Ödeme / Abonelik Notu") gerçek ödeme doğrulaması yapılamadığından,
  // shop.plan'i DEĞİŞTİRMEYİZ — yalnızca "beklemede" olarak işaretleyip admin'e
  // haber veririz; admin banka havalesi/elden ödemeyi doğruladıktan sonra
  // app/api/admin/shops/[id]/plan üzerinden planı elle aktive eder.
  if (plan === "free") {
    try {
      await updateShopFields(shopId, (shop) => ({
        ...shop,
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

  let shopName = "";
  try {
    const updated = await updateShopFields(shopId, (shop) => ({
      ...shop,
      pendingPlan: plan,
      pendingPlanRequestedAt: new Date().toISOString(),
    }));
    shopName = updated.name;
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  await notifyAdmins(
    `Plan yükseltme talebi — ${shopName}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p><strong>${escapeHtml(shopName)}</strong>, <strong>${escapeHtml(PLAN_LIMITS[plan].label)}</strong>
      planına geçmek istiyor. Ödeme (banka havalesi/elden) alındıktan sonra admin panelinden
      planı elle aktive edin.</p>
      <p><a href="https://otohafiza.com/admin/bayiler">Admin panelinden görüntüle</a></p>
    </div>`
  );

  return NextResponse.json({ ok: true, pending: true });
}
