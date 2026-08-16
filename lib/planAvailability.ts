// Şirket resmi kuruluşu ve vergi/fatura süreçleri tamamlanana kadar yalnızca
// Ücretsiz plan kabul ediliyor — ücretli planlar (Pro, İşletme, İşletme Yıllık)
// için henüz kurumsal olarak fatura kesilemiyor. Bu, KVKK sayfasındaki
// adres/telefon placeholder'ıyla (bkz. app/kvkk) aynı geçici durumun bir sonucu.
//
// Şirket kuruluşu tamamlandığında bu değeri true yapmak yeterli — hem sunucu
// tarafı engel (app/api/shop/plan) hem arayüz (components/PlanSelector) buradan
// okur, başka hiçbir yerin değiştirilmesi gerekmez.
export const PAID_PLANS_ENABLED = false;

export const PAID_PLANS_DISABLED_MESSAGE =
  "Şu anda yalnızca Ücretsiz plan kullanılabiliyor. Şirket kuruluş işlemlerimiz tamamlanınca ücretli planlar (Pro, İşletme) yeniden açılacak.";
