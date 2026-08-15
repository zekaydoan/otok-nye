import { TR_PROVINCE_COORDS } from "@/lib/geo";

// Türkiye'nin gerçek kıyı şeridini piksel piksel çizmek yerine (elle
// hazırlanan bir taslak kolayca yanlış/çarpık görünebilir), bilinen il
// merkezi enlem/boylamlarını basit bir eşdikdörtgen izdüşümle bir SVG
// tuvaline yerleştirip ziyaret sayısıyla orantılı baloncuklar çiziyoruz —
// haritanın arka planı yalnızca yumuşak, dekoratif bir kart; asıl bilgi
// baloncukların konumu/boyutu ve native <title> tooltip'lerinde.
const LAT_MIN = 35.8;
const LAT_MAX = 42.3;
const LON_MIN = 25.5;
const LON_MAX = 44.9;
const WIDTH = 760;
const HEIGHT = 340;
const PADDING = 24;

function project(lat: number, lon: number): [number, number] {
  const x = PADDING + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (WIDTH - PADDING * 2);
  const y = PADDING + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (HEIGHT - PADDING * 2);
  return [x, y];
}

export default function TurkeyVisitorMap({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, count]) => count > 0);
  const maxCount = Math.max(1, ...entries.map(([, c]) => c));

  if (entries.length === 0) {
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
        aria-label="Bugünkü ziyaretçilerin şehirlere göre dağılımını gösteren Türkiye haritası"
      >
        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          rx={16}
          className="fill-slate-50"
        />
        {entries.map(([province, count]) => {
          const coords = TR_PROVINCE_COORDS[province as keyof typeof TR_PROVINCE_COORDS];
          if (!coords) return null;
          const [x, y] = project(coords[0], coords[1]);
          const radius = 5 + Math.sqrt(count / maxCount) * 20;
          return (
            <g key={province}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                className="fill-brand-500/70 stroke-brand-700"
                strokeWidth={1}
              >
                <title>
                  {province}: {count} ziyaret
                </title>
              </circle>
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                className="pointer-events-none select-none fill-white text-[9px] font-bold"
              >
                {count}
              </text>
              <text
                x={x}
                y={y + radius + 11}
                textAnchor="middle"
                className="pointer-events-none select-none fill-slate-500 text-[9px] font-medium"
              >
                {province}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-xs text-slate-400">
        Konumlar IP tabanlı ve yaklaşıktır, il sınırları kesin değildir.
      </p>
    </div>
  );
}
