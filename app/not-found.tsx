import Link from "next/link";
import Logo from "@/components/Logo";
import { CarIcon } from "@/components/icons";

// Next.js, eşleşen bir rota bulunamadığında (ör. yanlış plaka/araç ID'li bağlantı,
// admin rotasının notFound() çağrısı) otomatik olarak bu sayfayı render eder.
// Varsayılan çıplak "404" yerine markayla uyumlu, yönlendirici bir ekran.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <Link href="/" className="inline-block">
          <Logo withText />
        </Link>
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <CarIcon className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-500">404</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Bu sayfayı bulamadık</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bağlantı hatalı olabilir ya da aradığınız kayıt kaldırılmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
