"use client";

import { useState } from "react";
import Link from "next/link";
import PaymentBadges from "@/components/PaymentBadges";

export default function StickerOrderForm({
  unitPriceTry,
  defaultPhone,
  defaultName,
}: {
  unitPriceTry: number;
  defaultPhone?: string;
  defaultName?: string;
}) {
  const [quantity, setQuantity] = useState(50);
  const [labelName, setLabelName] = useState(defaultName || "");
  const [labelPhone, setLabelPhone] = useState(defaultPhone || "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [addressLine, setAddressLine] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Math.round(unitPriceTry * quantity * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contractAccepted) {
      setError("Devam etmek için Mesafeli Satış Sözleşmesi'ni onaylamalısınız.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/etiket-siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          identityNumber,
          contractAccepted,
          labelName,
          labelPhone,
          address: { fullName, phone, addressLine, district, city, postalCode },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Sipariş oluşturulamadı, lütfen tekrar deneyin.");
        return;
      }
      // Ödeme sayfasına yönlendir — kart bilgileri iyzico'nun barındırdığı sayfada
      // girilir, bu sunucudan hiç geçmez.
      window.location.href = data.paymentPageUrl;
    } catch {
      setError("Bağlantı hatası, sipariş oluşturulamadı. Lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Adet</label>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-600 hover:bg-slate-50"
            aria-label="Adedi azalt"
          >
            −
          </button>
          <input
            type="number"
            required
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
            className="h-10 w-20 rounded-lg border border-slate-300 px-2 text-center focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(500, q + 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-600 hover:bg-slate-50"
            aria-label="Adedi artır"
          >
            +
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Birim fiyat: {unitPriceTry.toFixed(2)}₺</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-700">Etikette Görünecek Bilgiler</h3>
        <p className="mt-1 text-xs text-slate-500">
          Her etiket, hangi araca yapıştırılacağı önceden bilinmediği için plakasız
          basılır — bunun yerine firma/usta adınız ve telefonunuz görünür. Etiketi
          bir araca yapıştırıp ilk kez okuttuğunuzda o etiket o araca bağlanır.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Firma / Usta Adı *</label>
            <input
              required
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Yılmaz Servis"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Etiket Telefonu *</label>
            <input
              required
              value={labelPhone}
              onChange={(e) => setLabelPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-700">Teslimat Adresi</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Ad Soyad *</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Telefon *</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-slate-600">Adres *</label>
          <textarea
            required
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">İlçe *</label>
            <input
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">İl *</label>
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Posta Kodu</label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">T.C. Kimlik No *</label>
        <input
          required
          inputMode="numeric"
          maxLength={11}
          value={identityNumber}
          onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-60 focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">
          Ödeme altyapımız iyzico'nun kart güvenliği için zorunlu tuttuğu bir alan;
          siparişinizle birlikte saklanmaz, yalnızca ödeme anında iyzico'ya iletilir.
        </p>
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="contract"
          checked={contractAccepted}
          onChange={(e) => setContractAccepted(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="contract" className="text-sm text-slate-600">
          <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-medium text-brand-600 underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          'ni okudum, onaylıyorum.
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">
            {quantity} adet × {unitPriceTry.toFixed(2)}₺
          </p>
          <p className="text-xl font-bold text-slate-900">{total.toFixed(2)}₺</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Yönlendiriliyor..." : "Öde ve Sipariş Ver"}
        </button>
      </div>

      <PaymentBadges className="justify-center border-t border-slate-100 pt-4 sm:justify-start" />
    </form>
  );
}
