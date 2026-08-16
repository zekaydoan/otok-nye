import { cloneElement, type ReactElement } from "react";

// Renkli, yuvarlatılmış ikon kutucuğu — admin panelindeki nav sekmelerini,
// bölüm başlıklarını ve özet kartlarını birbirinden ayırt etmek için (bkz.
// app/admin/layout.tsx, app/admin/istatistikler, app/admin/bekleyen-isler).
// Ana sayfadaki (app/page.tsx) özellik ikonlarıyla aynı görsel dil: içi beyaz
// ikon, dışı renkli dolu kutucuk. İkon her zaman `text-white` alır (icons.tsx
// `currentColor` kullanır), boyutu çağıran tarafın icon className'i belirler.
const COLOR_CLASSES = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
  slate: "bg-slate-500",
  green: "bg-emerald-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  brand: "bg-brand-600",
} as const;

export type IconBadgeColor = keyof typeof COLOR_CLASSES;

export default function IconBadge({
  icon,
  color,
  size = "sm",
}: {
  icon: ReactElement;
  color: IconBadgeColor;
  size?: "sm" | "md";
}) {
  const boxClass = size === "md" ? "h-9 w-9" : "h-7 w-7";
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg text-white ${COLOR_CLASSES[color]} ${boxClass}`}
    >
      {cloneElement(icon, { className: iconClass })}
    </span>
  );
}
