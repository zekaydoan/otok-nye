"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { PartnerStatus } from "@/lib/types";

// Admin bir partneri aktif/pasif olarak işaretleyebilsin diye — pasif bir
// partnerin referans koduyla yeni kayıt otomatik bağlanmaz (bkz.
// app/api/auth/signup), ama geçmiş kayıtları/komisyonları etkilenmez.
// "onay_bekliyor" durumu için ayrı bir dal var: tek bir "Aktifleştir" butonu
// yerine Onayla/Reddet ikilisi gösterilir — bkz. components/AdminPendingPartners.tsx'teki
// aynı iki-buton deseni (asıl onaylama akışı orada, bölgeye göre gruplanmış
// listede yapılır). Bu bileşen partnerin detay sayfasına (bkz.
// app/admin/partnerler/[id]) doğrudan girildiğinde de aynı işlevi sağlasın
// diye üç durumu da (onay_bekliyor/aktif/pasif) kapsar.
export default function PartnerStatusToggle({
  partnerId,
  status,
}: {
  partnerId: string;
  status: PartnerStatus;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function setStatus(nextStatus: PartnerStatus) {
    if (
      nextStatus === "pasif" &&
      status === "onay_bekliyor" &&
      !confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/partnerler/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Durum güncellenemedi.", "error");
        return;
      }
      showToast(
        nextStatus === "aktif"
          ? status === "onay_bekliyor"
            ? "Başvuru onaylandı."
            : "Partner aktifleştirildi."
          : status === "onay_bekliyor"
          ? "Başvuru reddedildi."
          : "Partner pasife alındı."
      );
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "onay_bekliyor") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setStatus("aktif")}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "..." : "Onayla"}
        </button>
        <button
          onClick={() => setStatus("pasif")}
          disabled={loading}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Reddet
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStatus(status === "aktif" ? "pasif" : "aktif")}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
        status === "aktif"
          ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
          : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
    >
      {loading ? "..." : status === "aktif" ? "Pasife Al" : "Aktifleştir"}
    </button>
  );
}
