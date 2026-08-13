"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function StaffSection({ maxStaff }: { maxStaff: number }) {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<StaffItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/staff");
        const data = await res.json();
        if (!cancelled) setStaff(res.ok ? data.staff || [] : []);
      } catch {
        if (!cancelled) setStaff([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Çalışan eklenemedi.");
        return;
      }
      setStaff((prev) => [...(prev || []), data.staff]);
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      showToast("Çalışan eklendi. Giriş bilgilerini kendisiyle paylaşabilirsiniz.");
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, staffName: string) {
    if (!confirm(`${staffName} adlı çalışanın panele erişimini kaldırmak istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Çalışan silinemedi.", "error");
        return;
      }
      setStaff((prev) => (prev || []).filter((s) => s.id !== id));
      showToast("Çalışanın erişimi kaldırıldı.");
    } catch {
      showToast("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.", "error");
    }
  }

  const atLimit = maxStaff !== Infinity && (staff?.length ?? 0) >= maxStaff;

  return (
    <div>
      {loading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : staff && staff.length > 0 ? (
        <div className="space-y-2">
          {staff.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
                <p className="truncate text-xs text-slate-500">{s.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id, s.name)}
                className="ml-3 shrink-0 text-xs font-medium text-red-600 hover:underline"
              >
                Erişimi Kaldır
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Henüz çalışan eklemediniz.</p>
      )}

      {maxStaff !== Infinity && (
        <p className="mt-3 text-xs text-slate-400">
          {staff?.length ?? 0}/{maxStaff} çalışan
        </p>
      )}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={atLimit}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {atLimit ? "Çalışan limitine ulaşıldı — planınızı yükseltin" : "+ Çalışan Ekle"}
        </button>
      ) : (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Adı Soyadı</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">E-posta</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Şifre</label>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Bu bilgileri çalışanınızla siz paylaşacaksınız — sistem otomatik e-posta göndermez.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Ekleniyor..." : "Çalışanı Ekle"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
