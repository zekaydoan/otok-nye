"use client";

import { useState } from "react";

// Admin İstatistikler sayfasındaki "Günlük Rapor (PDF)" bölümü — Zeki'nin 22
// Ağustos 2026 talebi: "panelden Bugünün istatistikleri pdf olarak insin".
// Varsayılan olarak bugünü seçili getirir, ama tarih seçilerek geçmişteki
// herhangi bir günün raporu da indirilebilir (günlük sayaçlar süresiz
// saklandığından — bkz. lib/blobStore.ts getDailyStatsReport). İndirme,
// oturum çerezi zaten aynı origin'de otomatik gönderildiği için basit bir
// <a href> ile yapılır (bkz. app/admin/stok/[batchId]/page.tsx'teki aynı desen).
export default function DailyReportDownload({ todayISO }: { todayISO: string }) {
  const [date, setDate] = useState(todayISO);

  const fmtDMY = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Rapor Tarihi</label>
        <input
          type="date"
          value={date}
          max={todayISO}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
        />
      </div>
      <a
        href={`/api/admin/istatistikler/gunluk-rapor?date=${date}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {date === todayISO ? "Bugünün Raporunu PDF İndir" : `${fmtDMY(date)} Raporunu PDF İndir`}
      </a>
      <button
        type="button"
        onClick={() => setDate(todayISO)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
      >
        Bugüne dön
      </button>
    </div>
  );
}
