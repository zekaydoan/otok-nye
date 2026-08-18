"use client";

import { useState } from "react";

interface DailyPageviewStat {
  date: string;
  count: number;
}

// Admin İstatistikler sayfasındaki "Haftalık / Aylık Ziyaret" bölümü (bkz.
// app/admin/istatistikler/page.tsx) — kullanıcı başlangıç/bitiş tarihi seçip
// (ya da hazır "Bu Hafta / Geçen Ay" gibi kısayollardan birine tıklayıp)
// istediği aralığın toplam ve günlük sayfa görüntüleme dökümünü görebilir.
// Veri, sunucuda zaten her gün için süresiz saklanan sayaçlardan hesaplanır
// (bkz. lib/blobStore.ts getPageviewsInRange, app/api/admin/pageviews-range)
// — burada yalnızca hangi aralığın isteneceğini seçip sonucu gösteriyoruz.
export default function PageviewsRangeExplorer({
  initialStart,
  initialEnd,
  initialTotal,
  initialDays,
}: {
  initialStart: string;
  initialEnd: string;
  initialTotal: number;
  initialDays: DailyPageviewStat[];
}) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [total, setTotal] = useState(initialTotal);
  const [days, setDays] = useState(initialDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(newStart: string, newEnd: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pageviews-range?start=${newStart}&end=${newEnd}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Veri alınamadı.");
        return;
      }
      setTotal(data?.total ?? 0);
      setDays(Array.isArray(data?.days) ? data.days : []);
      setStart(newStart);
      setEnd(newEnd);
    } catch {
      setError("Veri alınamadı, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const daysAgoISO = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const startOfWeek = (offsetWeeks = 0) => {
    const d = new Date();
    const weekday = d.getDay(); // 0 = Pazar
    const diffToMonday = weekday === 0 ? 6 : weekday - 1;
    d.setDate(d.getDate() - diffToMonday + offsetWeeks * 7);
    return d.toISOString().slice(0, 10);
  };
  const endOfWeek = (offsetWeeks = 0) => {
    const d = new Date(startOfWeek(offsetWeeks));
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  };
  const startOfMonth = (offsetMonths = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offsetMonths, 1);
    return d.toISOString().slice(0, 10);
  };
  const endOfMonth = (offsetMonths = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offsetMonths + 1, 0);
    return d.toISOString().slice(0, 10);
  };

  const presets: { label: string; start: string; end: string }[] = [
    { label: "Bu Hafta", start: startOfWeek(0), end: todayISO() },
    { label: "Geçen Hafta", start: startOfWeek(-1), end: endOfWeek(-1) },
    { label: "Bu Ay", start: startOfMonth(0), end: todayISO() },
    { label: "Geçen Ay", start: startOfMonth(-1), end: endOfMonth(-1) },
    { label: "Son 7 Gün", start: daysAgoISO(6), end: todayISO() },
    { label: "Son 30 Gün", start: daysAgoISO(29), end: todayISO() },
  ];

  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const dailyAverage = days.length > 0 ? Math.round(total / days.length) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500">Başlangıç</label>
          <input
            type="date"
            value={start}
            max={end}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Bitiş</label>
          <input
            type="date"
            value={end}
            min={start}
            max={todayISO()}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700"
          />
        </div>
        <button
          type="button"
          onClick={() => load(start, end)}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Yükleniyor…" : "Göster"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => load(p.start, p.end)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs text-slate-500">
            {start} – {end}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total.toLocaleString("tr-TR")}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">toplam ziyaret</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs text-slate-500">Günlük Ortalama</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dailyAverage.toLocaleString("tr-TR")}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{days.length} gün üzerinden</p>
        </div>
      </div>

      {days.length > 0 && (
        <div className="mt-4 flex items-end gap-1 overflow-x-auto" style={{ height: 100 }}>
          {days.map((d) => (
            <div
              key={d.date}
              className="flex flex-1 flex-col items-center gap-1"
              style={{ minWidth: 8 }}
              title={`${d.date}: ${d.count}`}
            >
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${Math.max(4, (d.count / maxCount) * 80)}px` }}
              />
              {days.length <= 31 && <span className="text-[8px] text-slate-400">{d.date.slice(8, 10)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
