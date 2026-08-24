# OtoHafıza V2 — Şu An Nerede Kaldık (24 Ağustos 2026)

Bu belge, kod tabanı + proje dokümanları + görev listesi üzerinde yapılan
derin bir taramanın sonucudur. Amaç: kalan tüm açık işleri tek yerde toplamak.

---

## 1. Zeki'nin kararına/eylemine bağlı, açık maddeler

### 1.1 WhatsApp otomatik hatırlatma (Madde 5)
**Durum:** Beklemede — Zeki talimatıyla ("şu an beklemede").
Meta Business Verification + BSP (WhatsApp Business Solution Provider) vs.
doğrudan Meta API kararı Zeki'den bekleniyor. Detaylı yol haritası:
`SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md` madde 5.

### 1.2 E-Fatura entegrasyonu — Trendyol e-Faturam (Madde 8 / Task #149)
**Durum:** Beklemede — Zeki talimatıyla.
Görev listesindeki (#149) açıklama kısmen eskimiş: "vergi no + API anahtarı
bekleniyor" diyor, ama **vergi no artık mevcut** (VKN 7511125219, Mesir V.D.,
MERSİS 0751112521900001 — `SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md` madde 9'da
kayıtlı). Tek eksik: Zeki'nin bu VKN ile trendyolefaturam.com'da hesap açıp
panelden API/Web Servis entegrasyon anahtarı alması. Bu adım atıldığında
`lib/eFatura.ts` yazılıp iyzico webhook/callback + etiket sipariş akışına
bağlanacak (plan zaten belgelendi, task #148 tamamlandı).

### 1.3 Etiket hediye kararı (Task #60)
**Durum:** Beklemede — Zeki'nin "bu konu burada dursun, tekrar geleceğiz" dediği,
henüz karara bağlanmamış eski bir konu. Detay: `pazarlama/ETIKET_HEDIYE_KARARI_BEKLIYOR.md`.

### 1.4 Kurucu Servis'in yerine geçecek yeni kampanya
**Durum:** Beklemede — Zeki "bununla ilgili başka bir kampanya yapacağız" dedi
(Kurucu Servis'i iptal ederken). Henüz tanımlanmadı, kod tarafında hiçbir şey yok.

### 1.5 Task #48 (şemsiye görev)
`SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md`'deki maddelerin tamamlanma durumu:
madde 1 (iyzico Abonelik) ✅ tamamlandı, madde 7 (Kurucu Servis) ❌ iptal edildi,
madde 5 ve 8 yukarıdaki gibi beklemede. Bu üçü kapanmadan #48 açık kalacak.

---

## 2. Kod tabanında YANLIŞ/ESKİMİŞ olan yorumlar ve belgeler — ✅ DÜZELTİLDİ (24 Ağustos 2026)

Bu 4 dosyadaki yorum/dokümantasyon, "programda ödeme alınmamış gibi görünüyor"
uyarısı üzerine güncellendi (gerçek davranış zaten doğruydu, yalnızca metinler
eskiydi):

- **`README.md`, "Ödeme / Abonelik Notu"** — artık iyzico Abonelik'in canlıda,
  bağlı ve uçtan uca test edilmiş olduğunu anlatıyor.
- **`SECURITY_FIX_PLAN.md`, H1 bulgusu** — başlığa "✅ ÇÖZÜLDÜ (24 Ağustos 2026)"
  eklendi, hem Adım 1 (pendingPlan) hem Adım 2'nin (gerçek ödeme) tamamlandığını
  belirten bir güncelleme notu eklendi, belge başındaki özet satırı güncellendi.
- **`app/api/admin/shops/[id]/plan/route.ts`** — yorum artık bu endpoint'in
  birincil yol olmadığını, admin'in comp/özel durum istisnaları için elle
  müdahale ettiği bir araç olduğunu anlatıyor.
- **`lib/blobStore.ts` (`getPlanRevenueStats` üstü)** — "henüz gerçek tahsilat
  yok" ifadesi kaldırıldı, gerçek tahsilatın çalıştığı ama bu fonksiyonun hâlâ
  ilan fiyatı üzerinden tahmin ürettiği netleştirildi.

---

## 3. Bilinen, kabul edilmiş, aksiyon gerektirmeyen not

- **`README.md:43`** — `netlify/functions/send-maintenance-reminders.ts`
  fonksiyonunun filo büyüdükçe bir Background Function'a taşınması gerektiği
  notu. Şu an sorun değil, ileride ölçek büyüdüğünde hatırlatma amaçlı.

---

## 4. Tamamlanmış, kapanmış işler (referans için)

302 görevden 299'u tamamlandı. Bu oturumda kapananlar:
- iyzico Abonelik güvenlik düzeltmeleri (gerçek iptal API'si, tüm risk
  noktalarına bağlandı) — commit `909f9f0`.
- iyzico Abonelik canlıda doğrulandı (Netlify env + admin kurulum + Zeki'nin
  uçtan uca testi).
- Kurucu Servis kampanyası komple kaldırıldı (kod + 2 hukuki belge) —
  commit `627cc07`.

**Push bekleyen commit sayısı:** 8 (bu oturumdaki 3 + önceki oturumdan 5).

---

## Önerilen sıradaki adım

Madde 2'deki 4 dosya, davranış değiştirmeyen, düşük riskli yorum/dokümantasyon
düzeltmesi — istersen hemen yapıp aynı push'a eklerim. Madde 1'deki kalemler
ise senin kararını/eylemini bekliyor (WhatsApp BSP kararı, Trendyol hesabı,
etiket hediye kararı, yeni kampanya tasarımı).
