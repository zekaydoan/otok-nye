"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { validatePartnerPaymentInfo, formatIban } from "@/lib/paymentInfo";
import type { PartnerPaymentInfo } from "@/lib/types";

// bkz. components/BillingInfoForm.tsx aynı desen (initial değerle önceden
// doldurma, ortak validator hem burada hem app/api/partner/odeme-bilgileri'nde
// kullanılıyor). Bir kez girildikten sonra partner her ay tekrar sorulmasın
// diye — hakedişler bu bilgideki IBAN'a ayda 1 kez ödenir.
export default function PartnerPaymentInfoForm({ initial }: { initial?: PartnerPaymentInfo | null }) {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(initial?.fullName || "");
  const [iban, setIban] = useState(initial ? formatIban(initial.iban) : "");
  const [bankName, setBankName] = useState(initial?.bankName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input = { fullName, iban, bankName };
    const validationError = validatePartnerPaymentInfo(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/partner/odeme-bilgileri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Kaydedilemedi.");
        return;
      }
      setIban(formatIban(data.paymentInfo?.iban || iban));
      showToast("Ödeme bilgileriniz kaydedildi.");
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Hakedişleriniz ayda 1 kez, burada kayıtlı IBAN'a ödenir. Bir kez doğru girdiğinizde her ay
        ayrıca sorulmaz.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700">Hesap Sahibinin Ad Soyadı</label>
        <input
          required
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Örn. Ahmet Yılmaz"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">IBAN</label>
        <input
          required
          type="text"
          value={iban}
          onChange={(e) => setIban(formatIban(e.target.value))}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          maxLength={32}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono tracking-wide focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Banka Adı</label>
        <input
          required
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Örn. Ziraat Bankası"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {initial?.updatedAt && !error && (
        <p className="text-xs text-slate-400">
          Son güncelleme: {new Date(initial.updatedAt).toLocaleDateString("tr-TR")}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Kaydediliyor..." : "Ödeme Bilgilerini Kaydet"}
      </button>
    </form>
  );
}
