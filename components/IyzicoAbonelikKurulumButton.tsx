"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// app/api/admin/iyzico-abonelik-kurulum'u tetikleyen tek buton — bkz.
// app/admin/iyzico-abonelik (bu sayfanın açıklaması). İdempotent bir uca
// bağlı olduğundan tekrar tekrar tıklamak güvenli, zaten var olan kodları
// yeniden oluşturmaz.
export default function IyzicoAbonelikKurulumButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/iyzico-abonelik-kurulum", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 207) {
        showToast(data.error || "Kurulum başarısız.", "error");
        return;
      }
      if (data.errors?.length) {
        showToast(`Bazı planlar oluşturulamadı: ${data.errors.join(", ")}`, "error");
      } else {
        showToast("Kurulum tamamlandı — ürün ve ödeme planları hazır.");
      }
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {loading ? "Oluşturuluyor..." : "Ürün + Ödeme Planlarını Oluştur"}
    </button>
  );
}
