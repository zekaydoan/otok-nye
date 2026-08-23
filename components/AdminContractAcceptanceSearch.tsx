"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { CheckCircleIcon } from "@/components/icons";

export interface ContractAcceptanceItemRow {
  document: string;
  label: string;
  version: string;
  accepted: boolean;
  hash: string;
}

export interface ContractAcceptanceRow {
  id: string;
  day: string;
  accountTypeLabel: string;
  accountTypeBadgeClass: string;
  href: string;
  identifier: string;
  timeLabel: string;
  ip: string;
  items: ContractAcceptanceItemRow[];
}

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): bir uyuşmazlıkta "filanca ne
// zaman neyi onayladı" sorusuna hızlı cevap verebilmek için isim/e-posta
// araması eklendi. Sayfa hâlâ tamamen salt okunur — arama yalnızca mevcut
// kayıtları istemci tarafında filtreler, hiçbir kaydı değiştirmez veya silmez
// (bkz. app/admin/sozlesme-onaylari/page.tsx üstteki açıklama, ispat
// niteliğindeki kayıtların değişmez kalması gerektiği notu).
export default function AdminContractAcceptanceSearch({ rows }: { rows: ContractAcceptanceRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.identifier.toLowerCase().includes(q));
  }, [rows, query]);

  // Gün gruplaması, filtreden SONRA yeniden kurulur — böylece bir arama
  // sonucunda hiç eşleşmesi olmayan günler tamamen gizlenir, boş gün
  // başlıkları listelenmez.
  const groups = useMemo(() => {
    const map = new Map<string, ContractAcceptanceRow[]>();
    for (const row of filtered) {
      if (!map.has(row.day)) map.set(row.day, []);
      map.get(row.day)!.push(row);
    }
    return [...map.entries()];
  }, [filtered]);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircleIcon className="h-6 w-6" />}
        title="Henüz kayıt yok"
        description="Bir kullanıcı veya saha partneri üye olduğunda onay kaydı burada listelenecek."
      />
    );
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="İsim veya e-posta ara..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} / {rows.length} kayıt gösteriliyor
      </p>

      <div className="mt-4 space-y-6">
        {groups.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
            Sonuç bulunamadı.
          </p>
        )}
        {groups.map(([day, dayEntries]) => (
          <div key={day}>
            <h2 className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
              {day} <span className="font-normal text-slate-400">· {dayEntries.length} kayıt</span>
            </h2>
            <div className="mt-2 space-y-2">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.accountTypeBadgeClass}`}
                      >
                        {entry.accountTypeLabel}
                      </span>
                      <Link href={entry.href} className="text-sm font-semibold text-slate-900 hover:underline">
                        {entry.identifier}
                      </Link>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{entry.timeLabel}</p>
                      <p>IP: {entry.ip}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {entry.items.map((item) => (
                      <li
                        key={item.document}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
                      >
                        <span className={item.accepted ? "text-slate-700" : "text-slate-400 line-through"}>
                          {item.label} <span className="text-slate-400">({item.version})</span>
                        </span>
                        <span
                          className="font-mono text-slate-400"
                          title={`Bütünlük parmak izi (SHA-256): ${item.hash}`}
                        >
                          {item.hash.slice(0, 12)}…
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
