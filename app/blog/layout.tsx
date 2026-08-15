import Link from "next/link";
import Logo from "@/components/Logo";

// Blog sayfaları da (liste + detay) ana sayfayla aynı marka diline sahip
// olsun diye ortak bir header/footer — dashboard'un aksine oturum gerektirmez,
// herkese açık pazarlama/SEO içeriğidir.
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl">
            <Logo withText />
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link href="/blog" className="hover:text-brand-700">
              Blog
            </Link>
            <Link
              href="/kayit"
              className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
            >
              Ücretsiz Başla
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} OtoHafıza — Aracının dijital hafızası.</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className="underline">
            Ana Sayfa
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kvkk" className="underline">
            KVKK Aydınlatma Metni
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kullanim-sartlari" className="underline">
            Kullanım Şartları
          </Link>
        </div>
      </footer>
    </div>
  );
}
