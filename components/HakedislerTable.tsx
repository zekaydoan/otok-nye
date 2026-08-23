"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { PARTNER_TIER_LABELS } from "@/lib/types";
import type { PartnerPayoutQueueItem } from "@/lib/blobStore";
import { formatIban } from "@/lib/paymentInfo";

// Hakedişler ekranının tablosu — bkz. app/admin/hakedisler. Her satırda bir
// partner ve o partnerin bekleyen bakiyesi; "Tümünü Öde" o partnerin O ANA
// KADAR tahakkuk etmiş tüm komisyonlarını tek istekte "ödendi" işaretler
// (bkz. app/api/admin/hakedisler/[id]/ode). IBAN'ı henüz kayıtlı olmayan
// partnerlerde buton yerine uyarı gösterilir — parayı nereye göndereceğimizi
// bilmeden "ödendi" işaretlemek yanlış bir kayıt bırakır.
export default function HakedislerTable({ items }: { items: PartnerPayoutQueueItem[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): partner sayısı arttıkça
  // düz liste sürdürülemez hale geliyordu — basit isim/bölge araması eklendi
  // (bkz. components/AdminPartnerForm.tsx ile aynı istemci taraflı desen).
  const [query, setQuery] = useState("");

  async function payAll(item: PartnerPayoutQueueItem) {
    const confirmed = window.confirm(
      `${item.partner.name} için ${item.pendingCommissionTry.toLocaleString("tr-TR")} TL'yi ` +
        `(${item.pendingCount} kayıt) elden/EFT ile GERÇEKTEN ödediniz mi? Onaylarsanız bu tutar ödendi olarak işaretlenir.`
    );
    if (!confirmed) return;

    setLoadingId(item.partner.id);
    try {
      const res = await fetch(`/api/admin/hakedisler/${item.partner.id}/ode`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Güncellenemedi.", "error");
        return;
      }
      showToast("Hakediş ödendi olarak işaretlendi.");
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const withBalance = items.filter((i) => i.pendingCommissionTry > 0);

  const filteredWithBalance = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withBalance;
    return withBalance.filter(
      (item) =>
        item.partner.name.toLowerCase().includes(q) ||
        (item.partner.region || "").toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  if (withBalance.length === 0) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Şu an bekleyen hakediş yok — tüm partnerler güncel.
      </p>
    );
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="İsim veya bölge ara..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <p className="mt-2 text-xs text-slate-400">
        {filteredWithBalance.length} / {withBalance.length} partner gösteriliyor
      </p>
      {filteredWithBalance.length === 0 && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">
          Sonuç bulunamadı.
        </p>
      )}
      {filteredWithBalance.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Seviye</th>
                <th className="px-4 py-3">Bekleyen Tutar</th>
                <th className="px-4 py-3">Bekliyor</th>
                <th className="px-4 py-3">IBAN</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithBalance.map((item) => (
            <tr key={item.partner.id} className={item.isDue ? "bg-red-50/40 hover:bg-red-50" : "hover:bg-slate-50"}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/partnerler/${item.partner.id}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {item.partner.name}
                </Link>
                <p className="text-xs text-slate-400">{item.partner.phone}</p>
              </td>
              <td className="px-4 py-3">{PARTNER_TIER_LABELS[item.tier]}</td>
              <td className="px-4 py-3 font-medium">
                {item.pendingCommissionTry.toLocaleString("tr-TR")} TL
                <p className="text-xs font-normal text-slate-400">{item.pendingCount} kayıt</p>
              </td>
              <td className="px-4 py-3">
                {item.daysSinceOldestPending !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.isDue ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.isDue
                      ? `${item.daysSinceOldestPending} gündür — ödeme zamanı geldi`
                      : `${item.daysSinceOldestPending} gündür bekliyor`}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {item.hasPaymentInfo && item.partner.paymentInfo ? (
                  <span className="font-mono text-xs text-slate-600">
                    {formatIban(item.partner.paymentInfo.iban)}
                  </span>
                ) : (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    IBAN eksik
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {item.hasPaymentInfo ? (
                  <button
                    onClick={() => payAll(item)}
                    disabled={loadingId === item.partner.id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {loadingId === item.partner.id ? "..." : "Tümünü Öde"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Önce IBAN girmeli</span>
                )}
              </td>
            </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
