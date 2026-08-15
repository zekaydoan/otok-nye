import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/types";
import { listBlogPosts } from "@/lib/blogPosts";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import FaqAccordion from "@/components/FaqAccordion";
import {
  BellIcon,
  BrandMark,
  CalendarIcon,
  CameraIcon,
  CarIcon,
  ChartBarIcon,
  ChatIcon,
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  LightbulbIcon,
  MailIcon,
  MicIcon,
  QrIcon,
  StickerIcon,
  UploadIcon,
  UsersIcon,
  XCircleIcon,
} from "@/components/icons";

// Hero'daki koyu temalı "reklam görseli" hissindeki sol sütun özellik listesi
// — kullanıcının referans gösterdiği görseldeki gibi ikon + kısa başlık +
// tek satır açıklama düzeni. features/tickerItems'tan bağımsız, bilinçli
// olarak burada en "somut ve satış odaklı" 5 madde seçildi.
const heroFeatures = [
  { icon: QrIcon, title: "QR ile hızlı kayıt", desc: "Aracı saniyeler içinde sisteme ekleyin." },
  { icon: BellIcon, title: "Otomatik hatırlatma", desc: "Bakım zamanı gelmeden müşterinizi uyarın." },
  { icon: ChatIcon, title: "WhatsApp ile bilgilendirme", desc: "Tek tıkla müşterinize ulaşın." },
  { icon: DocumentIcon, title: "Dijital servis fişi", desc: "Tüm işlemler kayıt altında, kaybolmaz." },
  { icon: UsersIcon, title: "Çoklu çalışan desteği", desc: "Ekibinizle birlikte yönetin." },
];

// Header'ın hemen altındaki "Öne Çıkanlar" bandında sırayla beliren kısa
// özellik tanıtımları — ticker tek satıra sığması için bilinçli olarak kısa
// ve öz tutulur, uzun cümleler kesilip yarım okunmasın diye.
const tickerItems = [
  { icon: BellIcon, text: "Otomatik bakım hatırlatma" },
  { icon: CheckCircleIcon, text: "WhatsApp'tan Evet/Hayır ile randevu" },
  { icon: CalendarIcon, text: "Randevu yönetimi" },
  { icon: MicIcon, text: "Sesle kayıt girişi" },
  { icon: UsersIcon, text: "Çoklu çalışan hesabı" },
  { icon: QrIcon, text: "Reklamlı QR etiket" },
];

const steps = [
  {
    icon: CarIcon,
    title: "1. Aracı kaydedin",
    desc: "Plaka, marka, model ve ilk yağ bakım bilgilerini panelden girin.",
  },
  {
    icon: QrIcon,
    title: "2. QR etiketini yazdırın",
    desc: "Sistem otomatik olarak o araca özel QR kod ve firma bilgili etiket üretir.",
  },
  {
    icon: StickerIcon,
    title: "3. Araca yapıştırın",
    desc: "Etiketi motor kaputu, yağ dolum kapağı gibi görünür bir yere yapıştırın.",
  },
  {
    icon: CameraIcon,
    title: "4. Her bakımda okutun",
    desc: "Sonraki bakımlarda QR okutulur, geçmiş görülür, yeni kayıt saniyeler içinde eklenir.",
  },
];

