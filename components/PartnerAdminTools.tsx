"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Admin partner detay sayfasındaki iki idari araç: aylık hedef belirleme
// (bkz. app/partner kendi panelindeki ilerleme çubuğu) ve şifre sıfırlama
// (bkz. app/api/admin/partnerler/[id]/sifre-sifirla — SMS ile kendi kendine
// sıfırlama altyapısı yok, admin üretip WhatsApp'tan iletir).
export default function PartnerAdminTools({
  partnerId,
  initialTarget,
}: {
  partnerId: string;
  initialTarget?: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [target, setTarget] = useState(initialTarget ? String(initialTarget) : "");
  const [savingTarget, setSavingTarget] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  async function saveTarget(e: React.FormEvent) {
    e.preventDefault();
    setSavingTarget(true);
    try {
      const value = target.trim() === "" ? null : Number(target);
      const res = await fetch(`/api/admin/partnerler/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyTarget: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Hedef kaydedilemedi.", "error");
        return;
      }
      showToast("Aylık hedef güncellendi.");
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setSavingTarget(false);
    }
  }

  async function resetPassword() {
    if (!confirm("Partnerin şifresi sıfırlanıp yeni bir geçici şifre üretilsin mi?")) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/partnerler/${partnerId}/sifre-sifirla`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Şifre sıfırlanamadı.", "error");
        return;
      }
      setNewPassword(data.tempPassword);
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <form onSubmit={saveTarget} className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">Aylık Hedef (işletme)</label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="number"
            min={0}
            max={10000}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Örn. 10"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={savingTarget}
            className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {savingTarget ? "..." : "Kaydet"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Partner kendi panelinde bu hedefe göre ilerleme görür.</p>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">Şifre</label>
        {newPassword ? (
          <div className="mt-1.5 rounded-lg bg-amber-50 p-3 text-sm">
            <p className="text-amber-800">
              Yeni geçici şifre: <span className="font-mono font-bold">{newPassword}</span>
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Bu şifre yalnızca burada gösterilir — partnere WhatsApp&apos;tan iletin.
            </p>
          </div>
        ) : (
          <button
            onClick={resetPassword}
            disabled={resetting}
            className="mt-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {resetting ? "..." : "Şifreyi Sıfırla"}
          </button>
        )}
      </div>
    </div>
  );
}
