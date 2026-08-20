// Dashboard'daki "Son görüntülediğiniz araçlar" şeridi için — sunucu tarafında
// ayrı bir "görüntüleme" kaydı tutmuyoruz (her araç sayfası ziyaretinde ekstra
// Blob yazımı gerektirmemesi için bilinçli tercih). Bunun yerine tarayıcının
// localStorage'ında son birkaç aracı tutuyoruz.
// Yazan: components/VehicleDetailView.tsx (araç detay sayfası açılınca).
// Okuyan: components/RecentlyViewedVehicles.tsx (dashboard'da).
//
// ÖNEMLİ (20 Ağustos 2026'da düzeltildi): Anahtar shopId ile SCOPE'LANMALI.
// Önceden tek, sabit bir anahtar ("otoHafizaRecentVehicles") kullanılıyordu —
// aynı tarayıcıdan birden fazla bayi hesabına giriş yapıldığında (ör. ortak
// bir bilgisayar, bir demo/test hesabı açılması ya da bir işletmenin birden
// fazla şubesi aynı cihazı paylaşması) önceki hesabın plaka/marka/model
// bilgileri YENİ hesabın panelinde görünüyordu — bu bir bayiden diğerine
// kişisel veri (plaka) sızıntısı anlamına gelir. Artık her hesap kendi
// anahtarını kullanıyor, shopId yoksa (oturum yoksa) hiçbir şey okunmaz/yazılmaz.
export const RECENT_VEHICLES_KEY_PREFIX = "otoHafizaRecentVehicles:";
export const MAX_RECENT_VEHICLES = 5;

export interface RecentVehicleEntry {
  id: string;
  plateDisplay: string;
  brand: string;
  model: string;
}

export function recordRecentVehicle(shopId: string | null | undefined, entry: RecentVehicleEntry) {
  if (!shopId) return;
  try {
    const key = RECENT_VEHICLES_KEY_PREFIX + shopId;
    const raw = localStorage.getItem(key);
    const prev: RecentVehicleEntry[] = raw ? JSON.parse(raw) : [];
    const next = [entry, ...prev.filter((v) => v.id !== entry.id)].slice(0, MAX_RECENT_VEHICLES);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // localStorage kullanılamıyorsa (gizli sekme, izin engeli vb.) sessizce yok say —
    // bu özellik yalnızca bir kolaylık, kritik bir işlev değil.
  }
}

export function readRecentVehicles(shopId: string | null | undefined): RecentVehicleEntry[] {
  if (!shopId) return [];
  try {
    const raw = localStorage.getItem(RECENT_VEHICLES_KEY_PREFIX + shopId);
    return raw ? (JSON.parse(raw) as RecentVehicleEntry[]) : [];
  } catch {
    return [];
  }
}
