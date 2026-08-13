import type { ReactNode } from "react";

// Dashboard'un en üstünde hızlı bir genel bakış vermek için — tüm kartları taramadan
// önce "kaç aracım var, kaçının bakımı yaklaşıyor" sorusuna anında cevap verir.
export default function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: "default" | "warning";
}) {
  const toneClasses =
    tone === "warning"
      ? "bg-amber-50 ring-amber-100 text-amber-700"
      : "bg-white ring-slate-100 text-brand-700";

  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 shadow-sm ring-1 ${toneClasses}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          tone === "warning" ? "bg-amber-100" : "bg-brand-50"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold leading-none text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
