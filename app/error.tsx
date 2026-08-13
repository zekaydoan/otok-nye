"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { WarningIcon } from "@/components/icons";

// Next.js'in "error boundary" konvansiyonu — bir sayfa render sırasında
// beklenmedik bir hata fırlatırsa (ör. blob store bağlantı sorunu) varsayılan
// çıplak hata ekranı yerine bu bileşen gösterilir. İstemci bileşeni olmak
// zorundadır (Next.js gereksinimi).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <Link href="/" className="inline-block">
          <Logo withText />
        </Link>
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <WarningIcon className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm text-slate-500">
          Beklenmedik bir hata oluştu. Sorun devam ederse lütfen daha sonra tekrar deneyin.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
