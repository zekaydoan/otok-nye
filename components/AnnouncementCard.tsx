"use client";

import { useState } from "react";

// Duyuru sayfasındaki tek bir kart — V2 sadeleştirme (23 Ağustos 2026, Zeki
// onayı) ile eklendi: (1) uzun metinleri kısaltıp "Devamını oku" ile
// genişletir, (2) henüz görülmemiş duyurularda küçük bir "Yeni" rozeti
// gösterir. Okundu/okunmadı SAYAÇ mantığı değişmedi — bu yalnızca sunucudan
// gelen `isNew` bilgisinin görsel karşılığı, sayfa ziyareti hâlâ rozeti
// sıfırlıyor (bkz. app/dashboard/duyurular/page.tsx).
const TRUNCATE_LENGTH = 240;

export default function AnnouncementCard({
  title,
  message,
  createdAt,
  isNew,
}: {
  title: string;
  message: string;
  createdAt: string;
  isNew: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = message.length > TRUNCATE_LENGTH;
  const displayMessage = expanded || !isLong ? message : `${message.slice(0, TRUNCATE_LENGTH).trimEnd()}…`;

  return (
    <div className="rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
        {title}
        {isNew && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
            Yeni
          </span>
        )}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{displayMessage}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs font-medium text-brand-600 hover:underline"
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}
      <p className="mt-2 text-xs text-slate-400">{new Date(createdAt).toLocaleString("tr-TR")}</p>
    </div>
  );
}
