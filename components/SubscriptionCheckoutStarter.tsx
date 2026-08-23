"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import SubscriptionCheckoutForm from "@/components/SubscriptionCheckoutForm";
import IyzicoOdeBadge from "@/components/IyzicoOdeBadge";
import type { Plan } from "@/lib/types";

const IDENTITY_NUMBER_REGEX = /^\d{11}$/;

// /dashboard/plan/odeme'nin gövdesi — önce T.C. Kimlik No toplar (iyzico
// Abonelik API'sinin zorunlu tuttuğu bir alan, bkz. lib/iyzicoSubscription.ts
// SubscriptionCustomer; app/api/etiket-siparis/route.ts'teki aynı desenle
// tutarlı — fatura bilgisindeki taxNumber kurumsal hesaplarda VKN olabileceği
// için doğrudan kullanılamıyor, her zaman ayrı bir TCKN istenir), sonra
// app/api/shop/plan'i çağırıp dönen checkoutFormContent'i embed eder.
export default function SubscriptionCheckoutStarter({
  plan,
  defaultIdentityNumber,
}: {
  plan: Plan;
  // Bireysel fatura bilgisi kayıtlıysa T.C. Kimlik No'yu tekrar yazdırmamak için.
  defaultIdentityNumber?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [identityNumber, setIdentityNumber] = useState(defaultIdentityNumber || "");
  const [loading, setLoading] = useState(false);
  const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!IDENTITY_NUMBER_REGEX.test(identityNumber)) {
      setError("Geçerli bir T.C. Kimlik No giriniz (11 hane).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shop/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, identityNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutFormContent) {
        if (data.requiresBilling) {
          router.push(
            `/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent(`/dashboard/plan/odeme?plan=${plan}`)}`
          );
          return;
        }
        setError(data.error || "Ödeme başlatılamadı, lütfen tekrar deneyin.");
        showToast(data.error || "Ödeme başlatılamadı.", "error");
        return;
      }
      setCheckoutFormContent(data.checkoutFormContent);
    } catch {
      setError("Bağlantı hatası, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (checkoutFormContent) {
    return <SubscriptionCheckoutForm checkoutFormContent={checkoutFormContent} />;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <label className="text-sm font-medium text-slate-700">T.C. Kimlik No</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={11}
        value={identityNumber}
        onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, ""))}
        placeholder="11 haneli T.C. Kimlik No"
        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <p className="mt-1.5 text-xs text-slate-500">
        iyzico'nun ödeme altyapısı için zorunlu — yalnızca ödeme doğrulaması amaçlı kullanılır,
        firma unvanınız kurumsalsa bile bu alan bir gerçek kişiye ait T.C. Kimlik No olmalı.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={start}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Hazırlanıyor..." : "Ödemeye Geç"}
      </button>
      <div className="mt-4 flex justify-center">
        <IyzicoOdeBadge />
      </div>
    </div>
  );
}