const features = [
  {
    icon: CheckCircleIcon,
    title: "Otomatik bakım geçmişi",
    desc: "Yağ değişim tarihi, saati, markası/modeli ve kaç kg konulduğu her kayıtta otomatik saklanır — elle defter tutmaya son.",
  },
  {
    icon: QrIcon,
    title: "Reklam alanlı, dayanıklı QR etiket",
    desc: "Motor bölmesi sıcaklığına, yağa ve neme dayanıklı, su geçirmez QR etiketinde firmanızın adı ve telefonu da yer alır.",
  },
  {
    icon: BellIcon,
    title: "Otomatik bakım hatırlatma",
    desc: "Sonraki bakım tarihi veya kilometresi yaklaşan araçlar panelde otomatik listelenir, tek tıkla WhatsApp hatırlatması gönderilir.",
  },
  {
    icon: CalendarIcon,
    title: "Randevu ve günlük iş listesi",
    desc: "Günlük randevularınızı planlayın, müşteriye WhatsApp'tan hatırlatma gönderin, işi geldi/iptal olarak tek tıkla işaretleyin.",
  },
  {
    icon: CheckCircleIcon,
    title: "WhatsApp'tan Evet/Hayır ile otomatik randevu",
    desc: "Hatırlatma mesajındaki butona müşteri \"Evet\" derse panelinizde randevu kendiliğinden açılır, bir bildirim rozetiyle sizi uyarır — telefonu açmanıza bile gerek kalmaz.",
  },
  {
    icon: UploadIcon,
    title: "Toplu araç içe aktarma",
    desc: "Elinizdeki müşteri listesini CSV olarak yükleyin, yüzlerce aracı tek seferde sisteme aktarın.",
  },
  {
    icon: UsersIcon,
    title: "Çoklu çalışan hesabı",
    desc: "Ekibinizdeki her ustaya kendi giriş bilgisiyle panel erişimi tanımlayın, kim ne zaman kayıt girmiş görün.",
  },
  {
    icon: MicIcon,
    title: "Sesli kayıt girişi",
    desc: "Elleriniz yağlıyken bile mikrofon düğmesine basıp konuşarak yağ markasını, miktarını ve kilometreyi forma aktarın.",
  },
  {
    icon: DocumentIcon,
    title: "PDF servis fişi ve satış raporu",
    desc: "Her bakım için profesyonel bir PDF fiş otomatik oluşur; araç satılırken düzenli bakım geçmişini gösteren bir rapor paylaşabilirsiniz.",
  },
  {
    icon: LightbulbIcon,
    title: "Sizinle birlikte gelişiyoruz",
    desc: "Panelden doğrudan bize öneri gönderin — OtoHafıza'yı kullanan ustaların fikirleriyle sürekli geliştiriyoruz.",
  },
];

const painPoints = [
  "Defter kaybolur, yıpranır, her zaman yanınızda taşımanız gerekir.",
  "Bir müşterinin geçmişini bulmak dakikalar alır, bazen imkansızdır.",
  "Bakım zamanı geldiğinde müşteriyi aramayı unutur, işi kaçırırsınız.",
  "Araç başka bir servise giderse geçmiş bilgisi tamamen kaybolur.",
];

const solutions = [
  "Bilgiler bulutta güvenle saklanır; telefon ya da bilgisayardan her an erişilir.",
  "QR okutulur okutulmaz tüm bakım geçmişi saniyeler içinde ekrana gelir.",
  "Bakım zamanı yaklaşan araçlar otomatik listelenir, hatırlatma tek tıkla gönderilir.",
  "Araç başka bir yetkili servise gitse bile geçmiş korunur, yeni servis de kayıt ekleyebilir.",
];

