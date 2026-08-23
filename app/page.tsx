import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/types";
import { FOUNDING_SERVICE_SLOTS, PAID_PLANS_ENABLED } from "@/lib/planAvailability";
import { getFoundingServiceCount } from "@/lib/blobStore";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import FaqAccordion from "@/components/FaqAccordion";
import MobileNavMenu from "@/components/MobileNavMenu";
import { buildBusinessWhatsAppLink } from "@/lib/whatsappBusiness";
import {
  BellIcon,
  CalendarIcon,
  CarIcon,
  ChatIcon,
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  QrIcon,
  UsersIcon,
  WhatsAppIcon,
  XCircleIcon,
} from "@/components/icons";

// V2 ana sayfa yeniden kurgusu (23 Ağustos 2026, Zeki onayı): satış hikâyesi
// artık "Bu ne? -> Tam bana lazım -> Ücretsiz başlayayım" akışını izliyor —
// Hero -> Sorun/Çözüm -> Kimler İçin -> Nasıl Çalışır -> Ne Kazandırır ->
// Müşteri Geri Dönüş Döngüsü -> Fiyatlandırma -> SSS -> Final CTA -> Footer.
// Önceki sürümdeki ticker bandı, 10'lu özellik gridi, 3 ayrı vitrin bloğu,
// Blog bölümü ve büyük İletişim bölümü kaldırıldı/birleştirildi — gerekçeler
// ilgili bölümlerin yorumlarında. Bu, kod tabanının geri kalanına (dashboard,
// kayıt/giriş, API, ödeme, veri modeli) DOKUNMAYAN, yalnızca bu dosyayı ve
// components/MobileNavMenu.tsx'i kapsayan bir değişikliktir.
export const dynamic = "force-dynamic";

const sorunPainPoints = [
  "Defter kaybolur, yıpranır, elinizin altında olmayabilir.",
  "Bir müşterinin geçmişini bulmak dakikalar sürer, bazen imkânsızdır.",
  "Bakım zamanı geldiğinde müşteriyi aramayı unutur, işi kaçırırsınız.",
  "Müşteri tekrar geldiğinde eski bakım bilgilerini bulmak zorlaşır.",
];

const cozumSolutions = [
  "Bilgiler bulutta güvenle saklanır, telefonunuzdan her an açılır.",
  "QR okutulur okutulmaz, o aracın tüm bakım geçmişi anında karşınıza gelir.",
  "Bakım zamanı yaklaşan müşteriler otomatik listelenir, tek tıkla hatırlatma gönderirsiniz.",
  "Aracın kayıtlı bakım geçmişine plakadan veya QR koddan yeniden ulaşabilirsiniz.",
];

const audiences = [
  {
    icon: CarIcon,
    title: "Yağ Değişim & Hızlı Bakım Noktaları",
    desc: "Her aracın bakımını birkaç adımda kaydedin, geçmişine daha sonra plakadan veya QR koddan kolayca ulaşın.",
  },
  {
    icon: UsersIcon,
    title: "Oto Servis & Özel Servisler",
    desc: "Birden fazla ustanız varsa hepsi aynı yerden çalışır; hangi aracın ne zaman, ne yapıldığını herkes tek yerden görür.",
  },
  {
    icon: CalendarIcon,
    title: "Periyodik Bakım Hizmeti Veren Otomotiv İşletmeleri",
    desc: "Bakım zamanı yaklaşan müşterileri tek yerde görün ve zamanı geldiğinde kolayca yeniden iletişime geçin.",
  },
];

const audienceChecklist = [
  "Müşterilerinizin araçlarına düzenli bakım yapıyorsanız",
  "Bakım zamanı geldiğinde müşteriyi hatırlayıp aramanız gerekiyorsa",
  "Araç geçmişini kağıtta, dağınık notlarda ya da hafızanızda tutuyorsanız",
  "Muhasebe ya da stok programına değil, sade bir araç/müşteri takibine ihtiyacınız varsa",
];

const steps = [
  {
    icon: CarIcon,
    title: "1. Aracı kaydedin",
    desc: "Plaka, marka, model bilgilerini birkaç saniyede sisteme girin.",
  },
  {
    icon: DocumentIcon,
    title: "2. Yapılan bakımı kaydedin",
    desc: "Hangi bakımı yaptığınızı, tarihini ve kilometreyi kaydedin; geçmiş otomatik oluşsun.",
  },
  {
    icon: BellIcon,
    title: "3. Bakım zamanını takip edin",
    desc: "Sonraki bakım tarihi veya kilometresi yaklaşan araçlar otomatik olarak listenize düşer.",
  },
  {
    icon: ChatIcon,
    title: "4. Müşterinizle yeniden iletişime geçin",
    desc: "Bakım zamanı geldiğinde müşterinize kolayca ulaşın ve randevusunu oluşturun.",
  },
];

