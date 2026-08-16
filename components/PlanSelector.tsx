"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function PlanSelector({
  currentPlan,
  pendingPlan,
}: {
  currentPlan: Plan;
  pendingPlan?: Plan;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choosePlan(plan: Plan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/shop/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.requiresBilling) {
          router.push(`/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent("/dashboard/plan")}`);
          return;
        }
        setError(data.error || "Plan değiştirilemedi, lütfen tekrar deneyin.");
        return;
      }
      const data = await res.json().catch(() => ({}));
      showToast(
        data.pending
          ? "Talebiniz alındı — ödemeniz onaylandıktan sonra planınız aktif edilecek."
          : "Plan güncellendi."
      );
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-6">
      {pendingPlan && (
        <p className="mb-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{PLAN_LIMITS[pendingPlan].label}</strong> planına geçiş talebiniz alındı,
          ödemeniz onaylandıktan sonra ekibimiz planınızı aktif edecek.
        </p>
      )}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(PLAN_LIMITS) as Plan[]).map((key) => {
        const plan = PLAN_LIMITS[key];
        const active = key === currentPlan;
        const isPending = key === pendingPlan;
        const isCampaign = Boolean(plan.badge);
        return (
          <div
            key={key}
            className={`relative rounded-xl border p-5 ${
              isCampaign
                ? "border-accent-400 bg-gradient-to-br from-accent-50 to-white ring-2 ring-accent-200"
                : active
                  ? "border-brand-500 ring-2 ring-brand-200 bg-white"
                  : "border-slate-200 bg-white"
            }`}
          >
            {isCampaign && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                🎉 Kampanya: {plan.badge}
              </span>
            )}
            <h3 className="font-bold text-slate-900">{plan.label}</h3>
            <p className="mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{plan.price}</span>
              <span className="text-sm font-medium text-slate-500">{plan.period}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {plan.maxVehicles === Infinity ? "Sınırsız araç" : `${plan.maxVehicles} araca kadar`}
            </p>
            <button
              disabled={active || isPending || loading !== null}
              onClick={() => choosePlan(key)}
              className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold ${
                active
                  ? "bg-slate-100 text-slate-400"
                  : isPending
                    ? "bg-amber-100 text-amber-700"
                    : isCampaign
                      ? "bg-accent-500 text-white hover:bg-accent-600"
                      : "bg-brand-600 text-white hover:bg-brand-700"
              } disabled:opacity-60`}
            >
              {active
                ? "Mevcut Plan"
                : isPending
                  ? "Onay Bekleniyor"
                  : loading === key
                    ? "Talep gönderiliyor..."
                    : "Bu Planı Seç"}
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
