import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/types";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import FaqAccordion from "@/components/FaqAccordion";
import { CheckIcon } from "@/components/icons";

const steps = [
  {
    title: "1. Aracı kaydedin",
    desc: "Plaka, marka, model ve ilk yağ bakım bilgilerini panelden girin.",
  },
  {
    title: "2. QR etiketini yazdırın",
    desc: "Sistem otomatik olarak o araca özel QR kod ve firma bilgili etiket üretir.",
  },
  {
    title: "3. Araca yapıştırın",
    desc: "Etiketi motor kaputu, yağ dolum kapağı gibi görünür bir yere yapıştırın.",
  },
  {
    title: "4. Her bakımda okutun",
    desc: "Sonraki bakımlarda QR okutulur, geçmiş görülür, yeni kayıt saniyeler içinde eklenir.",
  },
];

const features = [
  {
    title: "Otomatik kayıt geçmişi",
    desc: "Yağ değişim tarihi, saati, yağ markası/modeli ve kaç kg konulduğu otomatik olarak kaydedilir ve listelenir.",
  },
  {
    title: "Araç bilgileri tek yerde",
    desc: "Plaka, marka, model ve tüm yağ geçmişi QR okutulduğunda otomatik olarak ekrana gelir.",
  },
  {
    title: "Reklam alanlı QR etiket",
    desc: "Her etikette firmanızın adı ve telefon numarası için özel bir reklam alanı bulunur.",
  },
  {
    title: "Çoklu tamirci desteği",
    desc: "Aracı başka bir yetkili servis de okutup yeni bakım kaydı ekleyebilir; defter araçla birlikte yaşar.",
  },
];

