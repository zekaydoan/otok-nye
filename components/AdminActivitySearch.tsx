"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { ChartBarIcon } from "@/components/icons";

export interface AdminActivityRow {
  id: string;
  href: string;
  title: string;
  detail: string;
  actorEmail: string;
  createdAtLabel: string;
}

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): 200 kayıtlık düz liste
// yalnızca kaydırmayla taranabiliyordu — belirli bir bayi/partner ya da
// işlem türünü bulmak için basit bir metin araması eklendi (bkz.
// components/AdminShopSearch.tsx ile aynı istemci taraflı filtreleme deseni).
// Sunucu bileşeni (app/admin/aktivite/page.tsx) href/etiket eşlemesini
// burada değil orada hesaplar — istemci bileşenine yalnızca düz metin
// alanları geçer, fonksiyon geçirilmez.
export default function AdminActivitySearch({ entries }: { entries: AdminActivityRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.actorEmail.toLowerCase().includes(q)
    );
  }, [entries, query]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<ChartBarIcon className="h-6 w-6" />}
        title="Henüz kayıt yok"
        description="Plan veya sipariş işlemi yaptığınızda burada listelenecek."
      />
    );
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Bayi, partner, işlem veya e-posta ara..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} / {entries.length} kayıt gösteriliyor
      </p>
      <div className="mt-3 space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
            Sonuç bulunamadı.
          </p>
        )}
        {filtered.map((e) => (
          <Link
            key={e.id}
            href={e.href}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{e.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{e.actorEmail}</p>
              <p>{e.createdAtLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
