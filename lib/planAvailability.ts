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
// 18 Ağustos 2026 GÜNCELLEMESİ: Abonelik Checkout Form akışı (/dashboard/plan/
// odeme) sandbox'ta uçtan uca başarıyla test edildi — sorun iyzico'nun CDN'i
// değil, next.config.js'teki CSP'nin *.iyzipay.com'a izin vermemesiydi, bu
// düzeltildi (bkz. next.config.js script-src/connect-src/frame-src). Test
// için bu bayrak geçici olarak true yapılmıştı, test tamamlandığı için
// tekrar false'a alındı.
//
// 21 Ağustos 2026 GÜNCELLEMESİ: iyzico başvuru incelemesi kapsamında konsol
// logu/HAR/ekran kaydı istedi — bunları üretebilmek için bayrak GEÇİCİ olarak
// tekrar true yapıldı. Kanıtlar toplanıp iyzico'ya iletildikten sonra, Zeki
// gerçek lansmana hazır olduğuna karar verene kadar bu değer tekrar false'a
// alınmalı (bkz. SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md madde 1).
export const PAID_PLANS_ENABLED = true;

// 24 Ağustos 2026: "Kurucu Servis" kampanyası (ilk 100 kayıt için ömür boyu
// %50 indirim taahhüdü) komple iptal edildi — Zeki ayrı bir kampanya
// planlıyor. FOUNDING_SERVICE_SLOTS/FOUNDING_SERVICE_DISCOUNT_PERCENT
// sabitleri, Shop.foundingServiceRank alanı, blobStore.claimFoundingServiceRank/
// getFoundingServiceCount fonksiyonları ve ilgili UI (ana sayfa, PlanSelector,
// /dashboard/plan) kaldırıldı; hukuki metinlerdeki (Abonelik Politikası Md.11,
// Saha Partner Sözleşmesi eski Md.6) karşılık gelen maddeler de kaldırıldı.
export const PAID_PLANS_DISABLED_MESSAGE = `Şu anda yalnızca Ücretsiz plan kullanılabiliyor. Ücretli planlar (Pro, İşletme) kısa süre içinde açılacak.`;
