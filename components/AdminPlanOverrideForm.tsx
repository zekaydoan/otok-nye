"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

// Admin, banka havalesiyle ödeme alınan (POS henüz kurulmadığı için, bkz.
// README "Ödeme / Abonelik Notu") bir bayinin planını burada elle değiştirir —
// bkz. app/api/admin/shops/[id]/plan/route.ts. Bayinin kendi Ayarlar
// sayfasındaki plan değişikliğinden farkı: yetkilendirme admin e-postasına
// dayanır, bayi oturumuna değil.
export default function AdminPlanOverrideForm({
  shopId,
  currentPlan,
}: {
  shopId: string;
  currentPlan: Plan;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [plan, setPlan] = useState<Plan>(currentPlan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Güncellenemedi.");
        return;
      }
      showToast("Plan güncellendi.");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-600">Plan</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as Plan)}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          {(Object.keys(PLAN_LIMITS) as Plan[]).map((p) => (
            <option key={p} value={p}>
              {PLAN_LIMITS[p].label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={saving || plan === currentPlan}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? "Kaydediliyor..." : "Planı Güncelle"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
