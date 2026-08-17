import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerSummary, listCommissionsForPartner, listShopsForPartner } from "@/lib/blobStore";
import {
  PARTNER_CATEGORY_LABELS,
  PARTNER_COMMISSION_TYPE_LABELS,
  PARTNER_TIER_LABELS,
  PLAN_LIMITS,
  type PartnerCommissionType,
} from "@/lib/types";
import PartnerReferralLink from "@/components/PartnerReferralLink";
import PartnerStatusToggle from "@/components/PartnerStatusToggle";
import PartnerCommissionsTable from "@/components/PartnerCommissionsTable";
import PartnerAdminTools from "@/components/PartnerAdminTools";

export default async function AdminPartnerDetailPage({ params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const summary = await getPartnerSummary(params.id);
  if (!summary) notFound();

  const [shops, commissions] = await Promise.all([
    listShopsForPartner(params.id),
    listCommissionsForPartner(params.id),
  ]);

  const { partner } = summary;

  // Tür bazında döküm — "Zeki 2000 TL alacak" dediğimizde bunun tam olarak
  // neyin karşılığı olduğu (kaç aktivasyon primi, kaç dönüşüm bonusu, kaç ay
  // recurring komisyon) ileride tartışmasız görülebilsin diye (bkz. kullanıcının
  // isteği: "partner ben bu kadar kişi bulmuştum bu kadar alacağım vardı
  // karmaşasına girmeyelim"). Üstteki "Bekleyen Komisyon"/"Ödenen Toplam"
  // kartları zaten toplamı gösteriyor, bu bölüm o toplamın nereden geldiğini
  // açıklıyor.
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

  // Her işletmenin bu partnere şimdiye kadar toplam ne kazandırdığı — "Getirdiği
  // İşletmeler" tablosundaki her satırın kendi kazancını görebilmek için (aynı
  // amaç: hangi bayiden ne kadar geldiği izlenebilir olsun).
  const earningsByShop = new Map<string, number>();
  for (const c of commissions) {
    earningsByShop.set(c.shopId, (earningsByShop.get(c.shopId) ?? 0) + c.amountTry);
  }

  return (
    <div>
      <Link href="/admin/partnerler" className="text-sm font-medium text-brand-600 hover:underline">
        ← Partnerler
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {partner.phone}
            {partner.email ? ` · ${partner.email}` : ""}
            {partner.category ? ` · ${PARTNER_CATEGORY_LABELS[partner.category]}` : ""}
            {partner.region ? ` · ${partner.region}` : ""}
          </p>
        </div>
        <PartnerStatusToggle partnerId={partner.id} status={partner.status} />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Referans Linki</p>
        <div className="mt-1.5">
          <PartnerReferralLink code={partner.referralCode} name={partner.name} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Seviye</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{PARTNER_TIER_LABELS[summary.tier]}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Aktif / Toplam İşletme
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.activeShopCount}/{summary.totalShopCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Bekleyen Komisyon
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.pendingCommissionTry.toLocaleString("tr-TR")} TL
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ödenen Toplam</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.paidCommissionTry.toLocaleString("tr-TR")} TL
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-slate-900">Komisyon Dökümü</h2>
        <p className="mt-1 text-xs text-slate-500">
          Yukarıdaki toplamın nereden geldiği — kaç aktivasyon primi, kaç dönüşüm bonusu, kaç aylık
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

      <div className="mt-4">
        <PartnerAdminTools partnerId={partner.id} initialTarget={partner.monthlyTarget} />
      </div>

      {partner.notes && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Not</p>
          <p className="mt-1 text-sm text-slate-700">{partner.notes}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Getirdiği İşletmeler</h2>
        {shops.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Henüz bu partnerin koduyla gelen bir kayıt yok.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Şehir</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Bağlantı Tarihi</th>
                  <th className="px-4 py-3">Bu İşletmeden Kazanç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bayiler/${s.id}`} className="font-medium text-brand-600 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.city || "—"}</td>
                    <td className="px-4 py-3">{PLAN_LIMITS[s.plan].label}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.partnerAttributedAt
                        ? new Date(s.partnerAttributedAt).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {(earningsByShop.get(s.id) ?? 0).toLocaleString("tr-TR")} TL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Komisyon Geçmişi</h2>
        <div className="mt-2">
          <PartnerCommissionsTable partnerId={partner.id} initialCommissions={commissions} />
        </div>
      </div>
    </div>
  );
}
