import Link from "next/link";
import type { Metadata } from "next";
import { listBlogPosts } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Araç bakımı, yağ değişimi, oto servis işletmeciliği ve dijital bakım takibi üzerine rehberler — OtoHafıza Blog.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-600">
        Araç bakımı, oto servis işletmeciliği ve dijital bakım takibi üzerine pratik rehberler.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:border-brand-300 hover:shadow-md sm:p-6"
          >
            <span className="self-start rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {post.category}
            </span>
            <h2 className="mt-3 text-lg font-bold text-slate-900">{post.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
            <p className="mt-3 text-xs text-slate-400">
              {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {post.readingMinutes} dk okuma
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
