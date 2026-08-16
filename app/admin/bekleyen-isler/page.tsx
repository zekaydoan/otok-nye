import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  listAllShops,
  listAllStickerOrders,
  listAllSuggestions,
  listAllDataRequests,
} from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { BellIcon, LightbulbIcon, LockIcon, PackageIcon, UsersIcon } from "@/components/icons";

// Admin, önceden her kategoriyi (Bayiler, Öneriler, Veri Talepleri) tek tek
// gezerek "bekleyen bir şey var mı" diye kontrol etmek zorundaydı — özellikle
// bekleyen plan talepleri (bkz. app/api/shop/plan/route.ts H1 düzeltmesi) yalnızca
// ilgili bayinin kendi detay sayfasında görünüyordu. Bu sayfa dört kategoriyi
// (bekleyen plan talepleri, iade bekleyen iptaller, okunmamış öneriler, bekleyen
// KVKK veri talepleri) tek bir yerde toplar; nav'daki rozet sayısı (bkz.
// app/admin/layout.tsx) buradaki toplamla aynı fonksiyonları kullanır.
export async function getPendingCounts() {
  const [shops, orders, suggestions, dataRequests] = await Promise.all([
    listAllShops(),
    listAllStickerOrders(),
    listAllSuggestions(),
    listAllDataRequests(),
  ]);

  const pendingPlanShops = shops.filter((s) => s.pendingPlan);
  // "İade bekleyen iptal" — bayi tarafından iptal edilmiş VE iptal anında ödemesi
  // zaten alınmış (cancelledWithPayment) VE henüz admin tarafından iade
  // işaretlenmemiş (refundedAt yok) siparişler. Yalnızca status==="iptal" bakmak
  // yetmez: bir sipariş ödeme alınmadan (odeme_bekleniyor) de iptal edilmiş
  // olabilir, o durumda iade gerekmez — bkz. lib/types.ts cancelledWithPayment.
  const refundPendingOrders = orders.filter(
    (o) => o.status === "iptal" && o.cancelledWithPayment && !o.refundedAt
  );
  const unreadSuggestions = suggestions.filter((s) => s.status === "yeni");
  const pendingDataRequests = dataRequests.filter((r) => r.status === "yeni");

  return {
    pendingPlanShops,
    refundPendingOrders,
    unreadSuggestions,
    pendingDataRequests,
    total:
      pendingPlanShops.length +
      refundPendingOrders.length +
      unreadSuggestions.length +
      pendingDataRequests.length,
  };
}

export default async function AdminPendingPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const { pendingPlanShops, refundPendingOrders, unreadSuggestions, pendingDataRequests, total } =
    await getPendingCounts();

  const fmtTry = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + "₺";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bekleyen İşler</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sizden bir aksiyon bekleyen her şey tek yerde — {total > 0 ? `toplam ${total} kalem.` : "şu an hiçbir şey beklemiyor."}
      </p>

      {total === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<BellIcon className="h-6 w-6" />}
            title="Her şey güncel"
            description="Bekleyen plan talebi, iade veya okunmamış öneri/veri talebi yok."
          />
        </div>
      )}

      {pendingPlanShops.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Bekleyen Plan Talepleri ({pendingPlanShops.length})</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Ödeme (banka havalesi/elden) alındıysa bayinin detay sayfasından planı elle aktive edin.
          </p>
          <div className="mt-4 space-y-2">
            {pendingPlanShops.map((s) => (
              <Link
                key={s.id}
                href={`/admin/bayiler/${s.id}`}
                className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm hover:bg-amber-100"
              >
                <span className="font-medium text-slate-800">{s.name}</span>
                <span className="text-amber-700">
                  {s.pendingPlan && PLAN_LIMITS[s.pendingPlan].label} talep etti
                  {s.pendingPlanRequestedAt ? ` — ${new Date(s.pendingPlanRequestedAt).toLocaleDateString("tr-TR")}` : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {refundPendingOrders.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">İade Bekleyen İptaller ({refundPendingOrders.length})</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Bayi tarafından iptal edilmiş, ödemesi alınmış siparişler — parayı bankadan/iyzico panelinden
            elle iade ettikten sonra Etiket Siparişleri sayfasından "iade edildi" işaretleyin.
          </p>
          <div className="mt-4 space-y-2">
            {refundPendingOrders.map((o) => (
              <Link
                key={o.id}
                href="/admin/siparisler"
                className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm hover:bg-red-100"
              >
                <span className="font-medium text-slate-800">
                  {o.shopName} — {o.quantity} adet
                </span>
                <span className="text-red-700">{fmtTry(o.totalPriceTry)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {unreadSuggestions.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Okunmamış Öneriler ({unreadSuggestions.length})</h2>
          </div>
          <div className="mt-4">
            <Link href="/admin/oneriler" className="text-sm font-semibold text-brand-600 underline">
              Öneri kutusuna git →
            </Link>
          </div>
        </section>
      )}

      {pendingDataRequests.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Bekleyen KVKK Veri Talepleri ({pendingDataRequests.length})</h2>
          </div>
          <div className="mt-4">
            <Link href="/admin/veri-talepleri" className="text-sm font-semibold text-brand-600 underline">
              Veri taleplerine git →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
