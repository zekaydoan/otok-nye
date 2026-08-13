"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";
import { CheckCircleIcon } from "@/components/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/giris"), 2000);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mt-6">
        <p className="text-sm text-red-600">
          Bağlantı geçersiz görünüyor. Yeni bir şifre sıfırlama bağlantısı talep edin.
        </p>
        <Link href="/sifremi-unuttum" className="mt-4 inline-block text-sm font-medium text-brand-600">
          ← Şifremi unuttum sayfasına dön
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircleIcon className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Şifreniz güncellendi</h1>
        <p className="mt-2 text-sm text-slate-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Yeni Şifre Belirle</h1>
      <p className="mt-1 text-sm text-slate-500">En az 8 karakterden oluşan yeni bir şifre girin.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
          <div className="relative mt-1">
            <input
              required
              minLength={8}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 focus:border-brand-500 focus:outline-none"
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <Link href="/" className="inline-block">
            <Logo withText />
          </Link>
          <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Yükleniyor...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <AuthSidePanel
          tagline="Neredeyse tamam."
          points={[
            "Yeni şifreniz güçlü bir hash ile saklanır",
            "Bu bağlantı yalnızca bir kez kullanılabilir",
            "Güncelledikten sonra doğrudan giriş yapabilirsiniz",
          ]}
        />
      </div>
    </main>
  );
}