const audiences = [
  {
    title: "Tek ustalı yağcı / oto tamirci",
    desc: "Kağıt defter yerine telefonunuzdan tek dokunuşla kayıt girin, hiçbir müşteriyi hatırlatmayı unutmayın.",
  },
  {
    title: "Birden çok ustası olan servis",
    desc: "Ekibinizdeki her usta kendi hesabıyla giriş yapar, tüm araç geçmişi tek ve ortak bir panelde birleşir.",
  },
  {
    title: "Oto galeri / ikinci el satış",
    desc: "Satışa çıkardığınız aracın düzenli bakım geçmişini tek bağlantıyla müşteriye gösterin, güven kazanın.",
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
    q: "Bakım hatırlatmaları nasıl çalışır?",
    a: "Bir aracın sonraki bakım tarihi veya kilometresi yaklaştığında panelinizdeki 'Yaklaşan Bakımlar' listesine otomatik düşer; oradan tek tıkla müşteriye WhatsApp hatırlatması gönderebilirsiniz.",
  },
  {
    q: "Ekibimdeki diğer ustalar da panele girebilir mi?",
    a: "Evet. Hesap sahibi olarak ekibinizdeki her ustaya kendi e-posta/şifresiyle giriş yapabileceği bir çalışan hesabı tanımlayabilirsiniz; plan/faturalama gibi hassas ayarlar yalnızca sizde kalır.",
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

// SSS bölümündeki soru/cevapları Google'ın "sık sorulan sorular" zengin
// sonucunda (rich result) gösterebilmesi için FAQPage yapılandırılmış verisi.
// SoftwareApplication ise arama sonuçlarında fiyat/ücretsiz plan bilgisini
// göstermeye yardımcı olur — her ikisi de yalnızca ana sayfada (bu içeriğin
// asıl bulunduğu yerde) render edilir, tekrarlanan sayfalarda değil.
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

export default function HomePage() {
  const latestPosts = listBlogPosts().slice(0, 3);

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
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl">
            <Logo withText />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:gap-4">
            <Link href="#ozellikler" className="hidden hover:text-brand-700 sm:inline">
              Özellikler
            </Link>
            <Link href="#fiyatlandirma" className="hidden hover:text-brand-700 sm:inline">
              Fiyatlandırma
            </Link>
            <Link href="#iletisim" className="hidden hover:text-brand-700 sm:inline">
              İletişim
            </Link>
            <Link href="/blog" className="hidden hover:text-brand-700 sm:inline">
              Blog
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

      {/* Öne Çıkanlar bandı — header'ın hemen altında, koyu zemin ve beyaz
          yazıyla yüksek kontrastlı, JavaScript kullanmadan saf CSS ile
          birkaç özelliği sırayla tanıtan hareketli bir bant. Sayfanın en
          görünür noktasında olduğu için ilk bakışta fark ediliyor. */}
      <div className="bg-brand-700 py-2.5 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 px-4 text-sm sm:flex-row sm:justify-start sm:gap-2 sm:px-6">
          <span className="shrink-0 font-semibold text-brand-100">Öne Çıkanlar:</span>
          <div className="relative h-5 w-full max-w-sm overflow-hidden sm:max-w-md">
            {tickerItems.map((item, i) => (
              <div
                key={item.text}
                className="animate-ticker absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap font-medium text-white sm:justify-start"
                style={{ animationDelay: `${-i * (10 / tickerItems.length)}s` }}
              >
                <item.icon className="h-4 w-4 shrink-0 text-accent-400" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kullanıcının gösterdiği reklam görseline (koyu zemin, parlayan QR,
          telefon ekran görüntüsü, tarama ışını, bildirim balonu, sol tarafta
          özellik listesi) olabildiğince yakın, tamamen kod/CSS ile üretilmiş bir
          "reklam afişi" hissi — gerçek bir fotoğraf değil (bu ortamda görsel
          üretimi yok), ama aynı kompozisyonu ve enerjiyi hedefliyor. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 py-14 sm:py-20 lg:py-28">
        {/* Derinlik için bulanık renkli lekeler + motor bölmesini çağrıştıran
            çok soluk bir araba silueti (fotoğraf değil, saf CSS/SVG doku). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-accent-500/15 blur-3xl"
        />
        <CarIcon
          aria-hidden
          className="pointer-events-none absolute -right-8 bottom-0 hidden h-64 w-64 text-white/[0.04] lg:block"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up text-center lg:text-left">
            <span className="inline-block rounded-full bg-accent-500/15 px-4 py-1 text-sm font-semibold text-accent-400">
              Aracının dijital hafızası
            </span>
            <h1 className="mx-auto mt-6 max-w-xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:mx-0">
              Araca yapıştırın, her bakımda okutun,{" "}
              <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
                geçmiş kendiliğinden biriksin.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300 lg:mx-0">
              Her araca özel bir QR kod üretin. Müşteri veya siz QR&apos;ı okuttuğunuzda
              plaka, marka, model ve yağ bakım geçmişi otomatik olarak ekranda belirir —
              elle defter tutmaya gerek kalmaz, bakım zamanı gelince müşteriye kendiliğinden
              hatırlatma gider.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/kayit"
                className="rounded-lg bg-white px-6 py-3 text-lg font-semibold text-brand-800 shadow-lg shadow-black/20 hover:bg-slate-100 active:scale-[0.98]"
              >
                Ücretsiz Hesap Aç
              </Link>
              <Link
                href="#ozellikler"
                className="rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 active:scale-[0.98]"
              >
                Özellikleri İncele
              </Link>
            </div>

            {/* Referans görseldeki sol sütun özellik listesi — ikon rozeti + kısa
                başlık + tek satır açıklama, koyu zemin üzerinde parlayan
                rozetlerle. */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {heroFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ taraf: parlayan bir QR etiketinden telefona uzanan bir tarama
              ışını ve gerçek uygulama arayüzüne benzeyen bir telefon mockup'ı —
              referans görseldeki ana sahneyi somutlaştırıyor. */}
          <div className="relative flex justify-center py-6 lg:justify-self-center lg:py-0">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              {/* Parlayan QR etiketi — telefonun arkasında, sol üstte */}
              <div className="absolute -left-2 top-6 z-0 sm:left-2 sm:top-10">
                <div className="relative">
                  <div className="absolute inset-0 -m-6 animate-pulse rounded-full bg-accent-400/40 blur-2xl" />
                  <div className="relative rotate-[-8deg] rounded-xl border-2 border-white/80 bg-white p-2.5 shadow-2xl shadow-accent-500/30 sm:p-3">
                    <div className="grid grid-cols-5 gap-[3px]">
                      {[
                        1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1,
                        1,
                      ].map((v, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 sm:h-2 sm:w-2 ${v ? "bg-slate-900" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarama ışını — QR'dan telefona uzanan, hafif titreşen degrade çizgi */}
              <div
                aria-hidden
                className="absolute left-16 top-16 z-10 h-1 w-24 origin-left rotate-[20deg] animate-pulse rounded-full bg-gradient-to-r from-accent-400 via-accent-400/70 to-transparent blur-[1px] sm:left-24 sm:top-24 sm:w-32"
              />

              {/* Telefon — gerçek uygulama arayüzüne benzeyen ekran içeriğiyle */}
              <div className="relative z-20 ml-10 rotate-3 rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-2 shadow-2xl transition-transform hover:rotate-0 sm:ml-16">
                <div className="overflow-hidden rounded-[1.4rem] bg-white">
                  <div className="flex items-center gap-1.5 bg-brand-700 px-4 py-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
                      <BrandMark className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white">
                      OtoHafıza
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Araç
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">34 ABC 123</p>
                    <p className="text-xs text-slate-500">Volkswagen Passat · 2019</p>

                    <div className="mt-3 rounded-lg bg-brand-50 p-2.5">
                      <p className="text-[10px] font-semibold text-brand-700">Son Bakım</p>
                      <p className="mt-0.5 text-xs text-slate-700">
                        12.08.2026 · Castrol Edge 5W-30 · <strong>4,5 kg</strong>
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-green-700">
                        <CheckIcon className="h-3 w-3" />
                        Düzenli Bakımlı
                      </div>
                    </div>

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Bakım Geçmişi
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {[
                        { d: "12.08.2026", t: "Yağ Bakımı" },
                        { d: "15.03.2026", t: "Hava Filtresi Değişimi" },
                      ].map((r) => (
                        <div key={r.t} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                          <CalendarIcon className="h-3 w-3 shrink-0 text-brand-500" />
                          <span className="font-medium text-slate-800">{r.d}</span>
                          <span className="truncate text-slate-500">· {r.t}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 rounded-lg bg-brand-600 py-1.5 text-center text-[10px] font-semibold text-white">
                      Tüm geçmişi görüntüle
                    </div>
                  </div>
                </div>
              </div>

              {/* Bildirim balonu — referans görseldeki sağ üst rozetle aynı fikir */}
              <div className="animate-float-badge absolute -right-1 -top-2 z-30 flex w-32 -rotate-3 flex-col items-center gap-1 rounded-2xl border border-accent-400/40 bg-slate-900/90 p-3 text-center shadow-2xl shadow-accent-500/20 backdrop-blur sm:-right-4 sm:top-0 sm:w-36">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/40">
                  <BellIcon className="h-4 w-4" />
                </span>
                <p className="text-[10px] font-semibold leading-snug text-white">
                  Bakım zamanı gelmeden hatırlatır, işinizi kolaylaştırır!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elle defter tutmanın sıkıntılarını somutlaştırıp OtoHafıza'nın çözümüyle
          yan yana gösteren karşılaştırma — ürünün "neden" gerekli olduğunu satın
          alma kararından önce netleştirir. */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Kağıt defter mi, OtoHafıza mi?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
            Kağıt defterle bugüne kadar idare ettiyseniz, aşağıdakiler tanıdık gelecek.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
              <h3 className="font-semibold text-slate-900">Elle Defter Tutmak</h3>
              <ul className="mt-4 space-y-3">
                {painPoints.map((p) => (
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
                {solutions.map((s) => (
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

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">Nasıl çalışır?</h2>
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
        </div>
      </section>

      <section id="ozellikler" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Neler sunuyoruz?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Tek bir panelden aracın tüm geçmişini, günlük iş listenizi ve ekibinizi yönetin.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="hover-lift rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Öne çıkan özellikleri gerçek panel arayüzüne sadık, sadeleştirilmiş
          mockup kartlarla görselleştiriyoruz — soyut bir liste yerine ürünü
          somut olarak gösterip satın alma kararını kolaylaştırır. */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl space-y-16 px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <BellIcon className="h-4 w-4" />
                Otomatik Hatırlatma
              </span>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Bakım zamanı gelen araçları siz aramadan panel size hatırlatsın.
              </h3>
              <p className="mt-3 text-slate-600">
                Bir araca son bakım girildiğinde sonraki bakım tarihi ve kilometresi otomatik
                hesaplanır. O tarih veya km yaklaştığında araç panelinizdeki "Yaklaşan Bakımlar"
                listesine düşer — tek tıkla müşteriye WhatsApp'tan hatırlatma gönderirsiniz.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
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
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <CheckCircleIcon className="h-4 w-4" />
                Çift Yönlü WhatsApp
              </span>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Müşteri WhatsApp'tan cevap versin, randevu kendiliğinden açılsın.
              </h3>
              <p className="mt-3 text-slate-600">
                Hatırlatma mesajına "Evet, randevu oluşturalım" ve "Hayır, şimdilik değil"
                butonları eklenir. Müşteri "Evet" derse panelinizde otomatik bir randevu kaydı
                açılır ve Randevular ikonunda bir bildirim rozeti belirir — siz telefonu açıp
                aramadan, müşteri bekletmeden randevu kendi kendine oluşur.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  WhatsApp Hatırlatması
                </p>
                <div className="mt-3 rounded-2xl rounded-tl-none bg-green-50 p-3 text-sm text-slate-700 ring-1 ring-green-100">
                  <p>
                    Merhaba Ahmet, Yılmaz Oto Servis bakım takibi hatırlatması:{" "}
                    <strong>34 ABC 123</strong> plakalı aracınızın bakım zamanı geldi.
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <span className="rounded-lg border border-green-300 bg-white py-1.5 text-center text-xs font-semibold text-green-700">
                      Evet, randevu oluşturalım
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-xs font-medium text-slate-500">
                      Hayır, şimdilik değil
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-brand-600" />
                  <p className="text-xs font-medium text-brand-700">
                    Panelinize düştü: "34 ABC 123 bakıma gelecek"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 flex justify-center lg:order-1">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
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
            <div className="order-1 text-center lg:order-2 lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <CalendarIcon className="h-4 w-4" />
                Randevu Yönetimi
              </span>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Günlük iş listenizi kağıda değil panele yazın.
              </h3>
              <p className="mt-3 text-slate-600">
                Gelecek müşterileri saatiyle, plakasıyla ve notuyla kaydedin. Randevu geldiğinde
                tek tıkla "Geldi" olarak işaretleyin, gelmediyse iptal edin — gün sonunda kimin
                geldiğini, kimin gelmediğini net görün.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">Kimler kullanıyor?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <ChartBarIcon className="h-5 w-5 text-brand-600" />
                <h3 className="mt-3 font-semibold text-slate-900">{a.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Sık Sorulan Sorular</h2>
        <FaqAccordion items={faqs} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Blog&apos;dan Öne Çıkanlar</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          Araç bakımı ve oto servis işletmeciliği üzerine rehberler.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {post.category}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{post.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{post.excerpt}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:underline">
            Tüm yazıları görüntüle →
          </Link>
        </div>
      </section>

      <section id="fiyatlandirma" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold">Fiyatlandırma</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-300">
            İşletme büyüklüğünüze göre plan seçin, istediğiniz zaman yükseltin. Aşağıdaki
            özelliklerin tamamı her planda dahildir — planlar yalnızca araç ve çalışan
            sayısı limitinde farklılaşır.
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {[
              "QR etiket + reklam alanı",
              "Otomatik WhatsApp hatırlatma",
              "Randevu yönetimi",
              "Toplu içe aktarma",
              "Sesli kayıt girişi",
              "PDF servis fişi",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-accent-400" />
                {t}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>).map((key) => {
              const plan = PLAN_LIMITS[key];
              const isPopular = key === "pro";
              const isCampaign = Boolean(plan.badge);
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

      <section className="bg-brand-700 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Hâlâ elle mi defter tutuyorsunuz?</h2>
          <p className="mt-3 text-brand-100">
            İlk 15 aracınız sonsuza kadar ücretsiz, kredi kartı gerekmez. Kurulum 2 dakika sürer.
          </p>
          <Link
            href="/kayit"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-brand-700 hover:bg-slate-100 active:scale-[0.98]"
          >
            Ücretsiz Hesap Aç
          </Link>
        </div>
      </section>

      <section id="iletisim" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">İletişim</h2>
          <p className="mt-2 text-slate-600">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için bize ulaşın.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
            <MailIcon className="h-5 w-5 shrink-0 text-brand-600" />
            <a
              href="mailto:hello@otohafiza.com"
              className="text-base font-semibold text-slate-900 hover:text-brand-700"
            >
              hello@otohafiza.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} OtoHafıza — Aracının dijital hafızası.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Link href="/blog" className="underline">
            Blog
          </Link>
          <span className="text-slate-300">·</span>
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
