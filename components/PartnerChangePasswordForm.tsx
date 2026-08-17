"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

// bkz. components/ChangePasswordForm.tsx (bayi tarafındaki birebir aynı
// desen) — tek fark, partner şifrelerinin 6 haneli rakam olması (bkz.
// app/api/partner/sifre-degistir/route.ts).
export default function PartnerChangePasswordForm() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(newPassword)) {
      setError("Yeni şifre tam olarak 6 haneli rakam olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/partner/sifre-degistir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Şifre güncellenemedi.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Şifreniz güncellendi.");
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Mevcut Şifre</label>
        <input
          required
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Yeni Şifre (6 haneli)</label>
        <input
          required
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
        <input
          required
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-brand-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
