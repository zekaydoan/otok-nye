// Next/font (Inter) build sırasında fontu kendi sunucusuna indirip barındırdığı için
// çalışma zamanında dış font sağlayıcısına (fonts.googleapis.com vb.) istek atılmaz —
// bu sayede CSP'yi harici kaynaklara izin vermeden sıkı tutabiliyoruz. İstisnalar:
// ana sayfa hero'sundaki gerçek fotoğraf Unsplash CDN'inden (ücretsiz/lisanslı, bkz.
// app/page.tsx) çekiliyor (img-src); Meta (Facebook) Pixel ve Google Analytics 4
// yalnızca ilgili ortam değişkenleri (NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_
// GA_MEASUREMENT_ID) tanımlıysa yüklenir (bkz. components/AdPixels.tsx) — bu
// yüzden Meta ve Google'ın kendi domain'leri eklendi, aksi hâlde CSP bunları
// sessizce engeller. iyzico Abonelik Checkout Form'u (bkz. lib/iyzicoSubscription.ts,
// components/SubscriptionCheckoutForm.tsx) kart bilgilerini kendi statik
// script'i + iframe'iyle gömülü olarak sitede render eder — bu yüzden
// *.iyzipay.com script-src/connect-src/frame-src'ye eklendi (18 Ağustos 2026:
// bu eksiklik yüzünden abonelik ödeme ekranı CSP tarafından sessizce
// bloke ediliyordu, konsolda "violates ... script-src" hatasıyla tespit edildi).
const csp = [
  "default-src 'self'",
  "img-src 'self' data: https://images.unsplash.com https://www.facebook.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://*.iyzipay.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.iyzipay.com",
  "frame-src 'self' https://*.iyzipay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.iyzipay.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Kamera, kamera ile QR tarama özelliği (jsQR + getUserMedia) için kendi sitemizde açık;
  // diğer hassas izinler kapalı.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bu proje ayrı bir ESLint kurulumu içermiyor; derlemenin buna takılmasını önler.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
module.exports = nextConfig;
