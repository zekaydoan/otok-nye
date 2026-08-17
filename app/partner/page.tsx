import { redirect } from "next/navigation";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import {
  getPartnerSummary,
  listCommissionsForPartner,
  listShopsForPartner,
  listVehiclesByShop,
} from "@/lib/blobStore";
import {
  PARTNER_ACTIVATION_WINDOW_DAYS,
  PARTNER_COMMISSION_TYPE_LABELS,
  PARTNER_TIER_LABELS,
  PARTNER_TIER_THRESHOLDS,
  PLAN_LIMITS,
  type PartnerCommissionType,
} from "@/lib/types";
import PartnerReferralLink from "@/components/PartnerReferralLink";

export default async function PartnerDashboardPage() {
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) redirect("/partner-girisi");

  const summary = await getPartnerSummary(partnerId);
  if (!summary) redirect("/partner-girisi");

  const [shops, commissions] = await Promise.all([
    listShopsForPartner(partnerId),
    listCommissionsForPartner(partnerId),
  ]);
  // Her işletmenin araç eklenip eklenmediğini görebilmek için — aşağıdaki
  // "Getirdiğiniz İşletmeler" tablosunda hangi müşterinin dürtüklenmesi
  // gerektiğini partnere göstermek adına (bkz. PARTNER_ACTIVATION_WINDOW_DAYS
  // yorumu, aktivasyon primi koşulu). getPartnerSummary zaten aynı sorguyu
  // aggregate bir sayı için yapıyor ama shop bazlı detayı dışarı vermiyor,
  // burada ayrıca çekiliyor.
  const vehicleCounts = await Promise.all(shops.map((s) => listVehiclesByShop(s.id)));
  const activatedShopIds = new Set(
    commissions.filter((c) => c.type === "aktivasyon").map((c) => c.shopId)
  );

  // Tür bazında döküm — "bu kadar param var" derken bunun tam olarak neyin
  // karşılığı olduğunu (kaç aktivasyon primi, kaç dönüşüm bonusu, kaç aylık
  // komisyon) partnerin kendisinin de görebilmesi için (bkz. admin tarafındaki
  // aynı bölüm, app/admin/partnerler/[id]) — ikisi aynı hesaptan geldiğinden
  // ileride "ben bu kadar getirmiştim" tartışmasına yer kalmasın diye.
  const breakdown: Record<PartnerCommissionType, { count: number; pendingTry: number; paidTry: number }> = {
    aktivasyon: { count: 0, pendingTry: 0, paidTry: 0 },
    donusum: { count: 0, pendingTry: 0, paidTry: 0 },
    recurring: { count: 0, pendingTry: 0, paidTry: 0 },
  };
  for (const c of commissions) {
    breakdown[c.type].count += 1;
    if (c.status === "odendi") breakdown[c.type].paidTry += c.amountTry;
    else breakdown[c.type].pendingTry += c.amountTry;
  }
  const earningsByShop = new Map<string, number>();
  for (const c of commissions) {
    earningsByShop.set(c.shopId, (earningsByShop.get(c.shopId) ?? 0) + c.amountTry);
  }

  const { partner } = summary;

  // Bu ay bağlanan işletme sayısı — aylık hedef ilerlemesi için (bkz.
  // Partner.monthlyTarget, admin bunu app/admin/partnerler/[id]'den belirler).
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthCount = shops.filter((s) => s.partnerAttributedAt?.startsWith(thisMonthKey)).length;
  const targetProgress =
    partner.monthlyTarget && partner.monthlyTarget > 0
      ? Math.min(100, Math.round((thisMonthCount / partner.monthlyTarget) * 100))
      : null;

  // Seviye ilerlemesi — "Gold'a 6 işletme kaldı" gibi somut bir hedef göstermek
  // için (bkz. PARTNER_TIER_THRESHOLDS, aktif işletme sayısına göre statik
  // eşikler). En yüksek seviyedeyse (platinum) "sonraki seviye" yok, ilerleme
  // çubuğu %100 dolu gösterilir.
  const tiersAsc = [...PARTNER_TIER_THRESHOLDS].sort((a, b) => a.minActiveShops - b.minActiveShops);
  const currentTierIndex = tiersAsc.findIndex((t) => t.tier === summary.tier);
  const currentTierThreshold = tiersAsc[currentTierIndex]?.minActiveShops ?? 0;
  const nextTier = tiersAsc[currentTierIndex + 1];
  const tierProgress = nextTier
    ? Math.min(
        100,
        Math.round(
          ((summary.activeShopCount - currentTierThreshold) /
            (nextTier.minActiveShops - currentTierThreshold)) *
            100
        )
      )
    : 100;
  const shopsToNextTier = nextTier ? Math.max(0, nextTier.minActiveShops - summary.activeShopCount) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Merhaba, {partner.name.split(" ")[0]}</h1>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Seviyeniz: <span className="font-bold text-brand-700">{PARTNER_TIER_LABELS[summary.tier]}</span>
          </span>
          {nextTier ? (
            <span className="text-slate-500">
              {PARTNER_TIER_LABELS[nextTier.tier]}&apos;a {shopsToNextTier} işletme kaldı
            </span>
          ) : (
            <span className="font-medium text-accent-600">En yüksek seviyedesiniz 🎉</span>
          )}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${tierProgress}%` }}
          />
        </div>
      </div>

      {partner.monthlyTarget ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Bu Ay Hedef</span>
            <span className="text-slate-500">
              {thisMonthCount}/{partner.monthlyTarget} işletme
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">
            Bu ay <span className="font-semibold text-slate-900">{thisMonthCount}</span> işletme getirdiniz.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Toplam İşletme</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalShopCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Aktif Kullanan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.activeShopCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ücretliye Geçen</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.paidShopCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bekleyen Komisyon</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">
            {summary.pendingCommissionTry.toLocaleString("tr-TR")} TL
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ödenen Toplam</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {summary.paidCommissionTry.toLocaleString("tr-TR")} TL
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-slate-900">Komisyon Dökümü</h2>
        <p className="mt-1 text-xs text-slate-500">
          Toplam kazancınızın nereden geldiği — kaç aktivasyon primi, kaç dönüşüm bonusu, kaç aylık
          komisyon kaydı olduğu.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(Object.keys(PARTNER_COMMISSION_TYPE_LABELS) as PartnerCommissionType[]).map((type) => {
            const b = breakdown[type];
            return (
              <div key={type} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {PARTNER_COMMISSION_TYPE_LABELS[type]} ({b.count} kayıt)
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {(b.pendingTry + b.paidTry).toLocaleString("tr-TR")} TL
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {b.pendingTry.toLocaleString("tr-TR")} TL bekliyor · {b.paidTry.toLocaleString("tr-TR")} TL ödendi
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Kayıt Linkiniz</p>
        <p className="mt-1 text-xs text-slate-500">
          Bu linki/QR kodu gittiğiniz servislerle paylaşın — üzerinden kaydolan her işletme size bağlanır.
        </p>
        <div className="mt-2">
          <PartnerReferralLink code={partner.referralCode} name={partner.name} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Getirdiğiniz İşletmeler</h2>
        {shops.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Henüz kaydolan bir işletme yok.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Şehir</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Bu İşletmeden Kazancınız</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s, i) => {
                  // Aktivasyon primi koşulu: araç eklenmiş VE
                  // PARTNER_ACTIVATION_WINDOW_DAYS içinde bakım kaydı girilmiş
                  // olmalı (bkz. lib/blobStore.ts checkAndAccruePartnerActivationBonus).
                  // Burada partnere "hangi müşteriyi dürtüklemesi gerektiğini"
                  // göstermek için aynı koşul üç duruma ayrıştırılıyor.
                  const activated = activatedShopIds.has(s.id);
                  const attributedAt = s.partnerAttributedAt ? new Date(s.partnerAttributedAt).getTime() : null;
                  const withinWindow =
                    attributedAt !== null
                      ? Date.now() - attributedAt <= PARTNER_ACTIVATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
                      : true;
                  const status = activated
                    ? { label: "Aktivasyon Tamamlandı", cls: "bg-emerald-50 text-emerald-700" }
                    : !withinWindow
                    ? { label: "Süre Doldu", cls: "bg-slate-100 text-slate-500" }
                    : vehicleCounts[i].length === 0
                    ? { label: "Araç Eklenmedi", cls: "bg-red-50 text-red-700" }
                    : { label: "Bakım Kaydı Bekleniyor", cls: "bg-amber-50 text-amber-700" };
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.city || "—"}</td>
                      <td className="px-4 py-3">{PLAN_LIMITS[s.plan].label}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.partnerAttributedAt
                          ? new Date(s.partnerAttributedAt).toLocaleDateString("tr-TR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {(earningsByShop.get(s.id) ?? 0).toLocaleString("tr-TR")} TL
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Kazanç Geçmişi</h2>
        {commissions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Henüz tahakkuk eden bir kazancınız yok.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{PARTNER_COMMISSION_TYPE_LABELS[c.type]}</td>
                    <td className="px-4 py-3 text-slate-500">{c.shopName}</td>
                    <td className="px-4 py-3 font-medium">{c.amountTry.toLocaleString("tr-TR")} TL</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "odendi"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {c.status === "odendi" ? "Ödendi" : "Tahakkuk Etti"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
