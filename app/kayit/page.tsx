"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";
import { trackConversionEvent } from "@/components/AdPixels";
import { TR_PROVINCES } from "@/lib/types";
import { CheckCircleIcon } from "@/components/icons";

function SignupForm() {
  const router = useRouter();
  // Saha Partner Ağı: bir partnerin paylaştığı linkten gelen kayıtlar
  // ?ref=KOD parametresini taşır — kayıt isteğiyle birlikte gönderilip
  // hangi partnere bağlanacağı sunucu tarafında doğrulanır (bkz.
  // app/api/auth/signup/route.ts, lib/blobStore.ts attributeShopToPartnerIfUnset).
  // Bilinmeyen/geçersiz bir kod sessizce yok sayılır — kayıt akışını bloklamaz.
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  // Linki paylaşan partnerin adını gösterip "rastgele bir link değil, tanıdık
  // biri üzerinden geldim" güvenini vermek için — bkz.
  // app/api/partner/kod/[code]/route.ts (yalnızca ad döner, başka hiçbir
  // partner bilgisi bu public uç noktadan sızmaz). Bilinmeyen/pasif bir kod
  // için sessizce null kalır, kayıt akışını hiçbir şekilde etkilemez.
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "" });
  // 4 ayrı, bağımsız onay kutucuğu — hiçbiri varsayılan olarak işaretli
  // gelmez (bkz. hukuki/06_KVKK_Aydinlatma_Metni_ve_Gizlilik_Esaslari.md §5 ve
  // lib/contracts.ts CONTRACT_DOCUMENT_ORDER). "pazarlama" hariç üçü zorunludur.
  const [consents, setConsents] = useState({
    saas_kullanim_sartlari: false,
    kvkk_aydinlatma: false,
    yurtdisi_veri_aktarimi: false,
    pazarlama_izni: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!referralCode) return;
    let cancelled = false;
    fetch(`/api/partner/kod/${encodeURIComponent(referralCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPartnerName(data.name ?? null);
      })
      .catch(() => {
        // sessizce yok say — rozet gösterilmez, kayıt akışı etkilenmez
      });
    return () => {
      cancelled = true;
    };
  }, [referralCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consents.saas_kullanim_sartlari || !consents.kvkk_aydinlatma || !consents.yurtdisi_veri_aktarimi) {
      setError("Devam etmek için sözleşme ve KVKK onaylarının tümünü işaretlemelisiniz.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, consents, ...(referralCode ? { ref: referralCode } : {}) };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      trackConversionEvent("sign_up");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {partnerName && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            <span className="font-semibold">{partnerName}</span> (OtoHafıza Saha Partneri) sizi davet etti.
          </span>
        </div>
      )}
      <h1 className={`${partnerName ? "mt-4" : "mt-6"} text-2xl font-bold text-slate-900`}>
        Firma Hesabı Oluştur
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Oto tamir/servis firmanız için ücretsiz hesap açın.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Firma / Tamirci Adı</label>
              <div className="relative mt-1">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 17V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12M4 17h13M4 17H2.5M11 17V9a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v8" />
                  <path strokeLinecap="round" d="M6.5 6.5h1M6.5 9.5h1M6.5 12.5h1" />
                </svg>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:border-brand-500 focus:outline-none"
                  placeholder="Örn. Yılmaz Oto Servis"
                />
              </div>
            </div>
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
                  placeholder="ornek@firma.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
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
                    d="M4.5 3.5h2.4l1 3.3-1.6 1.3a9.5 9.5 0 0 0 4.6 4.6l1.3-1.6 3.3 1v2.4a1.5 1.5 0 0 1-1.6 1.5C8.6 15.4 4.6 11.4 3 6.1a1.5 1.5 0 0 1 1.5-1.6Z"
                  />
                </svg>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:border-brand-500 focus:outline-none"
                  placeholder="0555 000 00 00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>
                  Seçin...
                </option>
                {TR_PROVINCES.map((il) => (
                  <option key={il} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şifre</label>
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
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 focus:border-brand-500 focus:outline-none"
                  placeholder="En az 8 karakter"
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

            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  required
                  type="checkbox"
                  className="mt-0.5"
                  checked={consents.saas_kullanim_sartlari}
                  onChange={(e) =>
                    setConsents({ ...consents, saas_kullanim_sartlari: e.target.checked })
                  }
                />
                <span>
                  <Link href="/kullanim-sartlari" target="_blank" className="font-medium text-brand-600 underline">
                    SaaS Kullanım ve Lisans Sözleşmesi
                  </Link>
                  'ni ve{" "}
                  <Link href="/kullanim-sartlari" target="_blank" className="font-medium text-brand-600 underline">
                    Kullanım Şartları
                  </Link>
                  'nı okudum, kabul ediyorum. <span className="text-slate-400">(zorunlu)</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  required
                  type="checkbox"
                  className="mt-0.5"
                  checked={consents.kvkk_aydinlatma}
                  onChange={(e) => setConsents({ ...consents, kvkk_aydinlatma: e.target.checked })}
                />
                <span>
                  <Link href="/kvkk" target="_blank" className="font-medium text-brand-600 underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  'ni okudum, kişisel verilerimin belirtilen amaçlarla işlenmesini kabul
                  ediyorum. <span className="text-slate-400">(zorunlu)</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  required
                  type="checkbox"
                  className="mt-0.5"
                  checked={consents.yurtdisi_veri_aktarimi}
                  onChange={(e) =>
                    setConsents({ ...consents, yurtdisi_veri_aktarimi: e.target.checked })
                  }
                />
                <span>
                  Verilerimin, hizmetin teknik altyapısı (barındırma, e-posta bildirimi)
                  gereği yurt dışına aktarılmasına{" "}
                  <Link href="/kvkk" target="_blank" className="font-medium text-brand-600 underline">
                    KVKK Aydınlatma Metni §1.6
                  </Link>
                  'da açıklanan kapsamda açık rıza gösteriyorum.{" "}
                  <span className="text-slate-400">(zorunlu)</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={consents.pazarlama_izni}
                  onChange={(e) => setConsents({ ...consents, pazarlama_izni: e.target.checked })}
                />
                <span>
                  Kampanya ve yeniliklerle ilgili e-posta/WhatsApp ile bilgilendirilmek
                  istiyorum. <span className="text-slate-400">(isteğe bağlı)</span>
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-medium text-brand-600">
          Giriş yapın
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <Link href="/" className="inline-block">
            <Logo withText />
          </Link>
          <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Yükleniyor...</p>}>
            <SignupForm />
          </Suspense>
        </div>

        <AuthSidePanel
          tagline="2 dakikada kurulum, kredi kartı gerekmez."
          points={[
            "15 araca kadar tamamen ücretsiz",
            "Her araca özel QR etiket + reklam alanı",
            "Bakım geçmişi araçla birlikte, elle deftere gerek kalmadan yaşar",
          ]}
        />
      </div>
    </main>
  );
}
