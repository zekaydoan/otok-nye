import type { MaintenanceTier } from "@/lib/maintenance";

const STYLES: Record<MaintenanceTier, string> = {
  excellent: "bg-green-100 text-green-700",
  good: "bg-brand-50 text-brand-700",
  poor: "bg-red-100 text-red-700",
  insufficient: "bg-slate-100 text-slate-500",
};

export default function ScoreBadge({ tier, label }: { tier: MaintenanceTier; label: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[tier]}`}>
      {label}
    </span>
  );
}
