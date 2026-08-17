# Şirket Kuruluşu Sonrası Yapılacaklar

Bu dosya, şirket resmi olarak kurulup vergi levhası/imza sirküleri gibi evraklar
eline geçtiğinde geri dönüp düzeltilmesi gereken, şu an bilinçli olarak
placeholder/kapalı bırakılmış yerlerin listesidir. Zeki'nin "şirket ile ilgili
işlemleri yapmaya başladık" demesi üzerine bu liste sırayla ele alınmalı.

## 1. Ücretli planları aç — otomatik tekrarlayan tahsilat (iyzico Abonelik)

**Karar güncellendi (16 Ağustos 2026, ikinci görüşme):** Önce manuel akışla
açma kararı alınmıştı, sonra Zeki bunu değiştirdi — **baştan iyzico'nun
Abonelik API'siyle otomatik tekrarlayan tahsilata gidilecek**, manuel
onay/tahsilat kalıcı çözüm OLARAK KULLANILMAYACAK. Aşağıdaki plan bunu
hedefler.

### Neden manuel yetmiyor (netleşen gerekçe)

`/api/shop/plan` şu an sadece bir *talep* akışı: bayı plan seçer → admin'e
mail gider → admin banka havalesi/elden ödemeyi görür → elle aktive eder.
Ama sistemde **hiçbir yenileme/vade takibi yok** (`Shop` tipinde
`planRenewsAt`/`planExpiresAt` gibi bir alan yok, `recordPlanStart` yalnızca
istatistik için ilk başlangıcı loglar). Yani plan bir kez aktive edilince,
ödeme yapılsa da yapılmasa da elle indirilmediği sürece süresiz aktif kalır
— her ay "kimden tahsilat isteyeceğim" tamamen hafızaya kalır. 5-10
müşteride bile riskli.

### iyzico Abonelik API — araştırılan gerçek durum

- **Ücretli bir eklenti:** İlk 3 ay ücretsiz, sonrasında **199₺/ay**. Bu,
  plan fiyatlandırmasına/maliyet hesabına dahil edilmeli.
- **Ön koşul:** iyzico hesabında "Abonelik" özelliğinin aktif olması gerekiyor.
  - Sandbox (test) ortamı için: hesaba kayıtlı e-posta veya üye işyeri
    numarası **entegrasyon@iyzico.com** adresine iletilmeli, orada aktive
    ediyorlar.
  - Gerçek hesapta: iyzico panelinde **"Eklentiler"** sayfasından satın
    alınıyor; sayfada görünmüyorsa **destek@iyzico.com** ile iletişime
    geçilmeli.
- **4 adımlı entegrasyon:** (1) Ürün oluşturma, (2) Ödeme Planı oluşturma
  (aylık/yıllık, OtoHafıza'daki Pro/İşletme/İşletme Yıllık planlarının her
  biri için ayrı bir iyzico "plan" olacak), (3) Abonelik Başlatma (checkout
  form veya direkt API isteğiyle, plan referans koduyla), (4) Webhook —
  her tekrarlayan ödemede iyzico bildirim gönderiyor, biz bu bildirimle
  `Shop.plan`'i güncel tutacağız (başarısızsa düşürme, retry servisi de var).
  Detaylı adımlar: docs.iyzico.com/urunler/abonelik/abonelik-entegrasyonu
- **Deneme süresi desteği var** — bir ödeme planına deneme süresi
  tanımlanabiliyor, kart bilgisi deneme başında kaydedilip süre bitince
  otomatik tahsilat başlıyor. İleride "X gün ücretsiz dene, otomatik geç"
  akışı için kullanılabilir, şimdilik zorunlu değil.
- Sadece kredi kartıyla çalışıyor (başka ödeme yöntemi yok).

### Yapılacaklar (şirket kuruluşu tamamlandığında sırayla)

1. ⏳ **Bekliyor — Zeki'nin yapması gerekiyor.** iyzico hesabına kayıtlı
   e-posta/üye işyeri no'yu entegrasyon@iyzico.com'a iletip sandbox'ta
   Abonelik özelliğini (ve mümkünse webhook signature özelliğini) aktive
   ettirmek. Bu adım kod değil — hesap sahipliği gerektiriyor, ben
   gönderemem.
