import type { NextRequest } from "next/server";
import { TR_PROVINCES } from "./types";

// Admin istatistik panelindeki "hangi şehirden kaç ziyaret" haritası
// (bkz. components/TurkeyVisitorMap.tsx, app/api/analytics/pageview/route.ts)
// için il merkezlerinin yaklaşık enlem/boylamı. Netlify'ın IP tabanlı coğrafi
// konum verisi zaten yaklaşık olduğundan (bkz. x-nf-geo header), burada da
// kesin sınır/poligon değil, il merkezine yakın tek bir nokta yeterli —
// haritadaki baloncuklar bu noktalara yerleştirilir.
export const TR_PROVINCE_COORDS: Record<(typeof TR_PROVINCES)[number], [number, number]> = {
  Adana: [37.0, 35.32],
  Adıyaman: [37.76, 38.28],
  Afyonkarahisar: [38.76, 30.54],
  Ağrı: [39.72, 43.05],
  Amasya: [40.65, 35.83],
  Ankara: [39.93, 32.86],
  Antalya: [36.9, 30.71],
  Artvin: [41.18, 41.82],
  Aydın: [37.85, 27.85],
  Balıkesir: [39.65, 27.89],
  Bilecik: [40.15, 29.98],
  Bingöl: [38.88, 40.5],
  Bitlis: [38.4, 42.11],
  Bolu: [40.74, 31.61],
  Burdur: [37.72, 30.29],
  Bursa: [40.18, 29.06],
  Çanakkale: [40.15, 26.41],
  Çankırı: [40.6, 33.62],
  Çorum: [40.55, 34.95],
  Denizli: [37.77, 29.09],
  Diyarbakır: [37.91, 40.24],
  Edirne: [41.68, 26.56],
  Elazığ: [38.68, 39.22],
  Erzincan: [39.75, 39.49],
  Erzurum: [39.9, 41.27],
  Eskişehir: [39.78, 30.52],
  Gaziantep: [37.06, 37.38],
  Giresun: [40.91, 38.39],
  Gümüşhane: [40.46, 39.48],
  Hakkari: [37.58, 43.74],
  Hatay: [36.2, 36.16],
  Isparta: [37.76, 30.55],
  Mersin: [36.8, 34.63],
  İstanbul: [41.01, 28.98],
  İzmir: [38.42, 27.14],
  Kars: [40.6, 43.09],
  Kastamonu: [41.38, 33.78],
  Kayseri: [38.73, 35.49],
  Kırklareli: [41.73, 27.22],
  Kırşehir: [39.15, 34.16],
  Kocaeli: [40.85, 29.88],
  Konya: [37.87, 32.48],
  Kütahya: [39.42, 29.98],
  Malatya: [38.36, 38.31],
  Manisa: [38.61, 27.43],
  Kahramanmaraş: [37.57, 36.93],
  Mardin: [37.31, 40.74],
  Muğla: [37.22, 28.36],
  Muş: [38.73, 41.49],
  Nevşehir: [38.62, 34.72],
  Niğde: [37.97, 34.68],
  Ordu: [40.98, 37.88],
  Rize: [41.02, 40.52],
  Sakarya: [40.76, 30.4],
  Samsun: [41.29, 36.33],
  Siirt: [37.93, 41.94],
  Sinop: [42.03, 35.15],
  Sivas: [39.75, 37.02],
  Tekirdağ: [40.98, 27.51],
  Tokat: [40.32, 36.55],
  Trabzon: [41.0, 39.72],
  Tunceli: [39.11, 39.55],
  Şanlıurfa: [37.16, 38.79],
  Uşak: [38.68, 29.41],
  Van: [38.49, 43.38],
  Yozgat: [39.82, 34.81],
  Zonguldak: [41.46, 31.79],
  Aksaray: [38.37, 34.03],
  Bayburt: [40.26, 40.22],
  Karaman: [37.18, 33.22],
  Kırıkkale: [39.85, 33.52],
  Batman: [37.89, 41.13],
  Şırnak: [37.52, 42.46],
  Bartın: [41.63, 32.34],
  Ardahan: [41.11, 42.7],
  Iğdır: [39.92, 44.05],
  Yalova: [40.65, 29.28],
  Karabük: [41.2, 32.63],
  Kilis: [36.72, 37.12],
  Osmaniye: [37.07, 36.25],
  Düzce: [40.84, 31.16],
};

