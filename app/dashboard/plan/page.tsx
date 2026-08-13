import { getCurrentShopId } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import PlanSelector from "@/components/PlanSelector";

export default async function PlanPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Abonelik Planı</h1>
      <p className="mt-1 text-sm text-slate-500">
        İhtiyacınıza göre plan seçin. Kredi kartı ile otomatik tahsilat, ödeme
        sağlayıcı hesabınız (ör. iyzico/Stripe) tanımlandığında devreye alınabilir —
        şimdilik plan seçiminiz hesabınıza kaydedilir.
      </p>
      {shop && <PlanSelector currentPlan={shop.plan} />}
    </div>
  );
}