const mainBenefits = [
  {
    icon: DocumentIcon,
    title: "Bakım geçmişi elinizin altında",
    desc: "Hangi araca ne zaman, nasıl bakım yaptığınızı aramadan, sormadan, saniyeler içinde görün.",
  },
  {
    icon: BellIcon,
    title: "Bakım zamanı gelen müşteriyi kaçırmayın",
    desc: "Yaklaşan ve geciken bakımları tek yerde görün; yeniden iletişime geçmeniz gereken müşterileri kolayca takip edin.",
  },
  {
    icon: ChatIcon,
    title: "Müşterinizle bağınızı devam ettirin",
    desc: "Bakım bittikten sonra müşterinizi takip etmeye devam edin; zamanı geldiğinde yeniden iletişime geçin ve randevusunu oluşturun.",
  },
];

// V2 sadeleştirme: eski 10'lu özellik gridinin geri kalanı burada, ana 3
// faydadan belirgin biçimde daha düşük görsel ağırlıkta (küçük, ikonsuz, tek
// satır) bir destek listesi olarak kalıyor. "Toplu araç aktarma" kasıtlı
// olarak burada, ikincil seviyede tutuluyor — ana satış mesajlarında öne
// çıkarılmıyor (Zeki onayı, 23 Ağustos 2026).
const secondaryFeatures = [
  "Randevu yönetimi",
  "WhatsApp ile iletişim",
  "Çoklu çalışan hesabı",
  "Sesli kayıt girişi",
  "PDF servis fişi",
  "Toplu araç aktarma",
];

// V2 sadeleştirme: eski 3 ayrı vitrin bloğu (Otomatik Hatırlatma / Çift Yönlü
// WhatsApp / Randevu Yönetimi) tek bir doğrusal hikâyeye birleştirildi. ÖNEMLİ:
// WhatsApp üzerinden "Evet/Hayır" ile TAMAMEN OTOMATİK randevu açma özelliği
// şu an dış bağımlılık (WhatsApp Business Platform onayı) beklediği için
// dormant — bu yüzden 3. adım kasıtlı olarak "WhatsApp üzerinden iletişime
// geçin" (manuel, bugün de canlı olan tek-tık WhatsApp gönderimi) diyor,
// "otomatik randevu açılır" demiyor (Zeki onayı, 23 Ağustos 2026).
const loopSteps = [
  {
    n: 1,
    title: "Bakım yapıldı",
    desc: "Aracın bakımını ve sonraki bakım tarihini/kilometresini kaydedin.",
  },
  {
    n: 2,
    title: "Bakım zamanı yaklaştı",
    desc: "Araç, Yaklaşan Bakımlar listenizde görünür.",
  },
  {
    n: 3,
    title: "Müşteriye ulaşın",
    desc: "Bakım zamanı gelen müşterinizle WhatsApp üzerinden iletişime geçin.",
  },
  {
    n: 4,
    title: "Randevu oluşturun",
    desc: "Müşteriniz gelmek istediğinde randevusunu OtoHafıza üzerinden takip edin.",
  },
  {
    n: 5,
    title: "Müşteri geldi",
    desc: "Randevuyu \"Geldi\" olarak işaretleyin ve doğrudan aracın bakım kaydına geçin.",
  },
  {
    n: 6,
    title: "Yeni bakımı kaydedin",
    desc: "Yeni bakım kaydı aracın geçmişine eklenir ve takip döngüsü devam eder.",
  },
];

