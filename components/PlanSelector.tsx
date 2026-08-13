"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function PlanSelector({ currentPlan }: { currentPlan: Plan }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choosePlan(plan: Plan) {
    setLoading(plan);
    setError(null);
    const res = await fetch("/api/shop/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Plan değiştirilemedi, lütfen tekrar deneyin.");
      return;
    }
    showToast("Plan güncellendi.");
    router.refresh();
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
      {(Object.keys(PLAN_LIMITS) as Plan[]).map((key) => {
        const plan = PLAN_LIMITS[key];
        const active = key === currentPlan;
        return (
          <div
            key={key}
            className={`rounded-xl border p-5 ${
              active ? "border-brand-500 ring-2 ring-brand-200" : "border-slate-200"
            } bg-white`}
          >
            <h3 className="font-bold text-slate-900">{plan.label}</h3>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-500">
              {plan.maxVehicles === Infinity ? "Sınırsız araç" : `${plan.maxVehicles} araca kadar`}
            </p>
            <button
              disabled={active || loading !== null}
              onClick={() => choosePlan(key)}
              className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold ${
                active
                  ? "bg-slate-100 text-slate-400"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              } disabled:opacity-60`}
            >
              {active ? "Mevcut Plan" : loading === key ? "Değiştiriliyor..." : "Bu Planı Seç"}
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
