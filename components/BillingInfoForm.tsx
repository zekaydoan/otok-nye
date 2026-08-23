"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { validateBillingInfo } from "@/lib/billing";
import { E_INVOICE_TYPE_LABELS, type BillingInfo, type BillingType, type EInvoiceType } from "@/lib/types";

// Ücretli plan/etiket satın alımı öncesinde zorunlu tutulan tek seferlik fatura
// bilgisi formu — bkz. app/dashboard/fatura-bilgileri, app/api/shop/plan ve
// app/api/etiket-siparis'teki "fatura bilgisi eksikse buraya yönlendir" deseni.
// Bireysel/Kurumsal seçimine göre yalnızca ilgili isim alanı gösterilir; diğer
// alanların (vergi dairesi, vergi no, adres, telefon, e-fatura/e-arşiv) hepsi
// her iki tipte de zorunlu. E-posta bilinçli olarak zorunlu değil.
export default function BillingInfoForm({
  initial,
  returnTo,
  defaultPhone,
}: {
  initial?: BillingInfo;
  returnTo?: string;
  // İlk kayıtta (initial.phone henüz yoksa) işletme telefonuyla ön doldurmak
  // için — V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): kullanıcı sistemde
  // zaten kayıtlı telefonunu burada sıfırdan yazmak zorunda kalmasın.
  // Daha önce kaydedilmiş bir fatura telefonu varsa (initial.phone) ona
  // dokunulmaz, yalnızca ilk doldurmada devreye girer.
  defaultPhone?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [type, setType] = useState<BillingType>(initial?.type || "bireysel");
  const [fullName, setFullName] = useState(initial?.fullName || "");
  const [companyName, setCompanyName] = useState(initial?.companyName || "");
  const [taxOffice, setTaxOffice] = useState(initial?.taxOffice || "");
  const [taxNumber, setTaxNumber] = useState(initial?.taxNumber || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [phone, setPhone] = useState(initial?.phone || defaultPhone || "");
  const [eInvoiceType, setEInvoiceType] = useState<EInvoiceType | "">(
    initial?.eInvoiceType || ""
  );
  const [email, setEmail] = useState(initial?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxTaxNumberLen = type === "kurumsal" ? 10 : 11;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      type,
      fullName,
      companyName,
      taxOffice,
      taxNumber,
      address,
      phone,
      eInvoiceType,
      email,
    };
    const validationError = validateBillingInfo(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shop/billing-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Kaydedilemedi, lütfen tekrar deneyin.");
        return;
      }
      showToast("Fatura bilgileriniz kaydedildi.");
      router.push(returnTo || "/dashboard");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Fatura Tipi *</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["bireysel", "kurumsal"] as BillingType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                type === t
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "bireysel" ? "Bireysel" : "Kurumsal"}
            </button>
          ))}
        </div>
      </div>

      {type === "bireysel" ? (
        <div>
          <label className="block text-sm font-medium text-slate-700">Ad Soyad *</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700">Firma Unvanı *</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Vergi Dairesi *</label>
          <input
            required
            value={taxOffice}
            onChange={(e) => setTaxOffice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            {type === "bireysel" ? "T.C. Kimlik No *" : "Vergi Numarası *"}
          </label>
          <input
            required
            inputMode="numeric"
            maxLength={maxTaxNumberLen}
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Adres *</label>
        <textarea
          required
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Telefon *</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">E-posta (isteğe bağlı)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Mükellefiyet Durumu *</label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.entries(E_INVOICE_TYPE_LABELS) as [EInvoiceType, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setEInvoiceType(value)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                eInvoiceType === value
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Kaydediliyor..." : "Fatura Bilgilerini Kaydet"}
      </button>
    </form>
  );
}
