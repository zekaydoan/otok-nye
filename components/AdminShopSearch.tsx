"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { buildCsv, downloadCsv } from "@/lib/csv";

export interface AdminShopRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  plan: Plan;
  vehicleCount: number;
  createdAt: string;
  pendingPlan?: Plan;
  lastLoginAt?: string; // ISO — bkz. lib/types.ts Shop.lastLoginAt
}

const INACTIVE_DAYS_THRESHOLD = 30;

// Dört "dikkat gerekebilir" sinyali hesaplar — hiçbiri veritabanında ayrı bir
// alan olarak tutulmaz, mevcut alanlardan türetilir:
// - hiçAraçYok: kayıt olmuş ama tek araç bile eklememiş (onboarding'de takılmış olabilir)
// - bekleyenPlan: H1 düzeltmesindeki pendingPlan (bkz. app/api/shop/plan/route.ts)
// - uzunSüredirYok: lastLoginAt INACTIVE_DAYS_THRESHOLD günden eski, YA DA hiç
//   yoksa (bu alan yeni eklendi — eski girişler için henüz kayıtlı olmayabilir)
//   createdAt aynı eşikten eski. Bu ikinci koşul olmadan, özellik yeni
//   çıktığında henüz hiç tekrar giriş yapmamış TÜM eski bayiler yanlışlıkla
//   "aktif" görünürdü.
// - limiteYakın: ücretsiz plandaki bir bayi limitin %80'ine ulaşmış/aşmış.
function computeFlags(s: AdminShopRow) {
  const now = Date.now();
  const daysSince = (iso: string) => (now - new Date(iso).getTime()) / 86400000;
  const lastActivity = s.lastLoginAt ?? s.createdAt;

  return {
    noVehicles: s.vehicleCount === 0,
    pendingPlan: !!s.pendingPlan,
    inactive: daysSince(lastActivity) > INACTIVE_DAYS_THRESHOLD,
    nearLimit: s.plan === "free" && s.vehicleCount >= PLAN_LIMITS.free.maxVehicles * 0.8,
  };
}

// İstemci tarafında filtrelenen basit bir arama — bayi sayısı (erken aşama
// için) küçük olduğundan sunucu tarafı arama/sayfalama şimdilik gereksiz
// karmaşıklık; hacim büyüdükçe (bkz. kapasite-analizi.md) bu bileşenin sunucu
// tarafı aramaya taşınması gerekebilir.
export default function AdminShopSearch({ shops }: { shops: AdminShopRow[] }) {
  const [query, setQuery] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = shops;
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.city || "").toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }
    if (onlyFlagged) {
      result = result.filter((s) => {
        const f = computeFlags(s);
        return f.noVehicles || f.pendingPlan || f.inactive || f.nearLimit;
      });
    }
    return result;
  }, [shops, query, onlyFlagged]);

  function exportCsv() {
    const csv = buildCsv(
      ["Firma", "E-posta", "Telefon", "Şehir", "Plan", "Araç Sayısı", "Kayıt Tarihi"],
      filtered.map((s) => [
        s.name,
        s.email,
        s.phone,
        s.city || "",
        PLAN_LIMITS[s.plan].label,
        s.vehicleCount,
        s.createdAt.slice(0, 10),
      ])
    );
    downloadCsv(`bayiler-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim, e-posta, şehir veya telefon ara..."
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <label className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyFlagged}
            onChange={(e) => setOnlyFlagged(e.target.checked)}
          />
          Yalnızca dikkat gerekenler
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          CSV indir
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} / {shops.length} bayi gösteriliyor
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-400">
              <th className="px-3 py-2 font-medium">Firma</th>
              <th className="px-3 py-2 font-medium">Şehir</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium text-right">Araç</th>
              <th className="px-3 py-2 font-medium">Kayıt</th>
              <th className="px-3 py-2 font-medium">Sinyaller</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const flags = computeFlags(s);
              return (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/admin/bayiler/${s.id}`} className="font-medium text-brand-700 hover:underline">
                      {s.name}
                    </Link>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{s.city || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{PLAN_LIMITS[s.plan].label}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{s.vehicleCount}</td>
                  <td className="px-3 py-2 text-slate-500">{s.createdAt.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {flags.pendingPlan && <SignalBadge color="amber">Plan bekliyor</SignalBadge>}
                      {flags.noVehicles && <SignalBadge color="slate">Araç yok</SignalBadge>}
                      {flags.inactive && <SignalBadge color="slate">Uzun süredir yok</SignalBadge>}
                      {flags.nearLimit && <SignalBadge color="red">Limite yakın</SignalBadge>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                  Sonuç bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SignalBadge({ children, color }: { children: React.ReactNode; color: "amber" | "slate" | "red" }) {
  const classes = {
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-700",
  }[color];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${classes}`}>{children}</span>;
}
