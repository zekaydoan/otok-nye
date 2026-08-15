import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  getCityVisits,
  getDailyPageviews,
  getPlanRevenueStats,
  getPlanStartStats,
  getShopCountsByPlan,
  getStickerOrderStats,
  listAllShops,
} from "@/lib/blobStore";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { ChartBarIcon, PackageIcon, UsersIcon } from "@/components/icons";
import TurkeyVisitorMap from "@/components/TurkeyVisitorMap";

// Yalnızca ADMIN_EMAILS ortam değişkeninde tanımlı hesaplara açık — bkz.
// app/admin/siparisler/page.tsx ile aynı desen ve gerekçe.
//
// Bu sayfa dört ayrı veri kaynağını birleştirir: (1) lib/blobStore.ts'teki
// günlük ziyaret sayacı (kişisel veri içermez, bkz. incrementDailyPageview),
// (2) bayilerin plan dağılımı, (3) etiket mağazası ciro/sipariş istatistikleri
// ve (4) Google/Meta reklam pikseli bağlantı durumu (bkz. components/AdPixels.tsx).
// Hiçbir sayı kalıcı olarak "cache"lenmez — her sayfa yüklemesinde taze hesaplanır;
// trafik/veri hacmi büyüdükçe (bkz. kapasite-analizi.md) bu tam taramalar
// yavaşlayabilir, o noktada periyodik önceden-hesaplanmış özetlere geçilebilir.
export default async function AdminStatsPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [pageviews, planCounts, planStartStats, planRevenue, orderStats, shops, cityVisits] =
    await Promise.all([
      getDailyPageviews(14),
      getShopCountsByPlan(),
      getPlanStartStats(),
      getPlanRevenueStats(),
      getStickerOrderStats(),
      listAllShops(),
      getCityVisits(today),
    ]);

  const todayViews = pageviews[pageviews.length - 1]?.count ?? 0;
  const last14DaysViews = pageviews.reduce((sum, d) => sum + d.count, 0);
  const maxViews = Math.max(1, ...pageviews.map((d) => d.count));

  const paidShopCount = shops.filter((s) => s.plan !== "free").length;
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const newShopsLast30Days = shops.filter((s) => new Date(s.createdAt) >= last30Days).length;

  const gaConfigured = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaConfigured = !!process.env.NEXT_PUBLIC_META_PIXEL_ID;

  const fmtTry = (n: number) =>
    n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + "₺";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">İstatistikler (Admin)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Site trafiği, abonelik dağılımı ve etiket mağazası ciro özeti — yalnızca
        yöneticiler görebilir.
      </p>

      {/* Özet kartları */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Bugünkü Ziyaret" value={todayViews.toString()} />
        <StatCard label="Toplam Bayi" value={shops.length.toString()} sub={`${newShopsLast30Days} yeni (30 gün)`} />
        <StatCard label="Ücretli Abone" value={paidShopCount.toString()} />
        <StatCard label="Plan Cirosu" value={fmtTry(planRevenue.estimatedMonthlyTry)} sub="Tahmini, aylık" />
        <StatCard label="Etiket Cirosu" value={fmtTry(orderStats.totalRevenueTry)} sub={`${orderStats.paidOrders} ödenmiş sipariş`} />
      </div>

      {/* Ziyaret grafiği */}
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-slate-900">Son 14 Gün Sayfa Görüntüleme</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Kişi/IP bazlı değil, günlük toplam sayfa görüntüleme sayacıdır (14 günlük toplam: {last14DaysViews}).
        </p>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 100 }}>
          {pageviews.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${Math.max(4, (d.count / maxViews) * 80)}px` }}
              />
              <span className="text-[9px] text-slate-400">{d.date.slice(8, 10)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bugünkü ziyaretçilerin şehir dağılımı */}
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-slate-900">Bugün Hangi Şehirlerden Ziyaret Edildi</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Netlify'ın IP tabanlı (yaklaşık) coğrafi konum verisinden hesaplanır — kişi/IP
          hiçbir yerde saklanmaz, yalnızca ilin bugünkü toplam sayacı tutulur.
        </p>
        <div className="mt-4">
          <TurkeyVisitorMap data={cityVisits} />
        </div>
      </section>

      {/* Plan dağılımı */}
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-slate-900">Plan Dağılımı</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Bugün/Bu Ay/Bu Yıl sütunları, o dönemde hangi plana kaç bayinin başladığını
          gösterir (kayıt veya plan değişikliği anı). Toplam sütunu, bayilerin şu an
          bulunduğu plana göre güncel anlık görüntüdür.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium text-right">Bugün</th>
                <th className="pb-2 font-medium text-right">Bu Ay</th>
                <th className="pb-2 font-medium text-right">Bu Yıl</th>
                <th className="pb-2 font-medium text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(PLAN_LIMITS) as Plan[]).map((plan) => (
                <tr key={plan} className="border-t border-slate-100">
                  <td className="py-2 text-slate-600">{PLAN_LIMITS[plan].label}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">
                    {planStartStats.today[plan] ?? 0}
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-900">
                    {planStartStats.thisMonth[plan] ?? 0}
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-900">
                    {planStartStats.thisYear[plan] ?? 0}
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-900">
                    {planCounts[plan] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Şehre göre etiket satışı */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Şehre Göre Etiket Satışı</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Etiket kargo adresindeki şehre göre, gerçekleşmiş ciro.
          </p>
          <div className="mt-4 space-y-2">
            {orderStats.byCity.length === 0 && (
              <p className="text-sm text-slate-400">Henüz ödenmiş sipariş yok.</p>
            )}
            {orderStats.byCity.slice(0, 8).map((c) => (
              <div key={c.city} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{c.city}</span>
                <span className="font-semibold text-slate-900">
                  {c.orderCount} sipariş · {fmtTry(c.revenueTry)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Şehre göre plan satışı */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Şehre Göre Plan Satışı</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Bayinin Ayarlar'da seçtiği şehre göre, tahmini aylık ciro (henüz şehrini
            girmemiş bayiler "Belirtilmemiş" altında toplanır). Bu şehirlere reklam
            ağırlığı vermek işe yarayabilir.
          </p>
          <div className="mt-4 space-y-2">
            {planRevenue.byCity.length === 0 && (
              <p className="text-sm text-slate-400">Henüz ücretli abone yok.</p>
            )}
            {planRevenue.byCity.slice(0, 8).map((c) => (
              <div key={c.city} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{c.city}</span>
                <span className="font-semibold text-slate-900">
                  {c.shopCount} bayi · {fmtTry(c.estimatedMonthlyTry)}/ay
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Reklam ölçümü durumu */}
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold text-slate-900">Reklam Ölçümü Bağlantı Durumu</h2>
        <p className="mt-1 text-sm text-slate-500">
          Google Analytics/Ads ve Meta (Facebook/Instagram) Pixel entegrasyonu koda hazır
          şekilde eklendi; yalnızca aşağıdaki ortam değişkenleri tanımlanınca devreye girer.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <PixelStatus label="Google Analytics 4 / Google Ads" envVar="NEXT_PUBLIC_GA_MEASUREMENT_ID" configured={gaConfigured} />
          <PixelStatus label="Meta (Facebook/Instagram) Pixel" envVar="NEXT_PUBLIC_META_PIXEL_ID" configured={metaConfigured} />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Kayıt tamamlandığında "sign_up" / "CompleteRegistration", etiket siparişi
          ödendiğinde "purchase" / "Purchase" dönüşüm olayı otomatik gönderilir (bkz.
          components/AdPixels.tsx) — kurulum adımları için README'ye bakın.
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

function PixelStatus({ label, envVar, configured }: { label: string; envVar: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400">{envVar}</p>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          configured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {configured ? "Bağlı" : "Tanımlı değil"}
      </span>
    </div>
  );
}
