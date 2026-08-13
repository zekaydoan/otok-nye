import type { ReactNode } from "react";
import Link from "next/link";

// Uygulama genelinde tekrarlayan "liste boş" durumları için tek bir görsel dil:
// ikonlu bir rozet + başlık + açıklama + isteğe bağlı bir eylem bağlantısı.
// Önceden her sayfa kendi düz metnini yazıyordu (bkz. "Henüz araç eklemediniz.",
// "Henüz sipariş yok." gibi tek satırlık notlar); bu bileşen aynı bilgiyi daha
// davetkar ve tutarlı bir kart içinde sunar.
export default function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
