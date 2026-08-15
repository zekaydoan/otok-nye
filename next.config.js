// Next/font (Inter) build sırasında fontu kendi sunucusuna indirip barındırdığı için
// çalışma zamanında dış font sağlayıcısına (fonts.googleapis.com vb.) istek atılmaz —
// bu sayede CSP'yi harici kaynaklara izin vermeden sıkı tutabiliyoruz. Tek istisna:
// ana sayfa hero'sundaki gerçek fotoğraf Unsplash CDN'inden (ücretsiz/lisanslı, bkz.
// app/page.tsx) çekiliyor, bu yüzden img-src'ye sadece o tek domain eklendi.
const csp = [
  "default-src 'self'",
  "img-src 'self' data: https://images.unsplash.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self'",
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
