"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

export interface AdminShopRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  plan: Plan;
  vehicleCount: number;
  createdAt: string;
}

// İstemci tarafında filtrelenen basit bir arama — bayi sayısı (erken aşama
// için) küçük olduğundan sunucu tarafı arama/sayfalama şimdilik gereksiz
// karmaşıklık; hacim büyüdükçe (bkz. kapasite-analizi.md) bu bileşenin sunucu
// tarafı aramaya taşınması gerekebilir.
export default function AdminShopSearch({ shops }: { shops: AdminShopRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.city || "").toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }, [shops, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="İsim, e-posta, şehir veya telefon ara..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
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
