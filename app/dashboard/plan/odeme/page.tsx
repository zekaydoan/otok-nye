import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PAID_PLANS_ENABLED } from "@/lib/planAvailability";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import Logo from "@/components/Logo";
import SubscriptionCheckoutStarter from "@/components/SubscriptionCheckoutStarter";

// components/PlanSelector'daki "Bu Planı Seç" (ücretli planlar için) buraya
// yönlendirir — asıl ödeme başlatma app/api/shop/plan'e taşındı, bu sayfa
// yalnızca T.C. Kimlik No toplayıp SubscriptionCheckoutStarter'ı gösteren
// ince bir kabuk (bkz. app/dashboard/etiket-siparis'in aynı rolü oynadığı
// mevcut desen).
export default async function PlanCheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const session = await getCurrentSession();
  if (!session || session.role !== "sahibi") redirect("/dashboard/plan");

  const planParam = searchParams.plan;
  if (!planParam || !(planParam in PLAN_LIMITS) || planParam === "free" || !PAID_PLANS_ENABLED) {
    redirect("/dashboard/plan");
  }
  const plan = planParam as Plan;

  const shop = await getShopById(session.shopId);
  if (!shop) redirect("/dashboard/plan");
  if (shop.plan === plan) redirect("/dashboard/plan");
  if (!isBillingInfoComplete(shop.billingInfo)) {
    redirect(
      `/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent(`/dashboard/plan/odeme?plan=${plan}`)}`
    );
  }

  const info = PLAN_LIMITS[plan];

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex justify-center">
        <Logo withText />
      </div>
      <h1 className="mt-4 text-center text-xl font-bold text-slate-900">
        {info.label} planına geçiş
      </h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        {info.price}
        {info.period} — kart bilgileriniz iyzico'nun güvenli ödeme sayfasında alınır, bize hiç
        ulaşmaz.
      </p>
      <div className="mt-6">
        <SubscriptionCheckoutStarter plan={plan} />
      </div>
    </div>
  );
}
