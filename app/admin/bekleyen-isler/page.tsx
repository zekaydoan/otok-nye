import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  listAllShops,
  listAllStickerOrders,
  listAllSuggestions,
  listAllDataRequests,
  listAllPartnerSummaries,
  listRecentStickerSelfPrints,
  listVehiclesByShop,
} from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import {
  BellIcon,
  CarIcon,
  DocumentIcon,
  HandshakeIcon,
  LightbulbIcon,
  LockIcon,
  PackageIcon,
  UsersIcon,
} from "@/components/icons";
import IconBadge from "@/components/IconBadge";

// Admin, önceden her kategoriyi (Bayiler, Öneriler, Veri Talepleri) tek tek
// gezerek "bekleyen bir şey var mı" diye kontrol etmek zorundaydı — özellikle
// bekleyen plan talepleri (bkz. app/api/shop/plan/route.ts H1 düzeltmesi) yalnızca
// ilgili bayinin kendi detay sayfasında görünüyordu. Bu sayfa beş kategoriyi
// (bekleyen plan talepleri, iade bekleyen iptaller, okunmamış öneriler, bekleyen
// KVKK veri talepleri, onay bekleyen partner başvuruları) tek bir yerde toplar;
// nav'daki rozet sayısı (bkz. app/admin/layout.tsx) buradaki toplamla aynı
// fonksiyonları kullanır. "Onay bekleyen partner başvuruları" sonradan eklendi
// (bkz. app/admin/partnerler'daki bölgeye göre gruplanmış onay akışı) — o
// akış kurulduğunda buraya eklenmesi unutulmuştu, admin yeni bir başvuru
// geldiğinde bunu ancak Partnerler sayfasını elle ziyaret ederse görüyordu.
export async function getPendingCounts() {
  const [shops, orders, suggestions, dataRequests, partnerSummaries] = await Promise.all([
    listAllShops(),
    listAllStickerOrders(),
    listAllSuggestions(),
    listAllDataRequests(),
    listAllPartnerSummaries(),
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
  const pendingPartners = partnerSummaries.filter((s) => s.partner.status === "onay_bekliyor");

  return {
    pendingPlanShops,
    refundPendingOrders,
    unreadSuggestions,
    pendingDataRequests,
    pendingPartners,
    total:
      pendingPlanShops.length +
      refundPendingOrders.length +
      unreadSuggestions.length +
      pendingDataRequests.length +
      pendingPartners.length,
  };
}

// Ücretsiz plandaki VE hiç araç eklememiş bayilerin isim listesi — yalnızca bir
// sayı (bkz. lib/blobStore.ts getChurnStats noVehicleShopCount) değil, kimin
// olduğunu görebilmek istendiği için ayrı bir liste (bkz. app/admin/bekleyen-isler
// sayfa açıklaması). Diğer dört kategorinin aksine bu bir "aksiyon" değil, sürekli
// izlenmesi istenen bir görünürlük listesi — bu yüzden getPendingCounts'un
// (nav rozetindeki) toplamına dahil edilmez, sayfada ayrı ve her zaman görünür.
async function getNoVehicleFreeShops() {
  const shops = await listAllShops();
  const freeShops = shops.filter((s) => s.plan === "free");
  const vehicleCounts = await Promise.all(freeShops.map((s) => listVehiclesByShop(s.id)));
  return freeShops.filter((_, i) => vehicleCounts[i].length === 0);
}

export default async function AdminPendingPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const [
    { pendingPlanShops, refundPendingOrders, unreadSuggestions, pendingDataRequests, pendingPartners, total },
    noVehicleFreeShops,
    recentSelfPrints,
  ] = await Promise.all([getPendingCounts(), getNoVehicleFreeShops(), listRecentStickerSelfPrints(20)]);

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
            description="Bekleyen plan talebi, iade, okunmamış öneri/veri talebi ya da onay bekleyen partner başvurusu yok."
          />
        </div>
      )}

      {pendingPartners.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <IconBadge icon={<HandshakeIcon />} color="teal" />
            <h2 className="font-bold text-slate-900">Onay Bekleyen Partner Başvuruları ({pendingPartners.length})</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Saha partnerleri kendi başvurup hesap açtı, siz onaylayana kadar giriş yapamıyorlar — aynı
            bölgeden birden fazla başvuru varsa karşılaştırıp karar verin.
          </p>
          <div className="mt-4">
            <Link href="/admin/partnerler" className="text-sm font-semibold text-brand-600 underline">
              Başvuruları incele →
            </Link>
          </div>
        </section>
      )}

      {pendingPlanShops.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <IconBadge icon={<UsersIcon />} color="indigo" />
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
            <IconBadge icon={<PackageIcon />} color="red" />
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
            <IconBadge icon={<LightbulbIcon />} color="yellow" />
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
            <IconBadge icon={<LockIcon />} color="slate" />
            <h2 className="font-bold text-slate-900">Bekleyen KVKK Veri Talepleri ({pendingDataRequests.length})</h2>
          </div>
          <div className="mt-4">
            <Link href="/admin/veri-talepleri" className="text-sm font-semibold text-brand-600 underline">
              Veri taleplerine git →
            </Link>
          </div>
        </section>
      )}

      {/* Aksiyon gerektirmeyen, sürekli izleme amaçlı iki bölüm — bu yüzden
          diğerlerinin aksine count>0 şartına bağlı değil, her zaman görünür. */}
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <IconBadge icon={<CarIcon />} color="slate" />
          <h2 className="font-bold text-slate-900">Ücretsiz Plan — Hiç Araç Eklememiş ({noVehicleFreeShops.length})</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Kayıt olmuş ama henüz onboarding'i tamamlamamış bayiler — bir hatırlatma
          araması/mesajı işe yarayabilir.
        </p>
        <div className="mt-4 space-y-2">
          {noVehicleFreeShops.length === 0 && (
            <p className="text-sm text-slate-400">Şu an bu durumda bayi yok.</p>
          )}
          {noVehicleFreeShops.map((s) => (
            <Link
              key={s.id}
              href={`/admin/bayiler/${s.id}`}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
            >
              <span className="font-medium text-slate-800">{s.name}</span>
              <span className="text-slate-500">
                {s.phone} · Kayıt: {s.createdAt.slice(0, 10)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <IconBadge icon={<DocumentIcon />} color="purple" />
          <h2 className="font-bold text-slate-900">Kendi Yazıcısından Basılan Etiketler ({recentSelfPrints.length})</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Bir bayi, dayanıklı etiket sipariş etmek yerine kendi yazıcısından QR etiket
          bastığında burada görünür — bilgi amaçlıdır, son 20 kayıt.
        </p>
        <div className="mt-4 space-y-2">
          {recentSelfPrints.length === 0 && (
            <p className="text-sm text-slate-400">Henüz kimse kendi yazıcısından etiket basmadı.</p>
          )}
          {recentSelfPrints.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2 text-sm">
              <span className="font-medium text-slate-800">
                {p.shopName} — {p.plateDisplay}
              </span>
              <span className="text-purple-700">{new Date(p.createdAt).toLocaleString("tr-TR")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
