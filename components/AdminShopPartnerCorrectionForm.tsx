"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): "Partner Düzelt" — bayi
// detayında İKİNCİL/gelişmiş bir yönetim aksiyonu (bkz. <details> sarmalayıcı,
// çağıran sayfa). Otomatik ilk-temas mantığına (attributeShopToPartnerIfUnset)
// dokunmaz — bu yalnızca admin'in nadir bir hatayı (ör. sahada yanlış referans
// kodu verilmesi) elle düzeltmesi içindir. Günlük kullanımda gerekmez.
export default function AdminShopPartnerCorrectionForm({
  shopId,
  currentPartnerId,
  currentPartnerName,
  partners,
}: {
  shopId: string;
  currentPartnerId?: string;
  currentPartnerName?: string;
  partners: { id: string; name: string; status: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const currentValue = currentPartnerId || "";
  const currentLabel = currentPartnerName || "Partnersiz";

  const [partnerId, setPartnerId] = useState(currentValue);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = partnerId ? partners.find((p) => p.id === partnerId)?.name || "Bilinmeyen" : "Partnersiz";
  const noChange = partnerId === currentValue;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Gerekçe zorunlu.");
      return;
    }

    const confirmed = window.confirm(
      `Bu bayinin partnerini "${currentLabel}" durumundan "${selectedLabel}" durumuna ` +
        `değiştirmek istediğinize emin misiniz?\n\n` +
        `Bu işlem YALNIZCA bundan sonra tahakkuk edecek komisyonları etkiler — geçmiş ` +
        `komisyon kayıtları değişmez.`
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/partner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: partnerId || null, reason: trimmedReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Güncellenemedi.");
        return;
      }
      showToast("Partner ataması güncellendi.");
      setReason("");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-slate-500">
        Mevcut partner:{" "}
        {currentPartnerId ? (
          <Link href={`/admin/partnerler/${currentPartnerId}`} className="font-semibold text-brand-600 hover:underline">
            {currentLabel}
          </Link>
        ) : (
          <span className="font-semibold text-slate-700">{currentLabel}</span>
        )}
      </p>
      <div>
        <label className="block text-xs font-medium text-slate-600">Yeni Partner</label>
        <select
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:max-w-xs"
        >
          <option value="">Partnersiz</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.status !== "aktif" ? ` (${p.status === "pasif" ? "pasif" : "onay bekliyor"})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Gerekçe (zorunlu)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Örn. Saha ekibi bayiye yanlış referans kodu vermiş, doğru partner ile düzeltiliyor."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving || noChange || !reason.trim()}
        className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Kaydediliyor..." : "Partner Atamasını Güncelle"}
      </button>
    </form>
  );
}
