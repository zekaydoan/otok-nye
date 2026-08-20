import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blogPosts";

const SITE_URL = process.env.URL || "https://otohafiza.com";

// Yalnızca herkese açık, indekslenmesi anlamlı olan pazarlama/yasal sayfaları
// listeler — dashboard/admin gibi oturum gerektiren sayfalar ile /arac/[id]
// gibi tek tek müşteriye özel araç sayfaları (binlerce olabilir, arama
// motorunda listelenmesi anlamlı bir kazanım sağlamaz ve robots.txt'te zaten
// dışlanmamıştır ama burada da yer almaz) bilinçli olarak dışarıda bırakılır.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogEntries: MetadataRoute.Sitemap = listBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/kayit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogEntries,
    { url: `${SITE_URL}/referans`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    // /giris bilinçli olarak burada YOK: robots.ts zaten onu Disallow listesine
    // alıyor (oturum ekranı, indekslenmesi anlamlı değil) — sitemap'te taranması
    // engellenmiş bir URL'yi listelemek Google Search Console'da "Sitemap'te
    // gönderildi ama robots.txt tarafından engellendi" uyarısına yol açar.
    { url: `${SITE_URL}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/gizlilik-sozlesmesi`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
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
