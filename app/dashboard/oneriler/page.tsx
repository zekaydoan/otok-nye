import { getCurrentShopId } from "@/lib/auth";
import { listSuggestionsForShop } from "@/lib/blobStore";
import SuggestionsSection from "@/components/SuggestionsSection";

export default async function SuggestionsPage() {
  const shopId = await getCurrentShopId();
  const suggestions = shopId ? await listSuggestionsForShop(shopId) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Öneri Kutusu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Oto Künye&apos;yi sizinle birlikte geliştiriyoruz. Uygulamada görmek istediğiniz bir
        özellik, karşılaştığınız bir eksiklik ya da aklınıza takılan herhangi bir fikir varsa,
        aşağıya yazmanız yeterli — her öneriyi tek tek okuyoruz.
      </p>
      <SuggestionsSection initialSuggestions={suggestions} />
    </div>
  );
}
