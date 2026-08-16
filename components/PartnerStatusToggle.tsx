"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { PartnerStatus } from "@/lib/types";

// Admin bir partneri aktif/pasif olarak işaretleyebilsin diye — pasif bir
// partnerin referans koduyla yeni kayıt otomatik bağlanmaz (bkz.
// app/api/auth/signup), ama geçmiş kayıtları/komisyonları etkilenmez.
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

  async function toggle() {
    const nextStatus: PartnerStatus = status === "aktif" ? "pasif" : "aktif";
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
      showToast(nextStatus === "aktif" ? "Partner aktifleştirildi." : "Partner pasife alındı.");
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
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