const faqs = [
  {
    q: "Gerçekten ücretsiz mi?",
    a: "Evet. 15 araca kadar süresiz olarak ücretsiz kullanabilirsiniz, kredi kartı istemiyoruz.",
  },
  {
    q: "Ücretsiz planda ne var?",
    a: "Bakım kaydı, randevu yönetimi, WhatsApp ile iletişim, sesli kayıt girişi ve PDF servis fişi dahil tüm temel özellikler ücretsiz planda da bulunur; yalnızca araç ve çalışan sayısı sınırlıdır.",
  },
  {
    q: "Kullanması zor mu?",
    a: "Hayır. Aracı ve bakımı birkaç adımda kaydedersiniz, kurulum için teknik bilgiye ihtiyacınız yoktur.",
  },
  {
    q: "QR etiketi zorunlu mu?",
    a: "Hayır. Araç ve bakım kaydı QR etiketi olmadan da tutulur. Fiziksel QR etiketi isteğe bağlıdır, ayrıca sipariş edilir.",
  },
  {
    q: "Müşteri QR okutunca ne görür?",
    a: "Aracın plakasını, marka/modelini ve bakım geçmişini görür. Müşterinin adı ve telefonu bu ekranda gösterilmez.",
  },
  {
    q: "Eski araçlarımı ekleyebilir miyim?",
    a: "Evet. Araçlarınızı elle tek tek girebilir, ya da elinizdeki listeyi toplu olarak yükleyip hepsini tek seferde ekleyebilirsiniz.",
  },
  {
    q: "Ücretli plana geçmek zorunda mıyım?",
    a: "Hayır. Araç sayınız arttığında dilediğiniz an geçebilirsiniz; ücretsiz planda süre sınırı yoktur.",
  },
];

