// Şirket resmi kuruluşu ve vergi/fatura süreçleri tamamlanana kadar yalnızca
// Ücretsiz plan kabul ediliyor — ücretli planlar (Pro, İşletme, İşletme Yıllık)
// için henüz kurumsal olarak fatura kesilemiyor. Bu, KVKK sayfasındaki
// adres/telefon placeholder'ıyla (bkz. app/kvkk) aynı geçici durumun bir sonucu.
//
// Şirket kuruluşu tamamlandığında bu değeri true yapmak yeterli — hem sunucu
// tarafı engel (app/api/shop/plan) hem arayüz (components/PlanSelector) buradan
// okur, başka hiçbir yerin değiştirilmesi gerekmez.
export const PAID_PLANS_ENABLED = false;

// ---- Kurucu Servis kontenjanı ----
// "Ücretli planlar yakında açılacak" tek başına güven kırıcı ve belirsiz —
// bunun yerine somut, süreli bir teklife çeviriyoruz: ilk FOUNDING_SERVICE_SLOTS
// kayıt olan servis, Pro paketi açıldığında ömür boyu %FOUNDING_SERVICE_DISCOUNT_PERCENT
// indirimli kullanır. Sıra numarası kayıt anında atanır ve kalıcıdır (bkz.
// lib/types.ts Shop.foundingServiceRank, lib/blobStore.ts claimFoundingServiceRank).
// Bu dosya client component'lere de import edildiği için (components/PlanSelector)
// yalnızca sabit/saf değerler içermeli — herhangi bir sunucu tarafı veri
// okuması (blobStore vb.) buraya EKLENMEMELİ.
export const FOUNDING_SERVICE_SLOTS = 100;
export const FOUNDING_SERVICE_DISCOUNT_PERCENT = 50;

export const PAID_PLANS_DISABLED_MESSAGE = `Şu anda yalnızca Ücretsiz plan kullanılabiliyor. Kurucu Servis kontenjanı: ilk ${FOUNDING_SERVICE_SLOTS} kayıt olan servis, Pro paketi açıldığında ömür boyu %${FOUNDING_SERVICE_DISCOUNT_PERCENT} indirimli kullanır.`;
