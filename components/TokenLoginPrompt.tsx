"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Fiziksel etiket henüz bir araca bağlanmamışken (bkz. app/e/[token]) okutulduğunda,
// bağlama işlemi giriş gerektirdiği için burada küçük bir giriş formu gösteriyoruz —
// kullanıcıyı ayrı bir sayfaya (/giris) yönlendirip geri dönüş bağlantısı yönetmek
// yerine, aynı sayfada girişi tamamlatıp router.refresh() ile araç bağlama formunun
// görünmesini sağlıyoruz.
export default function TokenLoginPrompt() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Giriş başarısız.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600">E-posta</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Şifre</label>
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-medium text-brand-600">
          Ücretsiz kayıt olun
        </Link>
      </p>
    </form>
  );
}
