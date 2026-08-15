import { getCurrentSession } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import BillingInfoForm from "@/components/BillingInfoForm";

// Ücretli plan/etiket satın alımından önce zorunlu tutulan fatura bilgisi
// ekranı — bkz. app/api/shop/plan ve app/api/etiket-siparis'teki "fatura
// bilgisi eksikse buraya yönlendir" deseni (returnTo ile geldiği yere döner).
export default async function BillingInfoPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const session = await getCurrentSession();
  const shop = session ? await getShopById(session.shopId) : null;
  const isOwner = session?.role === "sahibi";

  // returnTo yalnızca site içi göreli bir yola izin verir — dışarıdan gelen bir
  // sorgu parametresiyle kullanıcı başka bir siteye yönlendirilemesin diye.
  const returnTo =
    searchParams.returnTo && searchParams.returnTo.startsWith("/")
      ? searchParams.returnTo
      : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Fatura Bilgileri</h1>
      <p className="mt-1 text-sm text-slate-500">
        Plan ve etiket satın alımlarınız için kestiğimiz e-fatura/e-arşiv
        faturalarında kullanılır. Bu bilgileri bir kez girmeniz yeterli —
        dilediğiniz zaman buradan güncelleyebilirsiniz.
      </p>

      {shop && !isOwner && (
        <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Fatura bilgileri yalnızca hesap sahibi tarafından değiştirilebilir.
        </div>
      )}

      {shop && isOwner && <BillingInfoForm initial={shop.billingInfo} returnTo={returnTo} />}
    </div>
  );
}
