// Next/font (Inter) build sırasında fontu kendi sunucusuna indirip barındırdığı için
// çalışma zamanında dış font sağlayıcısına (fonts.googleapis.com vb.) istek atılmaz —
// bu sayede CSP'yi harici kaynaklara izin vermeden sıkı tutabiliyoruz. İstisnalar:
// ana sayfa hero'sundaki gerçek fotoğraf Unsplash CDN'inden (ücretsiz/lisanslı, bkz.
// app/page.tsx) çekiliyor (img-src); Meta (Facebook) Pixel ise yalnızca
// NEXT_PUBLIC_META_PIXEL_ID ortam değişkeni tanımlıysa yüklenir (bkz.
// components/AdPixels.tsx) — script/connect/img-src'ye bu yüzden Meta'nın
// kendi domain'leri eklendi, aksi halde CSP pixel'i sessizce engellerdi.
const csp = [
  "default-src 'self'",
  "img-src 'self' data: https://images.unsplash.com https://www.facebook.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
  "font-src 'self' data:",
  "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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
