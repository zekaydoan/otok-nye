import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdPixels from "@/components/AdPixels";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import PageviewTracker from "@/components/PageviewTracker";
import ActiveVisitorTracker from "@/components/ActiveVisitorTracker";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// otohafiza.com yayına alınmadan önce SITE_URL, Netlify'ın ücretsiz
// yagbakim-defteri.netlify.app alt alan adına düşüyordu — arama motorlarının
// canonical/OG etiketlerinde her zaman asıl marka alan adını görmesi için
// varsayılan artık otohafiza.com'a çekildi (process.env.URL, Netlify'da her
// zaman o anki birincil alan adını verir, bu fallback yalnızca yerel geliştirme
// ya da URL değişkeni tanımsızken devreye girer).
const SITE_URL = process.env.URL || "https://otohafiza.com";
const TITLE = "OtoHafıza | QR Kodlu Dijital Yağ Bakım Defteri";
const DESCRIPTION =
  "Araca yapıştırılan QR kod ile yağ bakım geçmişini otomatik kaydedin ve gösterin. Oto tamirciler, yetkili servisler ve galeriler için ücretsiz başlanabilen dijital bakım takip sistemi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | OtoHafıza" },
  description: DESCRIPTION,
  keywords: [
    "yağ bakım defteri",
    "QR kod araç bakım takibi",
    "dijital servis fişi",
    "oto tamirci yazılımı",
    "araç bakım hatırlatma",
    "oto servis programı",
    "yağ değişim takip sistemi",
  ],
  authors: [{ name: "Sarper Dijital", url: "https://www.sarperdijital.com" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  // Meta (Facebook) Business Manager domain doğrulaması — Next.js Metadata
  // API'nin "other" alanı, bu etiketi sunucu tarafında ilk HTML çıktısının
  // <head>'ine gömer (JS ile sonradan eklenmez). Meta Pixel'in kendisiyle
  // (bkz. components/AdPixels.tsx) hiçbir ilgisi yok, tamamen ayrı bir
  // doğrulama mekanizması.
  other: {
    "facebook-domain-verification": "o790r0fkvuxefa26car4is6218ls5s",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "OtoHafıza",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OtoHafıza",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1d4ed8",
};

// Organization + WebSite yapılandırılmış verisi (JSON-LD) — Google'ın marka
// adını arama sonuçlarında ve "hakkında" panelinde doğru tanıması için her
// sayfada sabit olarak eklenir. Sayfaya özgü yapılandırılmış veriler (SoftwareApplication,
// FAQPage vb.) ilgili sayfanın kendi dosyasında ayrıca eklenir (bkz. app/page.tsx).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OtoHafıza",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: DESCRIPTION,
  founder: {
    "@type": "Organization",
    name: "Sarper Dijital",
    url: "https://www.sarperdijital.com",
  },
  sameAs: [
    "https://www.sarperdijital.com",
    "https://www.instagram.com/hafizaoto",
    "https://www.facebook.com/profile.php?id=61593171520080",
  ],
};

// WebSite yapılandırılmış verisi — Organization'dan ayrı, Google'ın "bu site
// hangi marka adına ait ve kanonik URL'si ne" ilişkisini netleştirmesi için.
// Uydurma bir arama kutusu (potentialAction/SearchAction) eklenmedi çünkü
// sitede gerçek bir site-içi arama özelliği yok.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OtoHafıza",
  url: SITE_URL,
  inLanguage: "tr-TR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      {/* pb-24: mobilde sol altta sabit duran WhatsAppFloatButton (h-14, bottom-5)
          bazı sayfalarda son içerikle (ör. ana sayfa SSS'in son sorusu, /hakkimizda
          footer linkleri) üst üste biniyordu — buton her zaman fixed/normal akış
          dışında olduğundan, body'nin altına mobilde ekstra boşluk bırakarak son
          içeriğin butonun arkasında kalmasını engelliyoruz. sm ve üstünde buton zaten
          daha az yoğun sayfa altlarıyla çakışmadığı için padding kaldırılıyor. */}
      <body className="font-sans pb-24 sm:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AdPixels />
        <PageviewTracker />
        <ActiveVisitorTracker />
        {children}
        <ScrollToTop />
        {/* ScrollToTop sağ altta olduğu için çakışmasın diye sol altta —
            bkz. WhatsAppFloatButton.tsx. */}
        <WhatsAppFloatButton />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
