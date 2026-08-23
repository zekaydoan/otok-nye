"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { PARTNER_COMMISSION_TYPE_LABELS } from "@/lib/types";
import type { PartnerCommissionEntry } from "@/lib/types";

// Bir partnerin komisyon geçmişi + "ödendi" işaretleme — bkz.
// app/admin/partnerler/[id], app/api/admin/partnerler/[id]/komisyon.
// Tahsilat/ödeme hâlâ elle yürütülen bir süreç (banka transferi vb.); bu
// buton yalnızca "gerçekten ödedim" kaydını sisteme düşürür.
export default function PartnerCommissionsTable({
  partnerId,
  initialCommissions,
}: {
  partnerId: string;
  initialCommissions: PartnerCommissionEntry[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): Hakedişler ekranındaki
  // toplu "Tümünü Öde" butonu window.confirm ile onay istiyordu, buradaki
  // tekil "Ödendi İşaretle" istemiyordu — aynı sonucu (bir komisyon kaydını
  // geri alınamaz şekilde "ödendi" işaretlemek) tek tıkla ve onaysız
  // üretebiliyordu. Artık aynı onay deseni burada da var.
  async function markPaid(commission: PartnerCommissionEntry) {
    const confirmed = window.confirm(
      `${commission.shopName} için ${PARTNER_COMMISSION_TYPE_LABELS[commission.type]} — ` +
        `${commission.amountTry.toLocaleString("tr-TR")} TL'yi elden/EFT ile GERÇEKTEN ödediniz mi? ` +
        `Onaylarsanız bu kayıt ödendi olarak işaretlenir.`
    );
    if (!confirmed) return;

    const commissionId = commission.id;
    setLoadingId(commissionId);
    try {
      const res = await fetch(`/api/admin/partnerler/${partnerId}/komisyon`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Güncellenemedi.", "error");
        return;
      }
      showToast("Komisyon ödendi olarak işaretlendi.");
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  if (initialCommissions.length === 0) {
    return <p className="text-sm text-slate-500">Henüz tahakkuk eden bir komisyon yok.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Tür</th>
            <th className="px-4 py-3">İşletme</th>
            <th className="px-4 py-3">Dönem</th>
            <th className="px-4 py-3">Tutar</th>
            <th className="px-4 py-3">Tahakkuk</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {initialCommissions.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{PARTNER_COMMISSION_TYPE_LABELS[c.type]}</td>
              <td className="px-4 py-3">{c.shopName}</td>
              <td className="px-4 py-3 text-slate-500">{c.periodMonth || "—"}</td>
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
                {/* V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): paidAt veri
                    modelinde vardı ama hiçbir yerde gösterilmiyordu — "bu
                    komisyon ne zaman ödendi" sorusuna cevap yoktu. */}
                {c.status === "odendi" && c.paidAt && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(c.paidAt).toLocaleDateString("tr-TR")} ödendi
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {c.status === "tahakkuk_etti" && (
                  <button
                    onClick={() => markPaid(c)}
                    disabled={loadingId === c.id}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {loadingId === c.id ? "..." : "Ödendi İşaretle"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
