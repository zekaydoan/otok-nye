import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PAID_PLANS_ENABLED } from "@/lib/planAvailability";
import PlanSelector from "@/components/PlanSelector";

export default async function PlanPage() {
  const session = await getCurrentSession();
  const shop = session ? await getShopById(session.shopId) : null;
  const isOwner = session?.role === "sahibi";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Abonelik Planı</h1>
      <p className="mt-1 text-sm text-slate-500">
        {PAID_PLANS_ENABLED
          ? "İhtiyacınıza göre plan seçin. Ücretli bir planı seçtiğinizde iyzico'nun güvenli ödeme ekranında kart bilgilerinizi girersiniz; ödeme onaylanır onaylanmaz planınız aktif olur ve her ay/yıl otomatik olarak yenilenir."
          : "Şirket kuruluş işlemlerimiz tamamlanana kadar yalnızca Ücretsiz plan kullanılabiliyor. Ücretli planlar (Pro, İşletme) kısa süre içinde açılacak."}
      </p>

      {shop && isOwner && shop.plan === "free" && PAID_PLANS_ENABLED && !isBillingInfoComplete(shop.billingInfo) && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ücretli bir plana geçmeden önce{" "}
          <Link
            href={`/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent("/dashboard/plan")}`}
            className="font-semibold underline"
          >
            fatura bilgilerinizi
          </Link>{" "}
          kaydetmeniz gerekecek — kestiğimiz her fatura için zorunlu.
        </div>
      )}

      {shop && isOwner && (
        <PlanSelector currentPlan={shop.plan} pendingPlan={shop.pendingPlan} />
      )}
      {shop && !isOwner && (
        <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Plan değişikliği yalnızca hesap sahibi tarafından yapılabilir.
        </div>
      )}
    </div>
  );
}