2. ✅ **Kod tarafı hazırlandı (17 Ağustos 2026):** `lib/iyzicoSubscription.ts`
   yazıldı — ürün oluşturma, ödeme planı oluşturma, Checkout Form ile abonelik
   başlatma, sonuç sorgulama (GET), webhook imza doğrulama. `lib/iyzico.ts`'teki
   `buildAuthHeaders`/`getBaseUrl`/`requireEnv` dışa açılıp yeniden kullanıldı.
   **UÇTAN UCA TEST EDİLMEDİ** — 1. madde tamamlanmadan sandbox'a erişim yok.
   GET isteğinin (sonuç sorgulama) imza hesaplaması dokümantasyonda net
   örneklenmemişti, en olası yorum uygulandı — sandbox erişimi olunca ilk
   test edilmesi gereken kısım burası.
3. ✅ **Tamamlandı:** `Shop` tipine `planRenewsAt`, `iyzicoSubscriptionReferenceCode`,
   `iyzicoCustomerReferenceCode`, `iyzicoPricingPlanReferenceCode` eklendi.
   `lib/blobStore.ts`'e `linkSubscriptionToShop`/`getSubscriptionShopLink`
   eklendi (subscriptionReferenceCode -> {shopId, plan} eşlemesi).
4. ✅ **Tamamlandı:** `app/api/webhooks/iyzico-abonelik/route.ts` kuruldu —
   imza doğrular, `subscription.order.success`'te planı/`planRenewsAt`'i
   günceller, `subscription.order.failure`'da admin'e mail atar (otomatik
   düşürme yapmaz, bilinçli tercih). iyzico Merchant Panel'de "Ayarlar >
   Firma Ayarları > İşyeri Bildirimleri" altındaki abonelik bildirim URL'sine
   bu endpoint tanımlanmalı — `IYZICO_MERCHANT_ID` ortam değişkeni de gerekli
   (bkz. `.env.example`).
5. ⏳ **Henüz yapılmadı — asıl kalan iş:** `/api/shop/plan` mevcut "talep → admin onayı" akışından, doğrudan
   abonelik başlatan bir akışa geçirilir.
6. ⏳ `PAID_PLANS_ENABLED` en son, her şey test edildikten sonra `true` yapılır.

Sandbox'ta geliştirme, gerçek şirket kuruluşunu beklemeden 1. adım
tamamlanınca başlayabilir — üretim/gerçek tahsilat için ise gerçek iyzico
hesabında Abonelik eklentisinin satın alınması (ki bu muhtemelen kurumsal
hesap/vergi bilgisi ister) ve `PAID_PLANS_ENABLED` gerçek şirket kuruluşunu
bekliyor.

## 2. KVKK Aydınlatma Metni — adres/telefon

- **Dosya:** `app/kvkk/page.tsx`
- **Değişiklik:** `[Adres bekleniyor]` (2 yerde) ve `[Telefon bekleniyor]`
  (1 yerde) gerçek şirket adresi/telefonuyla değiştirilmeli.

## 3. Kullanım Şartları — firma unvanı

- **Dosya:** `app/kullanim-sartlari/page.tsx`
- **Değişiklik:** `[Firma Unvanınız]` (2 yerde) gerçek unvanla değiştirilmeli.
  Sayfa üstündeki uyarı notunun (bir hukuk danışmanına onaylatma tavsiyesi)
  kaldırılıp kaldırılmayacağına da o sırada karar verilebilir.

## 4. Mesafeli Satış Sözleşmesi — satıcı bilgileri

- **Dosya:** `app/mesafeli-satis-sozlesmesi/page.tsx`
- **Değişiklik:** "1. Taraflar" bölümündeki `[Firma Unvanı], [Adres], [Vergi
  Dairesi/No veya MERSİS No], [E-posta], [Telefon]` gerçek bilgilerle
  doldurulmalı. Sayfadaki cayma hakkı notunun da (yasal zorunluluk mu, gönüllü
  politika mı) bir danışmanla netleştirilmesi gerekiyor.

## 5. WhatsApp otomatik hatırlatma (Meta Business Verification)

