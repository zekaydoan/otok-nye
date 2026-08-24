"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { PAID_PLANS_DISABLED_MESSAGE, PAID_PLANS_ENABLED } from "@/lib/planAvailability";
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

  // free'ye dönüş risksiz — anında uygulanır, burada kalıyor. Ücretli bir plana
  // geçiş artık burada YAPILMIYOR (18 Ağustos 2026 öncesi admin-onay akışıydı)
  // — gerçek ödeme/T.C. Kimlik No toplama app/dashboard/plan/odeme'de,
  // handlePlanClick aşağıda oraya yönlendiriyor.
  async function chooseFreePlan() {
    setLoading("free");
    setError(null);
    try {
      const res = await fetch("/api/shop/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Plan değiştirilemedi, lütfen tekrar deneyin.");
        return;
      }
      showToast("Plan güncellendi.");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(null);
    }
  }

  function handlePlanClick(plan: Plan) {
    if (plan === "free") {
      chooseFreePlan();
    } else {
      router.push(`/dashboard/plan/odeme?plan=${plan}`);
    }
  }

  return (
    <div className="mt-6">
      {!PAID_PLANS_ENABLED && (
        <p className="mb-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {PAID_PLANS_DISABLED_MESSAGE}
        </p>
      )}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {/* V2 sadeleştirme (23 Ağustos 2026, Zeki onayı) — netlik notu: fiyat ve
          limit farkının, farklı özellik seti farkı gibi algılanmaması için. */}
      <p className="mb-3 text-sm text-slate-500">
        Tüm planlarda temel özellikler aynıdır; planlar araç ve çalışan limitlerine göre değişir.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(PLAN_LIMITS) as Plan[]).map((key) => {
        const plan = PLAN_LIMITS[key];
        const active = key === currentPlan;
        const isPending = key === pendingPlan;
        const isCampaign = Boolean(plan.badge);
        const isLocked = key !== "free" && !PAID_PLANS_ENABLED && !active && !isPending;
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
            {/* V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): çalışan limiti
                eskiden yalnızca ana sayfadaki pazarlama kartlarında vardı,
                panelde yoktu — kullanıcı planları karşılaştırmak için ana
                sayfaya gitmek zorunda kalıyordu. */}
            <p className="mt-0.5 text-sm text-slate-500">
              {plan.maxStaff === Infinity ? "Sınırsız çalışan" : `${plan.maxStaff} çalışana kadar`}
            </p>
            <button
              disabled={active || isPending || isLocked || loading !== null}
              onClick={() => handlePlanClick(key)}
              className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold ${
                active
                  ? "bg-slate-100 text-slate-400"
                  : isPending
                    ? "bg-amber-100 text-amber-700"
                    : isLocked
                      ? "bg-slate-100 text-slate-400"
                      : isCampaign
                        ? "bg-accent-500 text-white hover:bg-accent-600"
                        : "bg-brand-600 text-white hover:bg-brand-700"
              } disabled:opacity-60`}
            >
              {active
                ? "Mevcut Plan"
                : isPending
                  ? "Onay Bekleniyor"
                  : isLocked
                    ? "Yakında"
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
