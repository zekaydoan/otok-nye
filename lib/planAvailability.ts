// Şirket resmi kuruluşu ve vergi/fatura süreçleri tamamlanana kadar yalnızca
// Ücretsiz plan kabul ediliyor — ücretli planlar (Pro, İşletme, İşletme Yıllık)
// için henüz kurumsal olarak fatura kesilemiyor. Bu, KVKK sayfasındaki
// adres/telefon placeholder'ıyla (bkz. app/kvkk) aynı geçici durumun bir sonucu.
//
// Şirket kuruluşu tamamlandığında bu değeri true yapmak yeterli — hem sunucu
// tarafı engel (app/api/shop/plan) hem arayüz (components/PlanSelector) buradan
// okur, başka hiçbir yerin değiştirilmesi gerekmez.
//
// 17 Ağustos 2026 uçtan uca test sonucu: iyzico Abonelik Checkout Form API
// çağrısı (initializeSubscriptionCheckoutForm) başarılı — token ve
// checkoutFormContent doğru dönüyor. O tarihte tarayıcıda ödeme iframe'ini
// çizen iyzico'nun kendi statik dosyası (sandbox-static.iyzipay.com/
// checkoutform/v2/bundle.js) 503 dönüyordu (bkz. SIRKET_KURULUSU_SONRASI_
// YAPILACAKLAR.md madde 1/5) — bu sorun sonradan iyzico tarafında çözüldü
// (18 Ağustos 2026, etiket sipariş akışı sandbox'ta uçtan uca başarıyla
// tamamlandı).
//
// GEÇİCİ TEST AÇMASI (18 Ağustos 2026): Zeki'nin Abonelik Checkout Form
// akışını (/dashboard/plan/odeme) da iyzico sandbox test kartıyla uçtan uca
// deneyebilmesi için bu bayrak geçici olarak true yapıldı. Şirket kuruluşu
// HÂLÂ tamamlanmadı — fatura kesme yeterliliği yok. Test tamamlanır
// tamamlanmaz bu değer false'a geri alınmalı (bkz. commit geçmişi); aksi
// hâlde gerçek ziyaretçiler ücretli planı "satın alınabilir" görür ve bu,
// şirketin henüz fatura kesemediği bir üründe yanıltıcı ticari uygulama
// riskine yol açar (bkz. hukuki/00_INDEKS_ve_RISK_ANALIZI.md, risk #20).
export const PAID_PLANS_ENABLED = true;

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
