"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";

// Saha Partneri girişi — bkz. app/api/partner/giris, lib/partnerAuth.ts.
// Bilinçli olarak app/giris'ten (bayi girişi) TAMAMEN AYRI bir sayfa/uç
// nokta/oturum kullanır; partner bir bayi değildir, karıştırılmaması için
// ayrı bir URL'de tutulur.
export default function PartnerLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/partner/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      router.push("/partner");
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
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Saha Partneri Girişi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Getirdiğiniz işletmeleri ve kazancınızı görmek için giriş yapın.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
              <input
                required
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0555 000 00 00"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şifre</label>
              <div className="relative mt-1">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  inputMode="numeric"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6 haneli şifreniz"
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
            Şifrenizi mi unuttunuz? OtoHafıza ile iletişime geçin, sıfırlansın.
          </p>
        </div>

        <AuthSidePanel
          tagline="Getirdiğin her işletme, kazancın."
          points={[
            "Getirdiğiniz işletmeleri ve durumlarını tek ekrandan görün",
            "Aylık hedefinize ne kadar yaklaştığınızı takip edin",
            "Kazandığınız komisyonu ve ödeme durumunu anında görün",
          ]}
        />
      </div>
    </main>
  );
}
