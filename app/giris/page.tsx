"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <Link href="/" className="inline-block">
            <Logo withText />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Giriş Yap</h1>
          <p className="mt-1 text-sm text-slate-500">Tamirci panelinize erişin.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">E-posta</label>
              <div className="relative mt-1">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 0 7 6 7-6"
                  />
                </svg>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Şifre</label>
                <Link href="/sifremi-unuttum" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative mt-1">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <rect x="4" y="9" width="12" height="8" rx="1.5" />
                  <path strokeLinecap="round" d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
                </svg>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? "Gizle" : "Göster"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="font-medium text-brand-600">
              Ücretsiz kayıt olun
            </Link>
          </p>
        </div>

        <AuthSidePanel
          tagline="Tekrar hoş geldiniz."
          points={[
            "Araçlarınızı ve bakım geçmişini tek panelden yönetin",
            "Otomatik WhatsApp bakım hatırlatmaları gönderin",
            "Her bakımda saniyeler içinde yeni kayıt ekleyin",
          ]}
        />
      </div>
    </main>
  );
}