// SSS bölümündeki soru/cevapları Google'ın "sık sorulan sorular" zengin
// sonucunda (rich result) gösterebilmesi için FAQPage yapılandırılmış verisi.
// SoftwareApplication ise arama sonuçlarında fiyat/ücretsiz plan bilgisini
// göstermeye yardımcı olur. NOT: Bu committe SEO metadata (app/layout.tsx
// TITLE/DESCRIPTION/keywords) bilinçli olarak DOKUNULMADI — bu iki JSON-LD
// bloğu da o kapsamın dışında bırakıldı, mevcut haliyle korunuyor.
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OtoHafıza",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Araca yapıştırılan QR kod ile yağ bakım geçmişini otomatik kaydeden ve gösteren, oto tamirciler ve servisler için dijital bakım takip sistemi.",
  offers: [
    { "@type": "Offer", name: "Ücretsiz", price: "0", priceCurrency: "TRY" },
    { "@type": "Offer", name: "Pro", price: "499", priceCurrency: "TRY" },
    { "@type": "Offer", name: "İşletme", price: "999", priceCurrency: "TRY" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function HomePage() {
  // Kurucu Servis kontenjanı (bkz. lib/planAvailability.ts) — tek anahtarlı ucuz
  // sayaç okuması, listAllShops() TARAMAZ (ana sayfa herkese açık ve sık ziyaret
  // ediliyor).
  const foundingServiceCount = await getFoundingServiceCount();
  const foundingServiceRemaining = Math.max(0, FOUNDING_SERVICE_SLOTS - foundingServiceCount);

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Kurumsal "üst bar" deseni — ikincil kitle (saha partnerleri) için tek
          bir link, ana header'dan görsel olarak tamamen ayrı. Partner Girişi
          SADECE burada yer alıyor; hamburger menüsündeki tekrarı kaldırıldı
          (23 Ağustos 2026, Zeki geri bildirimi) — aynı linkin iki yerde
          görünmesi gereksiz tekrar yaratıyordu. */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-2.5 text-sm sm:px-6">
          <Link
            href="/partner-girisi"
            className="font-medium text-slate-300 transition hover:text-white"
          >
            Saha Partneri misiniz?{" "}
            <span className="font-semibold text-accent-400">Partner Girişi →</span>
          </Link>
        </div>
      </div>
      <header className="relative border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl">
            <Logo withText size="lg" />
          </Link>
          {/* V2 ana sayfa yeniden kurgusu: nav linkleri yeni bölüm sırasına
              göre değişti (Özellikler/Fiyatlandırma/İletişim/Blog -> Nasıl
              Çalışır/Kimler İçin/Fiyatlar/SSS). CTA çifti (Giriş Yap +
              Ücretsiz Başla) artık mobilde de her zaman görünür — önceden
              Giriş Yap mobilde hamburger içine gizleniyordu (23 Ağustos 2026,
              Zeki geri bildirimi). Renk hiyerarşisi bilinçli: Ücretsiz Başla
              turuncu/accent kalıyor çünkü sayfanın her yerinde (hero, Final
              CTA, fiyatlandırma kartları) TEK birincil eylem rengi bu — Giriş
              Yap turuncu olursa header'da iki "birincil" buton varmış gibi
              görünüp asıl dönüşüm hedefinin görsel ağırlığı bölünür. Bu yüzden
              Giriş Yap mavi/çerçeveli, ikincil ağırlıkta tutuluyor. */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:gap-4">
            <Link href="#nasil-calisir" className="hidden hover:text-brand-700 sm:inline">
              Nasıl Çalışır
            </Link>
            <Link href="#kimler-icin" className="hidden hover:text-brand-700 sm:inline">
              Kimler İçin
            </Link>
            <Link href="#fiyatlandirma" className="hidden hover:text-brand-700 sm:inline">
              Fiyatlar
            </Link>
            <Link href="#sss" className="hidden hover:text-brand-700 sm:inline">
              SSS
            </Link>
            <Link
              href="/giris"
              className="rounded-lg border border-brand-600 px-3 py-2 font-semibold text-brand-600 hover:bg-brand-50 sm:px-4"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-lg bg-accent-500 px-3 py-2 font-semibold text-white hover:bg-accent-600 sm:px-4"
            >
              Ücretsiz Başla
            </Link>
            <MobileNavMenu />
          </nav>
        </div>
      </header>

      {/* 1. HERO — V2 yeniden kurgu: eski eyebrow etiketi, 5 maddelik hero
          özellik listesi ve 3 yüzen cam kartlı telefon mockup'ı kaldırıldı
          (dekoratif yoğunluğu azaltma ilkesi). Gerçek ürün gösterimi bir
          alttaki "Nasıl Çalışır" bölümünde demo GIF ile güçlü biçimde
          yapılıyor — hero artık tek sütun, sade, tek mesaja odaklı. */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <img
          src="https://images.unsplash.com/photo-1527383418406-f85a3b146499?auto=format&fit=crop&w=1600&q=75"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Metnin okunabilirliği için tek, yönlü bir karartma — eski sürümdeki
            ekstra bulanık renkli lekeler ve nokta dokusu kaldırıldı. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/70"
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Bakım zamanı gelen müşterinizi kaybetmeyin.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-200">
            Araçlarınızı ve yaptığınız bakımları kaydedin. Bakım zamanı yaklaşan müşterileri
            görün, onlara tek tıkla ulaşıp yeniden servise çağırın.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/kayit"
              className="rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-accent-500/40 hover:bg-accent-600 active:scale-[0.98]"
            >
              Ücretsiz Başla
            </Link>
            <Link
              href="#nasil-calisir"
              className="rounded-lg border border-accent-400/40 bg-accent-500/10 px-6 py-3 text-lg font-semibold text-white hover:bg-accent-500/20 active:scale-[0.98]"
            >
              Nasıl Çalışır?
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-300">
            15 araca kadar ücretsiz · Süre sınırı yok · Kredi kartı gerekmez
          </p>
        </div>
      </section>

      {/* 2. SORUN/ÇÖZÜM */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Müşteri gittiğinde bakım bilgisi de gitmesin.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
            Kağıt deftere güveniyorsanız, aşağıdakiler tanıdık gelecektir.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
              <h3 className="font-semibold text-slate-900">Elle Defter Tutmak</h3>
              <ul className="mt-4 space-y-3">
                {sorunPainPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
              <h3 className="font-semibold text-brand-800">OtoHafıza</h3>
              <ul className="mt-4 space-y-3">
                {cozumSolutions.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KİMLER İÇİN? */}
      <section id="kimler-icin" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Bu sistem sizin işletmeniz için mi?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <a.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{a.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{a.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-900">OtoHafıza sizin için mi?</h3>
            <ul className="mt-4 space-y-2.5">
              {audienceChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-500">
            OtoHafıza bir muhasebe, stok veya ağır servis yönetim programı değildir.
            Araçlarınızı, yapılan bakımları ve yeniden ulaşmanız gereken müşterileri sade bir
            şekilde takip etmek için geliştirilmiştir.
          </p>
        </div>
      </section>

      {/* 4. NASIL ÇALIŞIR? */}
      <section id="nasil-calisir" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Nasıl çalışır?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Dört basit adımla araçlarınızı, bakımları ve yeniden ulaşmanız gereken müşterileri
          takip edin.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.title}
              className="hover-lift rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-200 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-brand-700">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Döngü özeti — adımların birbirini nasıl takip ettiğini tek satırda gösterir. */}
        <p className="mt-6 text-center text-sm font-medium text-slate-400">
          Araç → Bakım → Takip → Randevu → Yeni Bakım
        </p>

        {/* Gerçek panelden çekilmiş ekran kaydı — "bu gerçekten nasıl
            çalışıyor" sorusunu metinle anlatmak yerine göstererek yanıtlıyor.
            V2 yeniden kurgu: bu GIF artık sayfanın çok daha üst sırasında
            (4. bölüm, önceden 7. bölümdeydi) ve hero'daki dekoratif
            kompozisyonun kaldırılmasıyla sayfadaki en güçlü "gerçek ürün"
            gösterimi haline geldi. */}
        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-slate-400">panel.otohafiza.com</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/otohafiza-demo-v2.gif"
            alt="OtoHafıza panelinde bir aracın bakım geçmişini görüntüleme ve QR etiket oluşturma ekran kaydı"
            className="w-full"
            width={1512}
            height={801}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* QR notu — V2 yeniden kurgu: QR artık ana sistemin zorunlu bir
            adımı olarak GÖSTERİLMİYOR (eski "2. QR etiketini yazdırın / 3.
            Araca yapıştırın" adımları kaldırıldı). Kayıt ve bakım takibi QR
            etiketi olmadan da çalışır; fiziksel etiket isteğe bağlı, ayrı bir
            üründür (bkz. Fiyatlandırma bölümü). */}
        <div className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2.5 rounded-xl bg-brand-50/60 px-5 py-3 text-center sm:text-left">
          <QrIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-slate-700">
            Fiziksel QR etiketi isteğe bağlıdır ve ayrıca sipariş edilebilir.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/kayit"
            className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </section>

      {/* 5. OTOHAFIZA NE KAZANDIRIR? — V2 yeniden kurgu: eski 10 kartlı
          "Neler sunuyoruz?" gridinin yerini 3 ana fayda aldı. Kalan
          özellikler aşağıda küçük, ikonsuz bir destek satırında, belirgin
          biçimde daha düşük görsel ağırlıkta duruyor. */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            OtoHafıza size ne kazandırır?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {mainBenefits.map((b) => (
              <div
                key={b.title}
                className="hover-lift rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            {secondaryFeatures.map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 text-slate-400" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MÜŞTERİ GERİ DÖNÜŞ DÖNGÜSÜ — V2 yeniden kurgu: eski 3 ayrı vitrin
          bloğu (Otomatik Hatırlatma / Çift Yönlü WhatsApp / Randevu Yönetimi)
          tek bir doğrusal hikâyede birleşti. Sağdaki mockup kartları
          (Yaklaşan Bakımlar, Bugünkü Randevular) gerçek panel arayüzüne sadık,
          BUGÜN CANLI olan davranışları gösteriyor — "Evet/Hayır" otomatik
          randevu butonlu eski mockup BİLİNÇLİ olarak kullanılmadı (bkz. yukarı
          loopSteps yorumu). */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <ChatIcon className="h-4 w-4" />
              Müşteri Geri Dönüşü
            </span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Her bakım, bir sonraki müşteri ziyaretinin başlangıcı olsun.
            </h2>
            <p className="mt-3 text-slate-600">
              Bir aracın bakımını kaydettiğinizde takip bitmez. OtoHafıza sonraki bakım
              zamanını takip etmenize, müşterinize yeniden ulaşmanıza ve oluşan randevuyu
              yönetmenize yardımcı olur.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
            <ol className="relative space-y-8 border-l-2 border-brand-100 pl-8">
              {loopSteps.map((s) => (
                <li key={s.n} className="relative">
                  <span className="absolute -left-[calc(2rem+1px)] flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {s.n}
                  </span>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
                </li>
              ))}
            </ol>

            <div className="space-y-5">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Yaklaşan Bakımlar
                </p>
                <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-amber-50/60 p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      184 gün kaldı
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      200 km kaldı
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">34 KB 9999</p>
                  <p className="text-xs text-slate-500">Toyota Corolla · önerilen: 95.000 km</p>
                </div>
                <button className="mt-4 w-full rounded-lg border border-green-300 bg-green-50 py-2 text-sm font-medium text-green-700">
                  WhatsApp&apos;tan Hatırlat
                </button>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bugünkü Randevular
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border-l-4 border-brand-400 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">10:30 · 06 XY 42</p>
                      <p className="text-xs text-slate-500">Ahmet Yılmaz</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Bekleniyor
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border-l-4 border-slate-200 bg-slate-50 px-3 py-2 opacity-70">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">14:00 · 34 ABC 123</p>
                      <p className="text-xs text-slate-500">Volkswagen Passat</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      Geldi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FİYATLANDIRMA */}
      <section id="fiyatlandirma" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold">Fiyatlandırma</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-300">
            Önce kullanın, ihtiyacınız arttığında planınızı büyütün.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400">
            Her planda aynı özellikler yer alır — bakım kaydı, randevu yönetimi, WhatsApp ile
            iletişim, sesli kayıt girişi ve PDF servis fişi hepsinde vardır. Planlar yalnızca
            araç ve çalışan sayısı limitinde farklılaşır.
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {[
              "Bakım kaydı ve geçmişi",
              "Randevu yönetimi",
              "WhatsApp ile iletişim",
              "Sesli kayıt girişi",
              "PDF servis fişi",
              "Toplu araç aktarma",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-accent-400" />
                {t}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-slate-400">
            Fiziksel QR etiketleri üyelik planından ayrı ücretlendirilir ve ihtiyaç oldukça
            sipariş edilir.
          </p>
          {/* V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): bu banner'ın
              koşullu yapısı (!PAID_PLANS_ENABLED) DEĞİŞMEDİ — yalnızca
              içindeki metin, ödeme tarafında fiilen uygulanmayan bir "ömür
              boyu %İNDİRİM" vaadi içermeyecek şekilde yeniden yazıldı. Kurucu
              Servis kontenjanı (yer kaldı/doldu bilgisi) somut ve doğru
              kaldığı için korundu, yalnızca indirim vaadi kaldırıldı. */}
          {!PAID_PLANS_ENABLED && (
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-accent-400/30 bg-white/5 px-5 py-4 text-center">
              {foundingServiceRemaining > 0 ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-accent-400">
                    🚀 Kurucu Servis Kontenjanı — {foundingServiceRemaining} yer kaldı
                  </p>
                  <p className="mt-1.5 text-sm text-slate-200">
                    Ücretli planlar henüz herkese açık değil — şimdi ücretsiz başlayan ilk{" "}
                    {FOUNDING_SERVICE_SLOTS} servisten biri olun, planlar açıldığında haberdar
                    olan ilk siz olun.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-100">
                  Kurucu Servis kontenjanımız doldu — ücretli planlar (Pro, İşletme) çok
                  yakında herkese açılacak.
                </p>
              )}
            </div>
          )}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>).map((key) => {
              const plan = PLAN_LIMITS[key];
              const isPopular = key === "pro";
              const isCampaign = Boolean(plan.badge);
              const isLocked = key !== "free" && !PAID_PLANS_ENABLED;
              return (
                <div
                  key={key}
                  className={`relative rounded-2xl p-6 ${
                    isCampaign
                      ? "bg-gradient-to-br from-accent-500 to-accent-600 ring-4 ring-white/40 shadow-xl shadow-accent-500/30"
                      : isPopular
                        ? "bg-brand-600 ring-4 ring-accent-500"
                        : "bg-slate-800"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      En Popüler
                    </span>
                  )}
                  {isCampaign && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-600 shadow">
                      🎉 Kampanya: {plan.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{plan.label}</h3>
                  <p className="mt-2">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm font-medium ${isCampaign ? "text-white/80" : "text-slate-300"}`}>
                      {plan.period}
                    </span>
                  </p>
                  <ul className={`mt-4 space-y-2 text-sm ${isCampaign ? "text-white/90" : "text-slate-200"}`}>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-accent-400" />
                      {plan.maxVehicles === Infinity
                        ? "Sınırsız araç kaydı"
                        : `${plan.maxVehicles} araca kadar kayıt`}
                    </li>
                    <li className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 shrink-0 text-accent-400" />
                      {plan.maxStaff === Infinity
                        ? "Sınırsız çalışan hesabı"
                        : plan.maxStaff === 1
                          ? "Tek kullanıcı (siz)"
                          : `${plan.maxStaff} çalışan hesabına kadar`}
                    </li>
                  </ul>
                  {isLocked ? (
                    foundingServiceRemaining > 0 ? (
                      <div className="mt-6">
                        <Link
                          href="/kayit"
                          className="block rounded-lg bg-accent-500 py-2 text-center font-semibold text-white hover:bg-accent-600"
                        >
                          Kurucu Servis Ol
                        </Link>
                        <p className="mt-2 text-center text-xs text-white/60">
                          Ücretsiz başlayın, ücretli planlar açıldığında ilk haberdar
                          olanlardan olun
                        </p>
                      </div>
                    ) : (
                      <span className="mt-6 block cursor-not-allowed rounded-lg bg-white/10 py-2 text-center font-semibold text-white/60">
                        Yakında
                      </span>
                    )
                  ) : (
                    <Link
                      href="/kayit"
                      className={`mt-6 block rounded-lg py-2 text-center font-semibold ${
                        isPopular
                          ? "bg-white text-brand-700 hover:bg-slate-100"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      Bu planla başla
                    </Link>
                  )}
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

      {/* 8. SSS */}
      <section id="sss" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Sık Sorulan Sorular</h2>
        <FaqAccordion items={faqs} />
      </section>

      {/* FINAL CTA */}
      <section className="bg-brand-700 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            İlk aracınızı bugün OtoHafıza&apos;ya kaydedin.
          </h2>
          <Link
            href="/kayit"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-brand-700 hover:bg-slate-100 active:scale-[0.98]"
          >
            Ücretsiz Başla
          </Link>
          <p className="mt-3 text-brand-100">
            15 araç ücretsiz · Süre sınırı yok · Kredi kartı gerekmez
          </p>
        </div>
      </section>

      {/* FOOTER — V2 yeniden kurgu: büyük İletişim bölümü (id="iletisim")
          kaldırıldı; e-posta/WhatsApp/sosyal bağlantılar küçük bir satır
          olarak buraya taşındı. WhatsApp için ayrıca sağ altta her sayfada
          duran WhatsAppFloatButton (bkz. app/layout.tsx) zaten her zaman
          erişilebilir olduğundan iletişim erişimi kesilmiyor. */}
      <footer className="border-t bg-white px-4 pb-20 pt-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} OtoHafıza — Aracının dijital hafızası.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <a
            href="mailto:hello@otohafiza.com"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-brand-700"
          >
            <MailIcon className="h-4 w-4 shrink-0 text-brand-600" />
            hello@otohafiza.com
          </a>
          <a
            href={buildBusinessWhatsAppLink("Merhaba, OtoHafıza hakkında bilgi almak istiyorum.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-brand-700"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-green-600" />
            WhatsApp&apos;tan Yazın
          </a>
          <a
            href="https://www.instagram.com/hafizaoto"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OtoHafıza Instagram"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-brand-600 ring-1 ring-slate-100 transition hover:bg-accent-500 hover:text-white"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61593171520080"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OtoHafıza Facebook"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-brand-600 ring-1 ring-slate-100 transition hover:bg-accent-500 hover:text-white"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link href="/blog" className="underline">
            Blog
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/hakkimizda" className="underline">
            Hakkımızda
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/referans" className="underline">
            Referans Programı
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kvkk" className="underline">
            KVKK Aydınlatma Metni
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/gizlilik-sozlesmesi" className="underline">
            Gizlilik Sözleşmesi
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/saas-sozlesmesi" className="underline">
            SaaS Kullanım ve Lisans Sözleşmesi
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/mesafeli-satis-sozlesmesi" className="underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/iade-politikasi" className="underline">
            İade Politikası
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/abonelik-politikasi" className="underline">
            Abonelik Politikası
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kullanim-sartlari" className="underline">
            Kullanım Şartları
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/cerez-politikasi" className="underline">
            Çerez Politikası
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kabul-edilebilir-kullanim-politikasi" className="underline">
            Kabul Edilebilir Kullanım Politikası
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/saha-partner-sozlesmesi" className="underline">
            Saha Partner Sözleşmesi
          </Link>
        </div>
        <div className="mt-4 flex justify-center">
          <PaymentBadges />
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-xs text-slate-400">
          OtoHafıza;{" "}
          <a
            href="https://www.sarperdijital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-500"
          >
            Sarper Dijital
          </a>
          , SARPER DİJİTAL TEKNOLOJİLER VE KİRALAMA A.Ş tarafından tasarlanmış ve
          yönetilmektedir. Patent ve Tasarım hakları saklıdır.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-400">
          Siz de işletmeniz için böyle bir dijital çözüm mü istiyorsunuz?{" "}
          <a
            href="https://www.sarperdijital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline hover:text-brand-700"
          >
            www.sarperdijital.com
          </a>{" "}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </footer>
    </main>
  );
}
