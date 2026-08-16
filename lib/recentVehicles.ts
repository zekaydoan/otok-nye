// Dashboard'daki "Son görüntülediğiniz araçlar" şeridi için — sunucu tarafında
// ayrı bir "görüntüleme" kaydı tutmuyoruz (her araç sayfası ziyaretinde ekstra
// Blob yazımı gerektirmemesi için bilinçli tercih). Bunun yerine tarayıcının
// localStorage'ında son birkaç aracı tutuyoruz.
// Yazan: components/VehicleDetailView.tsx (araç detay sayfası açılınca).
// Okuyan: components/RecentlyViewedVehicles.tsx (dashboard'da).
export const RECENT_VEHICLES_KEY = "otoHafizaRecentVehicles";
export const MAX_RECENT_VEHICLES = 5;

export interface RecentVehicleEntry {
  id: string;
  plateDisplay: string;
  brand: string;
  model: string;
}

export function recordRecentVehicle(entry: RecentVehicleEntry) {
  try {
    const raw = localStorage.getItem(RECENT_VEHICLES_KEY);
    const prev: RecentVehicleEntry[] = raw ? JSON.parse(raw) : [];
    const next = [entry, ...prev.filter((v) => v.id !== entry.id)].slice(0, MAX_RECENT_VEHICLES);
    localStorage.setItem(RECENT_VEHICLES_KEY, JSON.stringify(next));
  } catch {
    // localStorage kullanılamıyorsa (gizli sekme, izin engeli vb.) sessizce yok say —
    // bu özellik yalnızca bir kolaylık, kritik bir işlev değil.
  }
}

export function readRecentVehicles(): RecentVehicleEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_VEHICLES_KEY);
    return raw ? (JSON.parse(raw) as RecentVehicleEntry[]) : [];
  } catch {
    return [];
  }
}
