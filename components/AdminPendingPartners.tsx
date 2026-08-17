"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { PARTNER_CATEGORY_LABELS } from "@/lib/types";
// Yalnızca tip olarak içe aktarılıyor — bkz. AdminPartnerForm.tsx'teki aynı yorum.
import type { PartnerSummary } from "@/lib/blobStore";

// Admin'in "onay_bekliyor" durumundaki başvuruları görüp onaylayabildiği/
// reddedebildiği liste — bkz. app/partner-basvuru (başvuru formu),
// app/api/partner/basvuru (status="onay_bekliyor" ile oluşturma). Bilinçli
// olarak BÖLGEYE GÖRE GRUPLANMIŞ gösteriliyor: kullanıcının asıl isteği "aynı
// şehirden birden fazla kişinin partnerlik başvurusunu [karşılaştırarak]
// değerlendirelim" idi — aynı bölgeden gelen başvurular yan yana durunca
// admin kimi seçeceğine (bölge çakışması varsa) daha kolay karar verebilir.
// Reddetme, ayrı bir "reddedildi" durumu YERİNE "pasif" olarak işaretlenir —
// PartnerStatusToggle zaten pasif bir partneri istenirse sonradan
// aktifleştirebiliyor, yani "reddet" kararı geri alınabilir kalıyor.
export default function AdminPendingPartners({
  groups,
}: {
  groups: { region: string; items: PartnerSummary[] }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function decide(partnerId: string, name: string, approve: boolean) {
    if (!approve && !confirm(`"${name}" adlı başvuruyu reddetmek istediğinize emin misiniz?`)) {
      return;
    }
    setLoadingId(partnerId);
    try {
      const res = await fetch(`/api/admin/partnerler/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: approve ? "aktif" : "pasif" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "İşlem yapılamadı.", "error");
        return;
      }
      showToast(approve ? `${name} onaylandı.` : `${name} reddedildi.`);
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);
  if (totalCount === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-sm font-bold text-amber-900">Onay Bekleyen Başvurular ({totalCount})</h2>
      <p className="mt-1 text-xs text-amber-800">
        Aynı bölgeden birden fazla başvuru varsa aşağıda birlikte gruplanır — karşılaştırıp
        hangisini onaylayacağınıza karar verebilirsiniz.
      </p>
      <div className="mt-3 space-y-4">
        {groups.map((g) => (
          <div key={g.region}>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {g.region}
              {g.items.length > 1 ? ` · ${g.items.length} başvuru` : ""}
            </p>
            <div className="mt-1.5 space-y-2">
              {g.items.map((s) => (
                <div
                  key={s.partner.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.partner.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.partner.phone}
                      {s.partner.email ? ` · ${s.partner.email}` : ""}
                      {s.partner.category ? ` · ${PARTNER_CATEGORY_LABELS[s.partner.category]}` : ""}
                      {" · Başvuru: "}
                      {new Date(s.partner.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => decide(s.partner.id, s.partner.name, true)}
                      disabled={loadingId === s.partner.id}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => decide(s.partner.id, s.partner.name, false)}
                      disabled={loadingId === s.partner.id}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