- **Dosyalar:** `lib/whatsappReminder.ts`, `app/api/whatsapp/webhook/route.ts`, README.md ("Otomatik Hatırlatma Kurulumu")
- Meta'nın WhatsApp Business Platform'da sınırsız/canlı gönderim için istediği
  "Business Verification" süreci şirket evrakı gerektiriyor. Kuruluş
  tamamlanıp bir sağlayıcıyla (Meta Cloud API doğrudan mı, yoksa Netgsm gibi
  bir BSP mi — bu karar hâlâ bekliyor) anlaşma yapıldığında README'deki
  adımlar izlenmeli (`WHATSAPP_API_KEY`/`WHATSAPP_API_URL` ortam değişkenleri
  + `sendWhatsAppReminder` fonksiyonunun seçilen sağlayıcının gerçek API
  formatına uyarlanması).
- Not: Manuel "wa.me" WhatsApp linkleri (WhatsApp Business hattı, float buton)
  zaten canlı ve bu maddeden etkilenmiyor — yalnızca *otomatik* gece
  hatırlatma taraması bekliyor.

## 6. Fatura bilgisi zorunluluğu — hatırlatma (değişiklik gerekmiyor, bilgi amaçlı)

Free plan dahil her bayiden fatura bilgisi zorunlu tutuluyor
(`lib/billing.ts`, `app/api/vehicles`, `app/api/vehicles/bulk`,
`app/api/vehicles/[id]/records`, `app/api/randevular`, `app/api/etiket-siparis`).
Bu kural şirket kuruluşundan bağımsız, kalıcı — burada bir değişiklik
gerekmiyor, sadece bağlamı hatırlatmak için not düşüldü.

## 7. Kurucu Servis kontenjanı — ömür boyu %50 Pro indirimi uygulanmalı

- **Dosyalar:** `lib/planAvailability.ts` (`FOUNDING_SERVICE_SLOTS`,
  `FOUNDING_SERVICE_DISCOUNT_PERCENT`), `lib/types.ts` (`Shop.foundingServiceRank`),
  `lib/blobStore.ts` (`claimFoundingServiceRank`, `getFoundingServiceCount`),
  `app/api/auth/signup/route.ts`.
- **Bağlam:** "Ücretli planlar yakında açılacak" mesajı tek başına güven
  kırıcı bulundu (16 Ağustos 2026), bunun yerine somut bir teklife çevrildi:
  ilk `FOUNDING_SERVICE_SLOTS` (şu an 100) kayıt olan servis kalıcı olarak
  `Shop.foundingServiceRank` alanını taşıyor. Bu, ana sayfa fiyatlandırma
  bölümünde ve `/dashboard/plan`'da zaten gösteriliyor.
- **Yapılması gereken:** `PAID_PLANS_ENABLED` `true` yapılıp Pro fiyatlandırması
  (iyzico Abonelik ödeme planı, madde 1) devreye girdiğinde, `foundingServiceRank`
  alanı DOLU olan bayiler için Pro fiyatı normalin (o an ne olursa olsun)
  %`FOUNDING_SERVICE_DISCOUNT_PERCENT`'i olmalı — ÖMÜR BOYU, sadece ilk ay değil.
  Bu muhtemelen iyzico'da bu bayiler için ayrı bir indirimli "Ödeme Planı"
  (pricing plan) oluşturup `iyzicoPricingPlanReferenceCode`'u ona bağlamak
  anlamına gelir. Kaç bayinin bu haktan yararlanacağını görmek için:
  `listAllShops()` sonucunu `foundingServiceRank` alanına göre filtrelemek
  yeterli (admin tarafında ayrı bir liste/rapor sayfası bu maddeyle birlikte
  eklenebilir, henüz eklenmedi).
- **Dikkat:** Bu, kontenjanı gerçekten dolduran (~100 kayıt) bir aciliyet
  senaryosu düşünülerek tasarlandı — kontenjan hiç dolmazsa (ör. 10-20 bayide
  kalırsa) bu madde yine de geçerli, sadece daha az kişiyi kapsar.

---
Bu listeyi güncel tutmak için: yeni bir "şirket kuruluşunu bekliyor" durumu
eklerken lütfen bu dosyaya da bir madde ekleyin.
