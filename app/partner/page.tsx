import { redirect } from "next/navigation";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import { getPartnerSummary, listCommissionsForPartner, listShopsForPartner } from "@/lib/blobStore";
import { PARTNER_COMMISSION_TYPE_LABELS, PARTNER_TIER_LABELS, PLAN_LIMITS } from "@/lib/types";
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Merhaba, {partner.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Seviyeniz: <span className="font-semibold">{PARTNER_TIER_LABELS[summary.tier]}</span>
      </p>

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

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Kayıt Linkiniz</p>
        <p className="mt-1 text-xs text-slate-500">
          Bu linki gittiğiniz servislerle paylaşın — üzerinden kaydolan her işletme size bağlanır.
        </p>
        <div className="mt-2">
          <PartnerReferralLink code={partner.referralCode} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Getirdiğiniz İşletmeler</h2>
        {shops.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Henüz kaydolan bir işletme yok.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Şehir</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500">{s.city || "—"}</td>
                    <td className="px-4 py-3">{PLAN_LIMITS[s.plan].label}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.partnerAttributedAt
                        ? new Date(s.partnerAttributedAt).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                  </tr>
                ))}
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
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{PARTNER_COMMISSION_TYPE_LABELS[c.type]}</td>
                    <td className="px-4 py-3 text-slate-500">{c.shopName}</td>
                    <td className="px-4 py-3 font-medium">{c.amountTry.toLocaleString("tr-TR")} TL</td>
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