const faqs = [
  {
    q: "QR etiket ne kadar dayanıklı?",
    a: "Motor bölmesi sıcaklığına, yağa ve neme dayanıklı, su geçirmez ve UV korumalı baskı kullanıyoruz — kendi yazıcınızdan çıkardığınız kağıt etiket gibi solmaz veya yırtılmaz.",
  },
  {
    q: "Ücretsiz plan kaç araca yetiyor?",
    a: "Ücretsiz plan 15 araca kadar kayıt tutmanıza izin verir, kredi kartı gerektirmez. Daha fazla araca ihtiyacınız olduğunda dilediğiniz an ücretli bir plana geçebilirsiniz.",
  },
  {
    q: "Ödemeler güvenli mi?",
    a: "Etiket siparişi ödemeleri iyzico'nun güvenli, PCI DSS uyumlu altyapısı üzerinden alınır; kart bilgileriniz sunucularımızda saklanmaz.",
  },
  {
    q: "Araç sahiplerinin verileri nasıl korunuyor?",
    a: "Herkese açık QR sayfasında yalnızca plaka, marka/model ve bakım geçmişi görünür; araç sahibinin adı ve telefonu bu sayfada gösterilmez. Detaylar için KVKK Aydınlatma Metni'ne bakabilirsiniz.",
  },
  {
    q: "Etiket siparişim ne zaman elime ulaşır?",
    a: "Ödemeniz onaylandıktan sonra sipariş üretime alınır ve kargoya verilir; kargo takip numarasını panelinizden görebilirsiniz.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl">
            <Logo withText />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:gap-4">
            <Link href="#fiyatlandirma" className="hidden hover:text-brand-700 sm:inline">
              Fiyatlandırma
            </Link>
            <Link href="/giris" className="hover:text-brand-700">
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700 sm:px-4"
            >
              Ücretsiz Başla
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        {/* Dekoratif arka plan lekeleri — saf CSS, ekstra görsel dosyası gerektirmez */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-fade-in-up text-center lg:text-left">
            <span className="inline-block rounded-full bg-accent-500/10 px-4 py-1 text-sm font-semibold text-accent-600">
              Oto tamircileri için QR&apos;lı dijital yağ bakım defteri
            </span>
            <h1 className="mx-auto mt-6 max-w-xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:mx-0">
              Araca yapıştırın, her bakımda okutun, geçmiş kendiliğinden biriksin.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 lg:mx-0">
              Her araca özel bir QR kod üretin. Müşteri veya siz QR&apos;ı okuttuğunuzda
              plaka, marka, model ve yağ bakım geçmişi (tarih, saat, yağ türü, kaç kg
              konulduğu) otomatik olarak ekranda belirir. Kayıtlar elle defter tutmaya
              gerek kalmadan otomatik saklanır.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/kayit"
                className="rounded-lg bg-brand-600 px-6 py-3 text-lg font-semibold text-white hover:bg-brand-700 active:scale-[0.98]"
              >
                Ücretsiz Hesap Aç
              </Link>
              <Link
                href="/giris"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
              >
                Giriş Yap
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start">
              {["Kredi kartı gerekmez", "15 araca kadar ücretsiz", "2 dakikada kurulum"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Ürünü somutlaştıran kart mockup'ı — gerçek ekran görüntüsü yerine
              sadeleştirilmiş bir temsil; QR okutulunca görünen özet karta benzer. */}
          <div className="hidden justify-self-center lg:flex">
            <div className="w-full max-w-sm rotate-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-transform hover:rotate-0">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Araç</p>
                  <p className="text-2xl font-extrabold text-slate-900">34 ABC 123</p>
                </div>
                <div className="grid grid-cols-3 gap-0.5 rounded-lg bg-slate-900 p-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-sm ${[0, 2, 4, 6, 8].includes(i) ? "bg-white" : "bg-slate-600"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Volkswagen Passat · 2019</p>
              <div className="mt-4 rounded-xl bg-brand-50 p-3">
                <p className="text-xs font-semibold text-brand-700">Son Yağ Bakımı</p>
                <p className="mt-1 text-sm text-slate-700">
                  12.08.2026 · Castrol Edge 5W-30 · <strong>4,5 kg</strong>
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <CheckIcon className="h-4 w-4" />
                Düzenli Bakımlı
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">Nasıl çalışır?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.title}
                className="hover-lift rounded-xl border border-slate-200 p-5 hover:border-brand-200 hover:shadow-sm"
              >
                <h3 className="font-semibold text-brand-700">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Neler sunuyoruz?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="hover-lift rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Sık Sorulan Sorular</h2>
        <FaqAccordion items={faqs} />
      </section>

      <section id="fiyatlandirma" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold">Fiyatlandırma</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-300">
            İşletme büyüklüğünüze göre plan seçin, istediğiniz zaman yükseltin.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>).map((key) => {
              const plan = PLAN_LIMITS[key];
              return (
                <div
                  key={key}
                  className={`rounded-2xl p-6 ${
                    key === "pro" ? "bg-brand-600 ring-4 ring-accent-500" : "bg-slate-800"
                  }`}
                >
                  <h3 className="text-lg font-bold">{plan.label}</h3>
                  <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
                  <p className="mt-3 text-sm text-slate-300">
                    {plan.maxVehicles === Infinity
                      ? "Sınırsız araç kaydı"
                      : `${plan.maxVehicles} araca kadar kayıt`}
                  </p>
                  <ul className="mt-4 space-y-1 text-sm text-slate-200">
                    <li>QR kod + reklam alanlı etiket</li>
                    <li>Otomatik yağ bakım geçmişi</li>
                    <li>Sınırsız bakım kaydı</li>
                  </ul>
                  <Link
                    href="/kayit"
                    className="mt-6 block rounded-lg bg-white/10 py-2 text-center font-semibold hover:bg-white/20"
                  >
                    Bu planla başla
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-400">
            Not: Ödeme altyapısı (kart ile otomatik tahsilat) canlıya alınırken kendi
            ödeme sağlayıcı hesabınızın anahtarları tanımlanmalıdır; planlar şu an
            hesabınıza etiketlenir ve panelden değiştirilebilir.
          </p>
        </div>
      </section>

      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} Oto Künye — Oto tamircileri için QR&apos;lı dijital bakım defteri.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Link href="/kvkk" className="underline">
            KVKK Aydınlatma Metni
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/mesafeli-satis-sozlesmesi" className="underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kullanim-sartlari" className="underline">
            Kullanım Şartları
          </Link>
        </div>
        <div className="mt-4 flex justify-center">
          <PaymentBadges />
        </div>
      </footer>
    </main>
  );
}
