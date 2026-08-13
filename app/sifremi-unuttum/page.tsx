"use client";

import { useState } from "react";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";
import { CheckCircleIcon } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Bir hata oluştu.");
      return;
    }
    // Sunucu, e-postanın kayıtlı olup olmadığından bağımsız olarak aynı genel
    // mesajı döner (bkz. api/auth/forgot-password/route.ts) — bu sayede kayıtlı
    // e-postalar dışarıdan sızdırılmaz.
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <Link href="/" className="inline-block">
            <Logo withText />
          </Link>

          {sent ? (
            <div className="mt-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-900">E-postanızı kontrol edin</h1>
              <p className="mt-2 text-sm text-slate-500">
                <strong>{email}</strong> adresi sistemde kayıtlıysa, şifrenizi sıfırlamak için
                gereken bağlantıyı içeren bir e-posta gönderdik. Bağlantı 1 saat geçerlidir.
              </p>
              <Link href="/giris" className="mt-6 inline-block text-sm font-medium text-brand-600">
                ← Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-slate-900">Şifremi Unuttum</h1>
              <p className="mt-1 text-sm text-slate-500">
                Hesabınıza kayıtlı e-posta adresini girin, sıfırlama bağlantısı gönderelim.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">E-posta</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/giris" className="font-medium text-brand-600">
                  ← Giriş sayfasına dön
                </Link>
              </p>
            </>
          )}
        </div>

        <AuthSidePanel
          tagline="Şifrenizi mi unuttunuz?"
          points={[
            "Kayıtlı e-postanıza güvenli bir sıfırlama bağlantısı gönderiyoruz",
            "Bağlantı yalnızca 1 saat geçerli, tek kullanımlık",
            "Yeni şifrenizle hemen panelinize geri dönün",
          ]}
        />
      </div>
    </main>
  );
}
