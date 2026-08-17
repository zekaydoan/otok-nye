"use client";

import { useState } from "react";
import { TR_PROVINCE_PATHS, TR_PROVINCE_CENTROIDS } from "@/lib/turkeyProvincePaths";
import { TR_PROVINCES } from "@/lib/types";

// Gerçek il sınırlarına sahip bir Türkiye haritası — Shopify'ın canlı
// ziyaretçi haritasındaki gibi, illere bölünmüş bir "choropleth" (bugünkü
// ziyaret sayısına göre koyulaşan renk) harita. İl sınırı verisi bir kereye
// mahsus dış bir kaynaktan (Highcharts harita verisi) çıkarılıp projelenmiş
// SVG path'leri olarak lib/turkeyProvincePaths.ts'e yazıldı (bkz. o dosyanın
// başındaki not) — burada yalnızca render edilir, ağır coğrafi hesaplama
// çalışma zamanında yapılmaz.
//
// "Canlı" (real-time, şu an sitede olan) ziyaretçi sayısı DEĞİL — mevcut
// altyapı yalnızca günlük toplam sayaç tutuyor (bkz. lib/blobStore.ts
// incrementCityVisit), bu yüzden burada gösterilen "bugün toplam kaç
// ziyaret" bilgisidir. Gerçek anlık/canlı sayaç için ayrı bir "son N dakika
// aktif" mekanizması gerekir — bu, ayrı bir özellik olarak istenirse eklenir.
//
// Hover davranışı: önceden yalnızca native SVG <title> vardı — tarayıcının
// varsayılan tooltip'i ancak fare ~1 saniye hareketsiz kalınca, küçük ve
// gecikmeli çıkıyordu, bu yüzden "hangi ildeyim" net anlaşılmıyordu. Bunun
// yerine artık fare hareketiyle birlikte anında güncellenen, imlecin hemen
// yanında duran özel bir tooltip (aşağıdaki `hovered` state'i) kullanılıyor —
// bu yüzden bileşen "use client" oldu (önceden sunucu tarafında da
// render edilebiliyordu, artık hover state'i için istemci gerekiyor).
const WIDTH = 760;
const HEIGHT = 340;

export default function TurkeyVisitorMap({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((sum, c) => sum + c, 0);
  const maxCount = Math.max(1, ...Object.values(data));
  const [hovered, setHovered] = useState<{ province: string; x: number; y: number } | null>(null);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        Bugün henüz şehir bazlı ziyaret verisi yok.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto w-full max-w-3xl"
        role="img"
        aria-label="Bugünkü ziyaretçilerin illere göre dağılımını gösteren Türkiye haritası"
        onMouseLeave={() => setHovered(null)}
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={16} className="fill-slate-50" />
        {TR_PROVINCES.map((province) => {
          const path = TR_PROVINCE_PATHS[province];
          if (!path) return null;
          const count = data[province] ?? 0;
          const isHovered = hovered?.province === province;
          // Ziyaret yoksa nötr gri, varsa sayıyla orantılı koyulaşan marka rengi —
          // en az %15 opaklık kullanılır ki tek ziyaretli iller de görünür kalsın.
          const intensity = count === 0 ? 0 : 0.15 + (count / maxCount) * 0.75;
          return (
            <path
              key={province}
              d={path}
              className={count === 0 ? "fill-slate-200" : undefined}
              style={count > 0 ? { fill: `rgba(29, 78, 216, ${intensity})` } : undefined}
              stroke={isHovered ? "#0f172a" : "#fff"}
              strokeWidth={isHovered ? 1.5 : 0.75}
              strokeLinejoin="round"
              onMouseMove={(e) => setHovered({ province, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {TR_PROVINCES.map((province) => {
          const count = data[province] ?? 0;
          if (count === 0) return null;
          const centroid = TR_PROVINCE_CENTROIDS[province];
          if (!centroid) return null;
          const [x, y] = centroid;
          return (
            <text
              key={province}
              x={x}
              y={y}
              textAnchor="middle"
              className="pointer-events-none select-none fill-white text-[9px] font-bold"
              style={{ paintOrder: "stroke", stroke: "#1d4ed8", strokeWidth: 2 }}
            >
              {count}
            </text>
          );
        })}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: hovered.x + 14, top: hovered.y + 14 }}
        >
          <p className="font-bold">{hovered.province}</p>
          <p className="mt-0.5 text-slate-300">
            {(data[hovered.province] ?? 0) > 0
              ? `Bugün ${data[hovered.province]} ziyaretçi aldı`
              : "Bugün ziyaret yok"}
          </p>
        </div>
      )}
      <p className="mt-1 text-center text-xs text-slate-400">
        Konumlar IP tabanlı ve yaklaşıktır, il sınırları basitleştirilmiştir.
      </p>
    </div>
  );
}
