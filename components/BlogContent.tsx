import Link from "next/link";
import type { BlogBlock } from "@/lib/blogPosts";

// Blog yazılarının tipli blok verisini (bkz. lib/blogPosts.ts) sitenin geri
// kalanıyla aynı tipografi diliyle render eder. Ham HTML + dangerouslySetInnerHTML
// yerine bu yaklaşımın tercih edilmesinin nedeni: içerik veri dosyasında sabit
// olduğu için XSS riski yok, ama yine de tip-güvenli ve tutarlı bir stil
// üretmek daha kolay (bkz. lib/blogPosts.ts dosya başı yorumu).
export default function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-1 text-lg font-bold text-slate-900">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-slate-700">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 text-slate-700">
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5 text-slate-700">
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-brand-400 bg-brand-50 px-4 py-3 italic text-brand-800"
              >
                {block.text}
              </blockquote>
            );
          case "cta":
            return (
              <div
                key={i}
                className="flex flex-col items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-medium text-brand-800">{block.text}</p>
                <Link
                  href={block.href}
                  className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {block.label}
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