// Türkiye'nin çok basitleştirilmiş dış hattı (kıyı şeridi + kara sınırı,
// enlem/boylam çiftleri, saat yönünde) — components/TurkeyVisitorMap.tsx'te
// dekoratif bir siluet olarak çizilir. Gerçek sınırın birebir aynısı değil,
// tanınabilir kabaca bir yaklaşımdır (ör. Ege kıyısındaki çok sayıda küçük
// koy/yarımada tek tek çizilmedi) — amaç idari kesinlik değil, "bu Türkiye"
// dedirtecek kadar doğru bir görsel çerçeve sağlamak.
export const TR_OUTLINE: [number, number][] = [
  [41.75, 26.6],
  [41.4, 26.3],
  [40.9, 26.2],
  [39.5, 26.2],
  [38.4, 26.3],
  [37.8, 27.0],
  [37.05, 27.4],
  [36.65, 28.2],
  [36.2, 29.6],
  [36.1, 30.7],
  [36.0, 32.0],
  [36.2, 33.6],
  [36.6, 34.9],
  [36.2, 35.9],
  [36.0, 36.2],
  [36.6, 36.5],
  [37.0, 38.0],
  [37.1, 39.5],
  [37.3, 42.0],
  [37.2, 44.0],
  [39.7, 44.8],
  [40.0, 43.6],
  [41.0, 43.5],
  [41.5, 41.5],
  [41.1, 39.7],
  [41.3, 38.0],
  [41.3, 36.3],
  [42.0, 35.2],
  [41.7, 33.8],
  [41.6, 32.3],
  [41.3, 31.6],
  [41.1, 29.1],
  [41.4, 28.0],
];

// Türkçe karakterleri sadeleştirip küçük harfe çevirir — hem IP coğrafi konum
// servislerinin (MaxMind tabanlı, genelde ASCII/İngilizce il adı döndürür,
// ör. "Istanbul", "Izmir", "Sanliurfa") hem TR_PROVINCES'teki Türkçe yazımın
// aynı anahtara düşmesini sağlar.
function foldTurkish(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

// Yaygın alternatif/İngilizce yazımlar — foldTurkish tek başına çoğu eşleşmeyi
// (Istanbul/İstanbul, Izmir/İzmir gibi) zaten çözer, bu liste yalnızca kökten
// farklı yazılan birkaç istisnayı kapsar.
const PROVINCE_ALIASES: Record<string, (typeof TR_PROVINCES)[number]> = {
  urfa: "Şanlıurfa",
  marash: "Kahramanmaraş",
  kmaras: "Kahramanmaraş",
  afyon: "Afyonkarahisar",
  izmit: "Kocaeli",
  adapazari: "Sakarya",
};

const FOLDED_PROVINCE_LOOKUP: Record<string, (typeof TR_PROVINCES)[number]> = Object.fromEntries(
  TR_PROVINCES.map((p) => [foldTurkish(p), p])
) as Record<string, (typeof TR_PROVINCES)[number]>;

// Netlify'ın x-nf-geo header'ından gelen il/şehir adını (İngilizce/ASCII
// olabilir) TR_PROVINCES'teki kanonik Türkçe yazıma eşler. Eşleşme yoksa null
// döner — haritada gösterilmez ama toplam ziyaret sayacını etkilemez.
export function normalizeProvinceName(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const folded = foldTurkish(raw);
  return FOLDED_PROVINCE_LOOKUP[folded] ?? PROVINCE_ALIASES[folded] ?? null;
}

// Netlify, her isteğe CDN seviyesinde eklediği x-nf-geo header'ında IP tabanlı
// (yaklaşık) coğrafi konum bilgisini base64 + JSON olarak taşır — ayrı bir
// ücretli servise veya IP'nin herhangi bir yerde saklanmasına gerek kalmadan
// "hangi ilden" bilgisini buradan çıkarabiliyoruz. Header yoksa (yerel
// geliştirme, header'ı desteklemeyen bir ortam vb.) sessizce null döner.
// Hem sayfa görüntüleme (app/api/analytics/pageview) hem "şu an sitede"
// nabız (app/api/analytics/heartbeat) uç noktaları bu tek fonksiyonu paylaşır.
export function getProvinceFromRequest(req: NextRequest): string | null {
  const raw = req.headers.get("x-nf-geo");
  if (!raw) return null;
  try {
    const geo = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as {
      subdivision?: { name?: string };
      city?: string;
    };
    return normalizeProvinceName(geo.subdivision?.name) ?? normalizeProvinceName(geo.city);
  } catch {
    return null;
  }
}

// "İstanbul'dan" ama "Kayseri'den" — Türkçe -dan/-den (ayrılma hâli) eki, ilin
// adındaki SON ünlü harfin ince (e, i, ö, ü) mi kalın (a, ı, o, u) mü olduğuna
// göre değişir. Sabit bir ek ("Kayseri'dan" gibi) yanlış olurdu; bu yüzden her
// il adı için sondan geriye doğru tarayıp doğru eki hesaplıyoruz (bkz.
// components/TurkeyVisitorMap.tsx tooltip metni).
export function ablativeSuffix(word: string): "'dan" | "'den" {
  const frontVowels = new Set(["e", "i", "ö", "ü", "İ"]);
  const backVowels = new Set(["a", "ı", "o", "u", "I"]);
  for (let i = word.length - 1; i >= 0; i--) {
    const ch = word[i];
    if (frontVowels.has(ch)) return "'den";
    if (backVowels.has(ch)) return "'dan";
  }
  return "'dan";
}
