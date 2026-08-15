import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedPosts, listBlogPosts } from "@/lib/blogPosts";
import BlogContent from "@/components/BlogContent";

const SITE_URL = process.env.URL || "https://otohafiza.com";

// Derleme zamanında tüm yazıların statik olarak üretilmesi için — içerik sabit
// bir veri dosyasından geldiğinden (bkz. lib/blogPosts.ts), her istek için
// yeniden render etmeye gerek yok.
export function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const url = `${SITE_URL}/blog/${post.slug}`;

  // BlogPosting yapılandırılmış verisi — Google'ın makaleyi "article rich
  // result" olarak tanıması ve yazar/yayın tarihi bilgisini doğru göstermesi
  // için (bkz. app/layout.tsx'teki Organization ve app/page.tsx'teki
  // SoftwareApplication/FAQPage JSON-LD'lerle aynı desen).
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "OtoHafıza" },
    publisher: {
      "@type": "Organization",
      name: "OtoHafıza",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="text-sm text-slate-400">
        <Link href="/blog" className="hover:text-brand-700">
          ← Blog
        </Link>
      </nav>

      <span className="mt-4 inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
        {post.category}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {post.readingMinutes} dk okuma
      </p>

      <div className="mt-8">
        <BlogContent blocks={post.content} />
      </div>

      {related.length > 0 && (
        <div className="mt-12 border-t border-slate-100 pt-8">
          <h2 className="text-lg font-bold text-slate-900">İlginizi çekebilir</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:border-brand-300 hover:text-brand-700"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
