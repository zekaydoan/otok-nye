"use client";

import { useState } from "react";
import Link from "next/link";
import AuthSidePanel from "@/components/AuthSidePanel";
import Logo from "@/components/Logo";
import { CheckCircleIcon } from "@/components/icons";
import { PARTNER_CATEGORY_LABELS, type PartnerCategory } from "@/lib/types";

// Saha Partnerinin kendi kendine başvuru formunu doldurduğu sayfa — bkz.
// app/api/partner/basvuru. Önceden tek yol admin'in AdminPartnerForm ile elle
// partner eklemesiydi; bu artık asıl akış, ama ARTIK anında hesap AÇMIYOR —
// başvuru "onay_bekliyor" durumunda kaydediliyor, admin app/admin/partnerler'da
// (özellikle aynı bölgeden gelen başvuruları karşılaştırıp) onaylayana kadar
// giriş yapılamıyor. Bu yüzden başarılı gönderimde /partner'a yönlendirmek
// yerine (oturum açtırılmıyor artık, bkz. route dosyasındaki yorum) burada bir
// "başvurunuz alındı" onay ekranı gösteriliyor. app/partner-girisi'nden
// (giriş) BİLİNÇLİ olarak ayrı bir sayfa — biri giriş, biri kayıt, aynı forma
// karıştırılmadı.
export default function PartnerBasvuruPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    email: "",
    category: "" as PartnerCategory | "",
    region: "",
  });
  // 4 ayrı, bağımsız onay kutucuğu — hiçbiri varsayılan olarak işaretli
  // gelmez (bkz. lib/contracts.ts PARTNER_CONTRACT_DOCUMENT_ORDER).
  // "pazarlama" hariç üçü zorunludur.
  const [consents, setConsents] = useState({
    saha_partner_sozlesmesi: false,
    kvkk_aydinlatma: false,
    yurtdisi_veri_aktarimi: false,
    pazarlama_izni: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Ad Soyad zorunlu.");
    if (!form.phone.trim()) return setError("Telefon zorunlu.");
    if (!/^\d{6}$/.test(form.password)) return setError("Şifre tam olarak 6 haneli rakam olmalı.");
    if (form.password !== form.passwordConfirm) return setError("Şifreler eşleşmiyor.");
    if (!consents.saha_partner_sozlesmesi || !consents.kvkk_aydinlatma || !consents.yurtdisi_veri_aktarimi) {
      return setError("Devam etmek için sözleşme ve KVKK onaylarının tümünü işaretlemelisiniz.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/partner/basvuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          password: form.password,
          email: form.email.trim() || undefined,
          category: form.category || undefined,
          region: form.region.trim() || undefined,
          consents,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Başvuru gönderilemedi.");
        return;
      }
      setSubmitted(true);
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

          {submitted ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Başvurunuz alındı</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Ekibimiz başvurunuzu inceleyip kısa sürede onaylayacak. Onaylandığında
                    girdiğiniz telefon numarasıyla{" "}
                    <Link href="/partner-girisi" className="font-medium text-brand-600 hover:underline">
                      giriş yapabilirsiniz
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-slate-900">Saha Partneri Ol</h1>
              <p className="mt-1 text-sm text-slate-500">
                Formu doldurun, ekibimiz kısa sürede inceleyip onaylasın.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Ad Soyad</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Örn. Ahmet Yılmaz"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </div>
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
                <label className="block text-sm font-medium text-slate-700">6 Haneli Şifre</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value.replace(/\D/g, "") })}
                  placeholder="••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Şifre (Tekrar)</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.passwordConfirm}
                  onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value.replace(/\D/g, "") })}
                  placeholder="••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">E-posta (opsiyonel)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ornek@mail.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Sektörünüz (opsiyonel)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as PartnerCategory | "" })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Seçilmedi</option>
                  {Object.entries(PARTNER_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Bölge (opsiyonel)</label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="Örn. Merter Oto Sanayi Sitesi, İstanbul"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  required
                  type="checkbox"
                  className="mt-0.5"
                  checked={consents.saha_partner_sozlesmesi}
                  onChange={(e) =>
                    setConsents({ ...consents, saha_partner_sozlesmesi: e.target.checked })
                  }
                />
                <span>
                  <Link href="/saha-partner-sozlesmesi" target="_blank" className="font-medium text-brand-600 underline">
                    Saha Partner Sözleşmesi
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
              {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Zaten hesabınız var mı?{" "}
                <Link href="/partner-girisi" className="font-medium text-brand-600 hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </>
          )}
        </div>

        <AuthSidePanel
          tagline="Getirdiğin her işletme, kazancın."
          points={[
            "Formu doldurun, başvurunuz kısa sürede incelensin",
            "Onaylandığında kendi referans linkinizle işletmeleri kaydedin",
            "Kazandığınız komisyonu panelde anında görün",
          ]}
        />
      </div>
    </main>
  );
}
