import type { MetadataRoute } from "next";

const SITE_URL = process.env.URL || "https://otohafiza.com";

// Yalnızca herkese açık, indekslenmesi anlamlı olan pazarlama/yasal sayfaları
// listeler — dashboard/admin gibi oturum gerektiren sayfalar ile /arac/[id]
// gibi tek tek müşteriye özel araç sayfaları (binlerce olabilir, arama
// motorunda listelenmesi anlamlı bir kazanım sağlamaz ve robots.txt'te zaten
// dışlanmamıştır ama burada da yer almaz) bilinçli olarak dışarıda bırakılır.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/kayit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/giris`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/kullanim-sartlari`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/mesafeli-satis-sozlesmesi`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
