import { getCurrentSession } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import PlanSelector from "@/components/PlanSelector";

export default async function PlanPage() {
  const session = await getCurrentSession();
  const shop = session ? await getShopById(session.shopId) : null;
  const isOwner = session?.role === "sahibi";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Abonelik Planı</h1>
      <p className="mt-1 text-sm text-slate-500">
        İhtiyacınıza göre plan seçin. Kredi kartı ile otomatik tahsilat, ödeme
        sağlayıcı hesabınız (ör. iyzico/Stripe) tanımlandığında devreye alınabilir —
        şimdilik plan seçiminiz hesabınıza kaydedilir.
      </p>
      {shop && isOwner && <PlanSelector currentPlan={shop.plan} />}
      {shop && !isOwner && (
        <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Plan değişikliği yalnızca hesap sahibi tarafından yapılabilir.
        </div>
      )}
    </div>
  );
}
