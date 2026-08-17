import type { MetadataRoute } from "next";

const SITE_URL = process.env.URL || "https://otohafiza.com";

// Arama motoru botlarına hangi bölümleri taramaları/tarama dışı bırakmaları
// gerektiğini söyler. Panel içi sayfalar (dashboard, admin, giriş sonrası
// akışlar) ve API uçları kişiye özel/oturuma bağlı olduğu için indekslenmesi
// hem gereksiz hem de (giriş ekranına düşen boş sayfalar nedeniyle) kullanıcı
// deneyimi açısından yanıltıcı olur — bu yüzden dışlanır. /arac/[id] genel
// (public) sayfası bilinçli olarak DAHİL edilir: bu sayfalar asıl "aracının
// dijital hafızası" değer önerisinin somut kanıtı ve potansiyel müşterilerin
// arayabileceği bir içerik türüdür.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/giris",
        "/kayit/dogrula",
        "/sifre-sifirla",
        // Saha partnerlerinin paylaştığı kişisel kısa yönlendirme linkleri
        // (bkz. app/p/[code], components/PartnerReferralLink.tsx) — içerik
        // değeri yok, sadece /kayit?ref=KOD'a yönlendiriyor, taranmasına gerek yok.
        // DİKKAT: robots.txt disallow eşleşmesi düz ÖNEK (prefix) eşleşmesidir,
        // "/p" ya da "/partner" gibi SONU "/" OLMAYAN girişler yazarsak
        // "/partner-basvuru" ve "/partner-girisi" gibi tamamen ayrı, kasıtlı
        // olarak indekslenebilir kalması gereken sayfaları da yanlışlıkla
        // engeller (aynı harflerle başlıyorlar diye). Bu yüzden bilinçli
        // olarak sondaki "/" ile sadece o klasörün ALTINDAKİ path'ler
        // engelleniyor, kardeş sayfalara dokunulmuyor.
        "/p/",
        "/partner/",
        "/partner-girisi",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
