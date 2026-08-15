import { TR_PROVINCE_PATHS, TR_PROVINCE_CENTROIDS } from "@/lib/turkeyProvincePaths";
import { ablativeSuffix } from "@/lib/geo";
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
const WIDTH = 760;
const HEIGHT = 340;

export default function TurkeyVisitorMap({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((sum, c) => sum + c, 0);
  const maxCount = Math.max(1, ...Object.values(data));

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
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={16} className="fill-slate-50" />
        {TR_PROVINCES.map((province) => {
          const path = TR_PROVINCE_PATHS[province];
          if (!path) return null;
          const count = data[province] ?? 0;
          // Ziyaret yoksa nötr gri, varsa sayıyla orantılı koyulaşan marka rengi —
          // en az %15 opaklık kullanılır ki tek ziyaretli iller de görünür kalsın.
          const intensity = count === 0 ? 0 : 0.15 + (count / maxCount) * 0.75;
          return (
            <path
              key={province}
              d={path}
              className={count === 0 ? "fill-slate-200" : undefined}
              style={count > 0 ? { fill: `rgba(29, 78, 216, ${intensity})` } : undefined}
              stroke="#fff"
              strokeWidth={0.75}
              strokeLinejoin="round"
            >
              <title>
                {count > 0
                  ? `Bugün ${province}${ablativeSuffix(province)} ${count} ziyaretçi aldınız`
                  : `${province}: bugün ziyaret yok`}
              </title>
            </path>
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
      <p className="mt-1 text-center text-xs text-slate-400">
        Konumlar IP tabanlı ve yaklaşıktır, il sınırları basitleştirilmiştir.
      </p>
    </div>
  );
}
