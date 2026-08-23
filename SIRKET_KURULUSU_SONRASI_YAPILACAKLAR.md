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

1. ✅ **Tamamlandı (17-18 Ağustos 2026).** Zeki sandbox hesabı açtı, API
   anahtarlarını (`IYZICO_API_KEY`/`IYZICO_SECRET_KEY`) Netlify ortam
   değişkenlerine ekleyip deploy etti, üye işyeri numarasını
   entegrasyon@iyzico.com'a iletti — **iyzico Abonelik modülünü sandbox
   hesabında aktive ettiğini onayladı.** `IYZICO_BASE_URL` zaten
   `https://sandbox-api.iyzipay.com` olarak `.env.example`'da tanımlı. Test
   kartları: https://docs.iyzico.com/ek-bilgiler/test-kartlari (gerçek kart
   bilgisi ASLA kullanılmamalı/girilmemeli, sandbox'ta yalnızca bu test
   kartları geçerli).
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
5. ✅ **Kod tarafı hazırlandı (18 Ağustos 2026):** `/api/shop/plan` artık ücretli
   bir plan seçildiğinde admin'e "onay bekliyor" e-postası atmıyor — doğrudan
   iyzico Abonelik Checkout Form'unu başlatıp `checkoutFormContent`'i döner.
   Yeni dosyalar: `app/dashboard/plan/odeme` (T.C. Kimlik No toplayan sayfa),
   `components/SubscriptionCheckoutStarter`/`SubscriptionCheckoutForm`
   (checkout form'u embed eden bileşenler), `app/api/shop/plan/callback`
   (ödeme tamamlanınca planı aktive eden, webhook'la aynı mantığı içeren uç
   nokta — komisyon fonksiyonları idempotent olduğundan webhook'la çakışma
   riski yok), `app/api/admin/iyzico-abonelik-kurulum` + `/admin/iyzico-abonelik`
   (iyzico'da ürün/ödeme planlarını BİR KEZ oluşturan admin aracı — nav'a
   eklenmedi, doğrudan URL'den açılır).

   ✅ **Kısmen doğrulandı (18 Ağustos 2026):** Zeki `/admin/iyzico-abonelik`'ten
   "Ürün + Ödeme Planlarını Oluştur"a tıkladı — gerçek iyzico sandbox'ında
   ürün + 3 ödeme planı BAŞARIYLA oluşturuldu, referans kodları döndü ve
   `settingsStore`'a kaydedildi. Bu, `lib/iyzico.ts`'teki HMAC imzalama
   mantığının (`buildAuthHeaders`) gerçek bir sandbox'a karşı ilk kez
   ÇALIŞTIĞINI kanıtlıyor — aynı fonksiyon tüm dosyada (checkout başlatma,
   webhook doğrulama) kullanıldığından bu önemli bir risk azaltma.

   ❌ **UÇTAN UCA TEST EDİLDİ, SORUN BULUNDU (17 Ağustos 2026):**
   `PAID_PLANS_ENABLED` geçici olarak `true` yapılıp `/dashboard/plan/odeme?plan=business`
   denendi — hem otomasyon üzerinden hem Zeki'nin kendi gerçek tarayıcısından
   (ikisi de aynı sonuç). `POST /api/shop/plan` sorunsuz çalışıyor,
   `checkoutFormContent` doğru dönüyor ve `SubscriptionCheckoutForm.tsx`
   script'i sayfaya doğru şekilde enjekte ediyor — ama iyzico'nun ödeme
   iframe'ini fiilen çizen dosya (`https://sandbox-static.iyzipay.com/
   checkoutform/v2/bundle.js`) tarayıcıdan istendiğinde **HTTP 503** dönüyor.
   Aynı URL sunucu tarafından (tarayıcı dışı bir HTTP isteğiyle) çekildiğinde
   sorunsuz, tam içerikle dönüyor — yani dosya var ve erişilebilir, sorun
   tarayıcı bağlamındaki istekte. Konsolda CSP ihlali hatası YOK (CSP'nin
   engellediği bir istek "blocked" görünür, gerçek bir 503 değil) — bu yüzden
   **CSP nedeni ekarte edildi**, aşağıdaki CSP riski notu artık geçerli değil.
   En olası açıklama: iyzico'nun sandbox statik CDN'i tarayıcı kaynaklı
   isteklerde bir domain doğrulama/whitelist kontrolü yapıyor ve
   otohafiza.com henüz yetkili domain listesinde değil — ya da sandbox CDN'de
   geçici bir sorun var. **Sonraki adım: entegrasyon@iyzico.com'a (zaten
   iletişimde olunan kanal) bu teknik detaylarla bildirilmesi** — Zeki'ye
   hazır bir taslak mesaj verildi. Çözülene kadar `PAID_PLANS_ENABLED` false'ta
   tutuluyor.

   Test sırası:
   1. `/admin/iyzico-abonelik`'ten "Ürün + Ödeme Planlarını Oluştur"a bas.
   2. `lib/planAvailability.ts`'te `PAID_PLANS_ENABLED`'ı GEÇİCİ olarak `true`
      yap, deploy et.
   3. Bir test bayi hesabıyla `/dashboard/plan`'dan Pro'ya geçmeyi dene, test
      kartıyla (https://docs.iyzico.com/ek-bilgiler/test-kartlari) ödemeyi
      tamamla. Ödeme formu hiç görünmezse yukarıdaki CSP notuna bak.
   4. `/dashboard/plan/sonuc` sayfasının "Aboneliğiniz başladı" gösterdiğini ve
      bayinin planının gerçekten değiştiğini doğrula.
   5. Sorun yoksa `PAID_PLANS_ENABLED`'ı gerçek lansmana kadar tekrar `false`'a
      al (ya da lansmana hazırsa öyle bırak — bu Zeki'nin kararı).

   **Küçük, düşük önemli not:** `recordPlanStart` (yalnızca istatistik amaçlı,
   admin "Plan Dağılımı" grafiği) şu an yalnızca callback'te çağrılıyor,
   webhook'ta değil — normal senaryoda (callback her zaman tamamlanır) sorun
   yok, ama callback hiç tamamlanmayıp yalnızca webhook bu aboneliği
   işleyebildiği o nadir durumda o dönüşüm istatistiklerde görünmez (planın
   kendisi yine de doğru güncellenir, yalnızca bir grafik eksik kalır).
6. ⏳ Yukarıdaki test tamamlanana kadar `PAID_PLANS_ENABLED` `false` kalmalı —
   şu an hiçbir gerçek bayi bu akışa erişemiyor, güvenli.

### 22 Ağustos 2026 GÜNCELLEMESİ — Gerçek/kurumsal iyzico hesabı aktif oldu

Zeki, gerçek (canlı/kurumsal) iyzico üye işyeri hesabının ve Abonelik
eklentisinin artık aktif olduğunu bildirdi. **Ancak Netlify ortam
değişkenleri kontrol edildi (salt okunur, değer görülmedi) ve site hâlâ
SANDBOX kimlik bilgileriyle çalışıyor:**

- `IYZICO_API_KEY` = `sandbox-...` (sandbox)
- `IYZICO_SECRET_KEY` = `sandbox-...` (sandbox)
- `IYZICO_BASE_URL` = `https://sandbox-api.iyzipay.com` (sandbox)
- `IYZICO_MERCHANT_ID` — **Netlify'da HİÇ tanımlı değil.** Bu olmadan
  `app/api/webhooks/iyzico-abonelik/route.ts` imza doğrulamasını
  hesaplayamıyor ve isteği 500 ile reddediyor (bkz. dosyadaki catch bloğu) —
  yani şu an webhook bildirimleri sandbox'ta bile güvenilir işlenmiyor
  olabilir, bu üretime geçmeden önce mutlaka çözülmeli.

**Gerçek tahsilata geçmeden önce sırasıyla yapılması gerekenler (hepsi
Zeki'nin kendisinin yapması gereken adımlar — API anahtarı/gizli bilgi
girme işini ben yapamam, güvenlik kuralı gereği):**

1. iyzico'nun canlı Üye İşyeri Paneli'nden gerçek **API Key**, **Secret Key**
   ve **Üye İşyeri (Merchant) ID**'yi al.
2. Netlify ortam değişkenlerini bizzat güncelle:
   - `IYZICO_API_KEY` → gerçek API key
   - `IYZICO_SECRET_KEY` → gerçek secret key
   - `IYZICO_BASE_URL` → `https://api.iyzipay.com` (sandbox'sız, gerçek üretim adresi)
   - `IYZICO_MERCHANT_ID` → gerçek üye işyeri ID'si (yeni eklenmeli, hiç yok)
   Değiştirdikten sonra yeniden deploy tetiklenmeli (Netlify env var
   değişikliği otomatik yeni deploy başlatmayabilir — "Trigger deploy"
   gerekebilir).
3. Bana haber ver — `/admin/iyzico-abonelik` sayfasındaki "Ürün + Ödeme
   Planlarını Oluştur" işlemini az önce eklenen gerçek anahtarlarla tekrar
   çalıştırmamız gerekiyor (sandbox'taki referans kodları üretimde geçersiz,
   ayrı bir hesap/ortam olduğu için yeniden oluşturulmaları şart).
4. iyzico'nun canlı Üye İşyeri Paneli'nde "Ayarlar > Firma Ayarları >
   İşyeri Bildirimleri" altına gerçek abonelik webhook URL'sini
   (`https://otohafiza.com/api/webhooks/iyzico-abonelik`) sen eklemelisin.
5. Tüm bunlar tamamlandıktan sonra, gerçek bir kartla küçük/test niteliğinde
   uçtan uca bir satın alma denemesini SEN yapmalısın (gerçek kart bilgisini
   ben hiçbir ödeme formuna giremem/girmemeliyim) — plan gerçekten aktif
   oluyor mu, webhook doğru işliyor mu doğrulanmalı.
6. Her şey sorunsuzsa `PAID_PLANS_ENABLED` zaten `true` — ek bir kod
   değişikliği gerekmez, sadece yukarıdaki adımlar tamamlanana kadar bu
   bayrağın `true` kalması, üretim anahtarları eklenene dek gerçek
   müşterilerin (sandbox anahtarlarıyla) başarısız/tuhaf bir ödeme
   deneyimi yaşayabileceği anlamına geldiğini unutma.

Sandbox'ta geliştirme, gerçek şirket kuruluşunu beklemeden 1. adım
tamamlanınca başlayabilir — üretim/gerçek tahsilat için ise gerçek iyzico
hesabında Abonelik eklentisinin satın alınması (ki bu muhtemelen kurumsal
hesap/vergi bilgisi ister) ve `PAID_PLANS_ENABLED` gerçek şirket kuruluşunu
bekliyor.

## 2. KVKK Aydınlatma Metni — adres/telefon ✅ Tamamlandı (20 Ağustos 2026)

- **Dosya:** `app/kvkk/page.tsx`
- `[Adres bekleniyor]` (2 yerde) ve `[Telefon bekleniyor]` gerçek şirket
  adresi/telefonuyla dolduruldu (bkz. madde 9'daki şirket bilgileri).

## 3. Kullanım Şartları — firma unvanı ✅ Tamamlandı (20 Ağustos 2026)

- **Dosya:** `app/kullanim-sartlari/page.tsx`
- `[Firma Unvanınız]` (2 yerde) "Sarper Dijital Teknolojiler ve Kiralama A.Ş."
  ile dolduruldu. Sayfa üstündeki hukuk danışmanı onay notu şimdilik
  bırakıldı — kaldırılıp kaldırılmayacağına Zeki karar verecek.

## 4. Mesafeli Satış Sözleşmesi — satıcı bilgileri ✅ Tamamlandı (20 Ağustos 2026)

- **Dosya:** `app/mesafeli-satis-sozlesmesi/page.tsx`
- "1. Taraflar" bölümü gerçek şirket bilgileriyle dolduruldu (bkz. madde 9).
  Cayma hakkı notunun (yasal zorunluluk mu, gönüllü politika mı) bir
  danışmanla netleştirilmesi hâlâ bekliyor — metin şimdilik değiştirilmedi.

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

## 8. E-Fatura Entegrasyonu (Trendyol e-Faturam) — otomatik fatura kesme

**Talep (18 Ağustos 2026):** Zeki, abonelik ödemeleri VE etiket siparişleri
için Trendyol e-Faturam (Digital Planet altyapılı e-fatura/e-arşiv sistemi)
üzerinden **elle dokunmadan otomatik** fatura kesilmesini istiyor.

### İki sert ön koşul (ikisi de şu an eksik, ikisi de Zeki'nin yapması gereken)

1. **Vergi numarası/MERSİS.** E-fatura/e-arşiv fatura, GİB'e (Gelir İdaresi
   Başkanlığı) mükellef olarak kayıtlı bir vergi kimlik numarası olmadan
   yasal olarak kesilemez — hangi sağlayıcı seçilirse seçilsin bu değişmez.
   Şirket kuruluşu tamamlanıp vergi no/MERSİS elde edilmeden bu maddenin
   geri kalanı başlatılamaz.
2. **Trendyol e-Faturam hesabı + API erişimi.** Zeki'nin şu an bir Trendyol
   e-Faturam hesabı yok. Vergi no elde edildikten sonra o vergi no ile
   trendyolefaturam.com üzerinden hesap açılmalı, panelden "API/Web Servis
   Entegrasyonu" bölümünden entegrasyon anahtarı/şifresi alınmalı. Bu adımı
   yalnızca Zeki yapabilir (hesap açma/kimlik doğrulama, ben giremem) —
   anahtarları aldıktan sonra Netlify ortam değişkeni olarak eklenmesi
   yeterli, ben kod tarafını o zaman tamamlarım.

### Kod tarafında zaten hazır olan altyapı (ek iş gerekmiyor)

`lib/billing.ts` / `lib/types.ts` (`BillingInfo`) her bayiden zaten şu anda
topluyor: fatura tipi (bireysel/kurumsal), ad-soyad veya firma unvanı, vergi
dairesi, VKN (10 hane) veya T.C. Kimlik No (11 hane), adres, telefon, **VE
`eInvoiceType` (e-fatura mükellefi mi, yoksa e-arşiv mi kesilecek)** — yani
e-fatura entegrasyonunun ihtiyaç duyacağı tüm alıcı bilgisi modeli önceden
düşünülmüş ve zaten toplanıyor. Entegrasyon geldiğinde yeni bir form/alan
eklemeye gerek kalmayacak, doğrudan bu veriler kullanılacak.

### Yapılacaklar (vergi no + Trendyol e-Faturam API anahtarı elde edildiğinde sırayla)

1. Zeki, Trendyol e-Faturam panelinden alınan entegrasyon anahtarı/şifresini
   paylaşır → Netlify ortam değişkenlerine eklenir (ör.
   `TRENDYOL_EFATURAM_API_KEY`, `TRENDYOL_EFATURAM_API_SECRET`) — API
   dokümantasyonuna panel üzerinden erişilip gerçek istek/yanıt formatı
   doğrulanır (genel API dokümanı herkese açık değil, hesaba özel).
2. `lib/eFatura.ts` yazılır — `BillingInfo.eInvoiceType`'a göre e-Fatura ya
   da e-Arşiv Fatura oluşturma isteği atan, HMAC/imza doğrulaması yapan bir
   istemci (mevcut `lib/iyzico.ts`'teki `buildAuthHeaders` deseniyle
   tutarlı bir yapı).
3. Tetikleyiciler eklenir — İKİSİ DE (Zeki'nin tercihi):
   - Abonelik ödemesi: `app/api/webhooks/iyzico-abonelik/route.ts` ve
     `app/api/shop/plan/callback` içinde, plan başarıyla aktive
     edildiğinde `lib/eFatura.ts` çağrılır.
   - Etiket siparişi: `app/api/etiket-siparis` ödeme başarı akışında aynı
     şekilde çağrılır.
   Her iki noktada da fatura kesme işlemi **idempotent** olmalı (aynı ödeme
   için iki kez fatura kesilmemeli) — mevcut komisyon/webhook kodundaki
   idempotency deseni (referans kod bazlı) buraya da uygulanacak.
4. Kesilen fatura PDF/bağlantısı bayiye e-posta ile gönderilir ve
   dashboard'da (muhtemelen `/dashboard/plan` veya `/dashboard/fatura-bilgileri`
   altında yeni bir "Faturalarım" listesi) görüntülenebilir hâle getirilir.
5. Sandbox/test ortamı varsa (Trendyol e-Faturam'ın test modu sunup
   sunmadığı panelden kontrol edilmeli) önce orada uçtan uca denenir,
   sorunsuzsa canlıya alınır.

**Not:** Bu madde kasıtlı olarak "kod önceden yazılıp dorman bekletilsin" (WhatsApp
otomasyonu, madde 5'teki gibi) yaklaşımıyla DEĞİL, API erişimi elde
edildikten sonra yazılsın şeklinde planlandı — çünkü Trendyol e-Faturam'ın
gerçek istek/yanıt şeması genel dokümantasyonda yok (hesaba özel panelde
veriliyor), önceden tahminle yazılan kod muhtemelen gerçek şemayla
uyuşmayacaktır. WhatsApp'ta (Meta Cloud API, herkese açık dokümantasyon)
durum farklıydı.

## 9. Şirket resmi bilgileri (referans — 20 Ağustos 2026'da Zeki'den alındı)

Kuruluş tamamlandı. Madde 2-4'teki placeholder'lar bu bilgilerle dolduruldu;
ileride e-Fatura (madde 8) veya iyzico Abonelik'in gerçek/kurumsal hesabı
(madde 1) gibi başka bir yerde şirket bilgisi gerektiğinde buradan alınabilir.

- **Unvan:** Sarper Dijital Teknolojiler ve Kiralama A.Ş.
- **Vergi No (VKN):** 7511125219
- **Vergi Dairesi:** Mesir V.D. (Manisa)
- **MERSİS No:** 0751112521900001
- **Ticaret Sicil No:** 24016
- **Adres:** Muradiye Mahallesi Zübeyde Hanım Cad. No:34/A Yunusemre/Manisa
- **Telefon:** +90 542 575 69 18 (mevcut WhatsApp Business hattı,
  `lib/whatsappBusiness.ts` — WHATSAPP_BUSINESS_NUMBER — ile aynı numara,
  farklıysa güncellenmeli)
- **E-posta:** hello@otohafiza.com (resmi/hukuki yazışma için farklı bir
  kurumsal e-posta varsa güncellenmeli)

---
Bu listeyi güncel tutmak için: yeni bir "şirket kuruluşunu bekliyor" durumu
eklerken lütfen bu dosyaya da bir madde ekleyin.
