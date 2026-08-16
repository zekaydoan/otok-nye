# OtoHafıza — Güvenlik Denetim Raporu

**Tarih:** 2026-08-16
**Kapsam:** Statik kod incelemesi (yalnızca okuma) — `app/`, `lib/`, `components/`, config dosyaları.
**Denetimi talep eden:** Proje sahibi (Zeki) — kendi isteğiyle, savunma amaçlı.
**Yöntem:** Bu proje Supabase/PostgreSQL+RLS KULLANMIYOR. Veri katmanı Netlify Blobs
(`lib/blobStore.ts`, JSON blob + ETag tabanlı optimistic locking) ve kimlik doğrulama
`lib/auth.ts`'te JWT tabanlı özel bir sistemdir. Tenant izolasyonu, RLS policy yerine
her API route'unda elle yazılan `shopId` kontrolleriyle sağlanıyor. Kontrol listesindeki
Supabase/RLS'e özgü maddeler bu mimariye uyarlanarak değerlendirildi.

**KISITLAR (dürüstçe belirtilmelidir):**
- `npm audit` çalıştırılamadı — sandbox ortamında npm registry'ye ağ erişimi yok (403
  blocked-by-allowlist). Bağımlılık değerlendirmesi yalnızca `package.json`'daki sürüm
  numaralarının elle/bilgiye dayalı incelemesiyle yapıldı, otomatik CVE taraması DEĞİLDİR.
- Hiçbir canlı istek atılmadı, hiçbir "penetrasyon testi" gerçekleştirilmedi — bu tamamen
  statik kod incelemesidir. "Test edildi, güvenli" gibi bir iddia YOKTUR; yalnızca kodda
  gözlemlenen davranış raporlanmıştır.
- Kod hiçbir şekilde değiştirilmedi.

---

## ÖZET TABLO

| Seviye | Adet |
|---|---|
| CRITICAL | 0 |
| HIGH | 2 |
| MEDIUM | 4 |
| LOW | 4 |
| INFO | 6 |

Genel değerlendirme: Kod tabanı, tipik "hızlı büyüyen SaaS" projelerine göre **belirgin
şekilde daha dikkatli yazılmış**. Bcrypt + zamanlama saldırısına karşı sahte hash, HMAC
imza doğrulamalı webhook (fail-closed), CSV enjeksiyon koruması, ETag tabanlı optimistic
locking, admin yetkisinin her route'ta ayrı ayrı sunucu tarafında doğrulanması, sıkı CSP +
güvenlik header'ları gibi olgun pratikler zaten uygulanmış. Bulunan sorunlar çoğunlukla
mimari sınır durumları (paylaşımlı defter modeli) ve bir iş mantığı açığı (plan yükseltme).

---

## HIGH

### H1 — Bayi kendi planını ödeme doğrulaması olmadan ücretli plana yükseltebiliyor
- **İlgili dosya:** `app/api/shop/plan/route.ts` (POST), `components/PlanSelector.tsx`
- **İlgili fonksiyon/satır:** `POST` handler, satır 7-48; `choosePlan()` (PlanSelector.tsx satır 14-39)
- **Risk:** Bu uç nokta, oturum sahibinin (`role === "sahibi"`) kendi `shop.plan` alanını
  doğrudan `pro` / `business` / `business_yillik` gibi ücretli bir değere set etmesine izin
  veriyor. Tek koşul, fatura bilgilerinin (unvan/vergi no vb.) dolu olması — **gerçek bir
  ödeme/tahsilat kontrolü yok** (kod içi yorumlar da bunu doğruluyor: "sistemde henüz
  gerçek bir tekrarlayan ödeme/otomatik tahsilat entegrasyonu yok"). Etiket siparişinde
  (iyzico) olduğu gibi bir ödeme adımı bu akışta YOK.
- **Nasıl kötüye kullanılabilir:** Herhangi bir bayi, tarayıcı konsolundan veya doğrudan
  `fetch("/api/shop/plan", {method:"POST", body: JSON.stringify({plan:"business"})})`
  çağrısıyla — fatura bilgilerini (ki bunlar da doğrulanmamış serbest metin alanlarıdır,
  gerçek bir vergi dairesi kontrolü yok) doldurduktan sonra — hiç ödeme yapmadan sınırsız
  araç/çalışan limitine sahip en üst plana geçebilir. Bu bir yetkisiz erişim değil ama
  doğrudan **gelir kaybına yol açan bir iş mantığı açığıdır**.
- **Önerilen çözüm:** (1) Bu uç noktayı yalnızca `free` plana düşüş veya gerçek bir ödeme
  sağlayıcısı onayından sonra plan yükseltmesi için kullanın; ücretli plana geçişi admin
  onayına (mevcut `app/api/admin/shops/[id]/plan` route'u zaten var) veya iyzico ile gerçek
  bir tahsilat akışına bağlayın. (2) Geçiş dönemi için en azından: plan yükseltmesini
  "beklemede" durumuna alıp admin manuel onaylayana kadar `shop.plan` değişmesin, ya da
  Netlify ortamında bu uç noktayı geçici olarak devre dışı bırakıp yalnızca admin route'unu
  kullanın.
- **Düzeltme önceliği:** Yüksek — üretimde gerçek para kaybına yol açabilir, kod
  değişikliği küçük ve hızlı.

### H2 — Sticker/etiket token'ı 12 hex karakter (48 bit) — teorik olarak enumerasyon riski, ama pratik rate limiting eksik
- **İlgili dosya:** `lib/blobStore.ts` `createStickerTokens()` (satır ~795-809), `app/e/[token]/page.tsx`
- **İlgili fonksiyon/satır:** `randomUUID().replace(/-/g, "").slice(0,12)`
- **Risk:** Token, tam bir UUID (122 bit rastgelelik) yerine yalnızca ilk 12 hex karaktere
  (48 bit) kısaltılıyor. 48 bit hâlâ pratikte kaba kuvvetle kırılamaz (2^48 ≈ 281 trilyon
  olasılık) ancak `app/e/[token]/page.tsx` (bir Next.js SAYFASI, API route değil) üzerinde
  **hiçbir rate limiting bulunmuyor** — `lib/rateLimit.ts` yalnızca API route'larında
  çağrılıyor, bu sayfada çağrılmıyor. Bu, HIGH değil aslında MEDIUM'a daha yakın bir risk
  taşıyor (48 bit brute-force pratikte imkansız) ancak kombinasyonla değerlendirildiğinde:
  token bulunursa (ör. sızıntı, fiziksel etikette QR fotoğrafı paylaşılırsa) `POST
  /api/etiket-token/[token]/bind` üzerinde de rate limit yok — bu da bir saldırganın bir
  bayinin boşta kalan token'larını otomatik script ile art arda deneyip araç bilgisi
  ekleyerek "spam veri" enjekte etmesine olanak tanır (token'ın shopId sahipliği kontrol
  ediliyor, ama rate limit yok).
- **Nasıl kötüye kullanılabilir:** Token tahmini pratikte mümkün değil (48 bit), ancak
  eğer bir saldırgan bir şekilde birden fazla token biliyorsa (ör. aynı sipariş partisinden
  fiziksel etiketlerin çöpe atılan ambalajından), `/api/etiket-token/[token]/bind` uç
  noktasını sınırsız sayıda deneyip o bayinin hesabına sahte araç kaydı ekleyebilir.
- **Önerilen çözüm:** `app/api/etiket-token/[token]/bind/route.ts` POST'una IP+token bazlı
  `checkRateLimit` ekleyin (örn. dakikada 5 deneme). Token uzunluğunu 12'den 16-20 hex
  karaktere çıkarmak da savunma derinliği için ucuz bir iyileştirmedir (mevcut kod zaten
  `randomUUID()` üretiyor, `.slice(0,12)` yerine daha uzun bir dilim almak tek satırlık
  bir değişikliktir).
- **Düzeltme önceliği:** Orta-Yüksek — düşük olasılıklı ama ucuz bir düzeltme.

---

## MEDIUM

### M1 — "Paylaşımlı defter" modeli: herhangi bir giriş yapmış bayi, herhangi bir aracın PII'sini (sahip adı/telefonu) görebilir/değiştirebilir
- **İlgili dosya:** `app/api/vehicles/[id]/route.ts` (GET/PATCH), `app/api/vehicles/[id]/km/route.ts`,
  `app/api/vehicles/[id]/records/route.ts`, `app/api/vehicles/[id]/records/[recordId]/pdf/route.ts`,
  `app/api/photos/[recordId]/[type]/route.ts`, `app/api/vehicles/[id]/rapor/route.ts`
- **Risk:** Bu, kod içi yorumlarda açıkça belirtilen **bilinçli bir tasarım kararı**
  ("paylaşımlı defter modelinde herkes bir aracı görüntüleyip kayıt ekleyebilir") — RLS
  eşdeğeri olan shopId kontrolü kasıtlı olarak yalnızca oturum var mı diye bakıyor, "bu
  araç bu bayiye mi ait" diye bakmıyor. Bu, aracı kaydeden bayi dışındaki herhangi bir
  yetkili servisin de (rakip bir tamirci dahil) bir aracın plakasını, marka/modelini,
  sahibinin adını ve TELEFON NUMARASINI görebilmesi, düzenleyebilmesi, yeni bakım kaydı
  ekleyebilmesi anlamına gelir — TEK koşul geçerli bir araç ID'sini (UUID) bilmek.
- **Nasıl kötüye kullanılabilir:** Araç ID'leri `randomUUID()` ile üretildiğinden rastgele
  tahmin pratik değil. Ancak (a) plaka arama uç noktası (`/api/vehicles/search`) giriş
  yapmış HERHANGİ bir bayiye plakadan araç ID'si + PII veriyor — yani bir tamirci, kendisi
  hiç hizmet vermediği bir aracın sahibinin adını/telefonunu yalnızca plakasını bilerek
  öğrenebilir; (b) `/arac/[id]` genel sayfası da UUID bilindiğinde erişilebilir. Bu,
  rakip bir işletmenin müşteri tabanını "keşfetmesi" (plaka biliniyorsa) için kullanılabilir.
- **Önerilen çözüm:** Bu, ürün kararı olduğu için "düzeltme" değil bir **karar netleştirmesi**
  gerektiriyor: Eğer bilinçli olarak paylaşımlı defter isteniyorsa (araç sahibinin farklı
  servislere gidebilmesi senaryosu), bu KVKK açısından netleştirilmeli ve KVKK metninde
  açıkça belirtilmeli (bkz. K1). Eğer istenmeyen bir yan etkiyse, `vehicles/search` ve
  `vehicles/[id]` GET/PATCH uç noktalarına "bu bayi bu araçla `isVehicleLinkedToShop` ile
  ilişkili mi" kontrolü eklenip PII alanları (ownerName/ownerPhone) yalnızca ilişkili
  bayilere gösterilebilir; en azından `vehicles/search` sonucundan ownerPhone/ownerName
  çıkarılıp yalnızca "bu plaka zaten kayıtlı" bilgisi dönebilir.
- **Düzeltme önceliği:** Orta — önce ürün kararı olarak Zeki ile netleştirilmeli.

### M2 — Rate limiting "best-effort" ve atomik değil (Netlify Blobs sınırlaması)
- **İlgili dosya:** `lib/rateLimit.ts`
- **Risk:** Kod içi yorumda da dürüstçe belirtildiği gibi Netlify Blobs atomik artırma
  desteklemiyor; yoğun eşzamanlı isteklerde sayaç birkaç istek kadar aşılabilir (race
  condition: iki istek aynı anda `get` yapıp ikisi de `count+1` yazabilir). Bu, brute-force
  saldırılarını "pratikte etkisiz" kılmak için yeterli ama garantili değil.
- **Nasıl kötüye kullanılabilir:** Çok yüksek hacimli, yüksek paralellik ile atılan bir
  brute-force script'i (ör. 50-100 paralel istek) rate limit penceresini bir miktar aşabilir.
  Login/forgot-password gibi endpoint'lerde MAX_ATTEMPTS 5-8 gibi düşük olduğundan mutlak
  etkisi sınırlı, ama garanti verilmiyor.
- **Önerilen çözüm:** Ölçek büyüdükçe (kod yorumunda zaten önerildiği gibi) Upstash Redis
  gibi atomik INCR destekleyen bir çözüme geçilmesi. Şu an için MVP/erken aşama için kabul
  edilebilir bir trade-off.
- **Düzeltme önceliği:** Orta — acil değil, ölçeklenmeden önce planlanmalı.

### M3 — Fatura bilgileri (vergi no, unvan) sunucu tarafında gerçek doğrulama olmadan kabul ediliyor
- **İlgili dosya:** `lib/billing.ts` `validateBillingInfo()`, `app/api/shop/billing-info/route.ts`
- **Risk:** Vergi numarası muhtemelen yalnızca format (11 haneli TC/10 haneli VKN gibi)
  kontrol ediliyor, gerçek bir vergi dairesi doğrulaması yok (bu doğal ve beklenen — üçüncü
  parti doğrulama servisi entegre değilse mümkün değil). Ancak bu, H1 ile birleştiğinde
  "fatura bilgisi = ödeme kanıtı" varsayımının güvenli olmadığını gösteriyor.
- **Önerilen çözüm:** `lib/billing.ts` içeriği ayrıca incelenmeli (bu denetimde satır satır
  okunmadı, doğrulanamadı — `lib/billing.ts` dosyasına bakılmalı). H1 çözülünce bu maddenin
  önemi azalır.
- **Düzeltme önceliği:** Düşük-Orta, H1'e bağlı.

### M4 — WhatsApp/e-posta/iyzico entegrasyonları "uçtan uca test edilmedi" olarak işaretli
- **İlgili dosya:** `lib/iyzico.ts` (satır 8-12 yorumu), `lib/whatsapp.ts`, `lib/email.ts`
- **Risk:** Kod, resmi dokümantasyona göre yazılmış ancak gerçek sandbox/prod hesaplarıyla
  test edilmediği kodun kendi yorumunda itiraf ediliyor. Bu bir "açık" değil ama üretime
  almadan önce mutlaka doğrulanması gereken bir risk alanı — özellikle iyzico HMAC imza
  formatı, callback doğrulama akışı (retrieveCheckoutForm zaten callback verisine
  doğrudan güvenmiyor, doğru yaklaşım) gerçek bir ödeme ile test edilmeli.
- **Önerilen çözüm:** Canlıya almadan önce iyzico sandbox ile en az bir tam sipariş +
  ödeme + callback döngüsü test edilmeli (bu denetimde bu sandbox'ta ağ erişimi
  olmadığından yapılamadı).
- **Düzeltme önceliği:** Orta — kod hazır görünüyor, sadece doğrulama eksik.

---

## LOW

### L1 — StaffAccount (çalışan) kendi şifresini değiştiremiyor
- **İlgili dosya:** `app/api/shop/change-password/route.ts` (yalnızca `role === "sahibi"`)
- **Risk:** Düşük — güvenlik açığı değil, ama bir çalışan hesabının şifresi sızarsa,
  çalışanın kendisi şifreyi değiştiremiyor; yalnızca hesap sahibi silip yeniden ekleyerek
  "resetleyebiliyor". Kullanılabilirlik/operasyonel notu, güvenlik riski taşımıyor.
- **Önerilen çözüm:** İsteğe bağlı bir gelecek iyileştirme.
- **Düzeltme önceliği:** Düşük.

### L2 — `vehicles/bulk` (CSV toplu içe aktarma) — dosya değil JSON body kabul ediyor, ama boyut sınırı yalnızca satır sayısı (200) ile sınırlı
- **İlgili dosya:** `app/api/vehicles/bulk/route.ts`
- **Risk:** Gerçek bir "dosya yükleme" (multipart/form-data) değil — istemci CSV'yi
  parse edip JSON `rows` dizisi olarak gönderiyor (muhtemelen tarayıcıda). Bu, dosya tipi/
  MIME kontrolü riskini ortadan kaldırıyor (zaten dosya sunucuya yüklenmiyor). MAX_ROWS=200
  var ama her satırın alan uzunlukları (`MAX_LEN=120`) ayrı ayrı kontrol ediliyor — bu iyi.
  Netlify Function zaman aşımı riski (200 satır × strong-consistency plaka kontrolü) kod
  yorumunda zaten belirtilmiş ve bilinçli bir sınır.
- **Önerilen çözüm:** Mevcut hâliyle kabul edilebilir; gerçek dosya yükleme (resim/PDF)
  olan tek yer bakım fotoğrafları (`records/route.ts`) — orada MIME whitelist +
  4MB base64 sınırı zaten var (bkz. INFO bölümü, iyi uygulama).
- **Düzeltme önceliği:** Düşük.

### L3 — `X-Forwarded-For` tabanlı IP tespiti rate-limit bypass'a açık olabilir
- **İlgili dosya:** `lib/rateLimit.ts` `getClientIp()`
- **Risk:** `x-nf-client-connection-ip` header'ı Netlify tarafından proxy'de doldurulduğu
  belirtiliyor (güvenilir), ama kod `x-forwarded-for`'a da düşüyor — bu header istemci
  tarafından sahte olarak gönderilebilir EĞER Netlify onu geçersiz kılmıyorsa. Netlify'nin
  `x-nf-client-connection-ip`'yi her zaman doğru doldurduğu varsayılıyor; bu varsayım
  doğrulanamadı (Netlify altyapısına bu ortamdan erişilemedi).
- **Önerilen çözüm:** Netlify dokümantasyonunda `x-nf-client-connection-ip`'nin her
  zaman güvenilir şekilde sağlandığı teyit edilmeli; öyleyse `x-forwarded-for` fallback'i
  güvenlik açısından kritik olmayan bir yedek olarak kalabilir.
- **Düzeltme önceliği:** Düşük — doğrulama gerekiyor, kod değişikliği gerekmeyebilir.

### L4 — `DEV_FALLBACK_SECRET` kaynak kodda açık metin olarak duruyor
- **İlgili dosya:** `lib/auth.ts` satır 6
- **Risk:** `"otohafiza-gelistirme-anahtari-2026"` sabit değeri, yalnızca
  `NODE_ENV !== "production"` iken kullanılıyor ve üretimde `AUTH_SECRET` tanımlı değilse
  uygulama hata fırlatıp başlamıyor (fail-closed, doğru yaklaşım). Risk yalnızca teorik:
  biri yanlışlıkla `NODE_ENV`'i production dışı bırakıp gerçek bir sunucuya deploy ederse.
- **Önerilen çözüm:** Mevcut fail-closed davranış zaten doğru; ek olarak Netlify ortam
  değişkenlerinde `AUTH_SECRET`'in gerçekten güçlü/rastgele bir değerle tanımlı olduğu
  MANUEL olarak teyit edilmeli (bu denetimde Netlify env değişkenlerine erişim yoktu,
  doğrulanamadı).
- **Düzeltme önceliği:** Düşük — kod doğru, yalnızca ortam değişkeni deploy kontrolü.

---

## INFO (iyi uygulamalar / bulgu yok ama not edilmesi gerekenler)

- **I1:** `bcryptjs` cost factor 10 ile kullanılıyor (`lib/auth.ts`) — kabul edilebilir,
  modern donanımda biraz düşük ama pratik risk düşük (2024+ önerisi genelde 12).
- **I2:** Login akışında hesap var/yok bilgisini zamanlama yan kanalından sızdırmamak için
  sahte bcrypt hash karşılaştırması (`DUMMY_HASH`) kullanılması — iyi, ileri seviye bir
  önlem, çoğu SaaS projesinde görülmez.
- **I3:** WhatsApp webhook'u HMAC-SHA256 + `timingSafeEqual` ile doğrulanıyor ve
  `WHATSAPP_APP_SECRET` tanımlı değilken **fail-closed** (isteği reddediyor) — doğru
  yaklaşım.
- **I4:** CSV export'ta formül enjeksiyonu (`=`, `+`, `-`, `@` ile başlayan hücreler)
  önlemi var (`app/api/shop/export/route.ts`) — birçok üretim uygulamasında bile
  atlanan bir detay, burada düşünülmüş.
- **I5:** E-posta bildirimlerinde kullanıcı girdisi `escapeHtml()` ile kaçırılıyor
  (`lib/email.ts`, `app/api/*/route.ts` genelinde) — HTML enjeksiyonuna karşı koruma var.
- **I6:** `next.config.js`'te tüm production güvenlik header'ları (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy) zaten tanımlı ve makul —
  bkz. PRODUCTION bölümü aşağıda.

---

## BÖLÜM BAZLI DURUM ÖZETLERİ

### AUTH (Kimlik Doğrulama)
İncelendi (`lib/auth.ts`, `app/api/auth/*`). Şifreler bcrypt (cost 10) ile hashleniyor.
JWT (jose/HS256) tabanlı oturum, 30 gün geçerli. Login/signup/forgot-password/change-password
uç noktalarının hepsinde IP+e-posta bazlı rate limiting var (5-8 deneme / 15 dk-1 saat).
Şifre sıfırlama token'ları tek kullanımlık, 1 saat TTL, `randomUUID()` ile üretiliyor.
Timing-attack önlemi (sahte hash) mevcut. Üretimde `AUTH_SECRET` zorunlu (fail-closed).
Sorun bulunmadı; L4 yalnızca deploy-zamanı doğrulama notu.

### SESSION / COOKIE
İncelendi (`lib/auth.ts` `setSessionCookie`). `httpOnly: true`, `secure` (production'da
true), `sameSite: "strict"`, `path: "/"`, 30 gün maxAge. Bu, CSRF'ye karşı da güçlü bir
ek katman sağlıyor (SameSite=strict, cross-site isteklerde çerez hiç gönderilmiyor).
Sorun bulunmadı.

### TENANT İZOLASYONU (Supabase RLS eşdeğeri: shopId kontrolleri)
N/A — proje Supabase kullanmıyor. Eşdeğeri incelendi: `getCurrentShopId()`/
`getCurrentSession()` her route'ta çağrılıyor, admin route'ları ayrıca
`getCurrentAdminShopId()` kullanıyor. Sahiplik kontrolleri (`order.shopId !== shopId`,
`tokenRecord.shopId !== shopId`, `isVehicleLinkedToShop`) sipariş, etiket token, çalışan,
randevu gibi kaynaklarda TUTARLI şekilde uygulanmış. TEK istisna, bilinçli tasarım kararı
olan "paylaşımlı araç defteri" modeli — bkz. M1. Admin/normal bayi ayrımı da her admin
route'unda ayrı ayrı sunucu tarafında doğrulanıyor (frontend'e güvenilmiyor).

### QR / ETİKET SİSTEMİ
İncelendi (`lib/blobStore.ts` `createStickerTokens`, `app/e/[token]/page.tsx`,
`app/api/etiket-token/[token]/bind/route.ts`). Token `randomUUID()`'den türetilmiş 12 hex
karakter (48 bit) — tahmin edilemez ama H2'de belirtildiği gibi bind endpoint'inde rate
limit eksik. Genel araç sayfası (`/arac/[id]`) girişsiz ziyaretçiye yalnızca özet bilgi
(plaka, marka/model, son bakım TARİHİ — detay değil) gösteriyor; tam geçmiş/fotoğraf/not
üyelere özel. Bu iyi bir veri minimizasyonu örneği.

### ADMIN PANELİ
İncelendi. 8 admin sayfasının (`app/admin/**/page.tsx`) TAMAMI kendi içinde
`getCurrentAdminShopId()` çağırıp `null` ise `notFound()` döndürüyor — admin layout'u
(`app/admin/layout.tsx`) kendisi bir yetki kontrolü YAPMIYOR ama bu, her sayfanın kendi
kontrolünü yaptığı için risk oluşturmuyor (savunma tek katmanlı ama her yerde uygulanmış).
Tüm admin API route'ları da (`app/api/admin/**/route.ts`) aynı şekilde kontrol ediyor.
Yetki, `ADMIN_EMAILS` ortam değişkenindeki e-posta listesiyle eşleşen normal bir Shop
hesabı üzerinden veriliyor (ayrı bir rol alanı yok) — bu, ölçek için basit ama işlevsel bir
yaklaşım; admin olmayan bir kullanıcı admin route'larını çağırırsa her yerde 403 alıyor.
Sorun bulunmadı.

### API GÜVENLİĞİ (input validation, hata mesajları, mass assignment)
Genel olarak iyi: neredeyse her route'ta alan uzunluk sınırları (MAX_LEN türü sabitler),
tip kontrolleri, sayısal aralık kontrolleri var. Hata mesajları Türkçe, kullanıcı dostu,
stack trace/sistem bilgisi sızdırmıyor (catch blokları genel mesaj dönüyor). Mass
assignment riski düşük — her route body'den yalnızca beklenen alanları destructure edip
kullanıyor, `...body` şeklinde kör spread yok. `app/api/shop/plan` (H1) dışında ciddi bir
input validation sorunu görülmedi.

### XSS / CSP
`dangerouslySetInnerHTML` yalnızca 6 yerde kullanılıyor, hepsi `JSON.stringify(...JsonLd)`
ile structured data (JSON-LD SEO) enjekte ediyor — kullanıcı girdisi değil, statik/yapısal
veri. Gerçek XSS riski görülmedi. CSP (`next.config.js`) `script-src 'self' 'unsafe-inline'
https://connect.facebook.net` içeriyor — `'unsafe-inline'` script-src'de bulunması ideal
değil (nonce/hash tabanlı CSP daha güçlü olurdu) ama Next.js'in inline hydration script'leri
gerektirmesi nedeniyle yaygın bir trade-off'tur; XSS'e karşı ek bir katman kaybı olarak not
edilir (LOW/INFO sınırında, ayrı madde açılmadı çünkü mevcut mimaride pratikte kullanıcı
girdisi zaten hiçbir yerde `dangerouslySetInnerHTML`'e gitmiyor).

### CSRF
Cookie tabanlı auth kullanılıyor ama `sameSite: "strict"` (bkz. SESSION/COOKIE) zaten
CSRF'ye karşı güçlü bir koruma sağlıyor — modern tarayıcılarda cross-site POST/PATCH/DELETE
isteklerinde bu çerez gönderilmez. Ayrıca ek bir CSRF token mekanizması yok ama
SameSite=strict ile bu genelde gereksiz hâle gelir (yalnızca çok eski tarayıcılar için risk
kalır). Sorun bulunmadı.

### DOSYA YÜKLEME
Gerçek dosya yükleme yalnızca bakım fotoğraflarında (`app/api/vehicles/[id]/records/route.ts`):
MIME whitelist (`image/jpeg, image/png, image/webp, image/gif` — SVG bilinçli olarak
hariç tutulmuş, XSS riski nedeniyle), boyut sınırı (4MB base64), aşan/uygunsuz dosyalar
sessizce atlanıyor (isteği reddetmiyor ama fotoğrafı kaydetmiyor — kullanıcı deneyimi
tercihi, güvenlik açığı değil). CSV toplu araç içe aktarma gerçek bir dosya yükleme değil,
istemci taraflı parse edilmiş JSON — bkz. L2. Sorun bulunmadı.

### SECRET MANAGEMENT
`.env`/`.env.local` `.gitignore`'da. `git log --all --full-history -- .env*` ile repo
geçmişi tarandı — hiçbir `.env` dosyası hiçbir commit'te bulunamadı, yalnızca
`.env.example` (placeholder değerlerle) mevcut. Kaynak kodda `git grep` ile
`sk_live|AIza|AKIA|BEGIN PRIVATE KEY` gibi desenler arandı — hiçbir hardcoded secret
bulunamadı. Tüm gizli anahtarlar (`AUTH_SECRET`, `IYZICO_SECRET_KEY`,
`WHATSAPP_APP_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS`) `process.env` üzerinden
okunuyor, sunucu tarafı kodda kalıyor; `NEXT_PUBLIC_` öneki yalnızca gerçekten client'a
gitmesi gereken `NEXT_PUBLIC_META_PIXEL_ID` gibi değerlerde kullanılmış. Sorun bulunmadı
(NOT: Netlify'daki gerçek ortam değişkeni değerlerine bu ortamdan erişilemedi, yalnızca
kod tarafı doğrulandı).

### DEPENDENCY GÜVENLİĞİ
`npm audit` ÇALIŞTIRILAMADI (sandbox'ta npm registry erişimi engelli — 403
blocked-by-allowlist). Yalnızca `package.json` sürümlerine bakarak elle değerlendirme:
`next@14.2.16` — Next.js 14.2.x serisinde ilerleyen sürümlerde (14.2.25+) çeşitli
güvenlik yamaları yayınlandı (ör. middleware yetkilendirme bypass'ı CVE-2025-29927);
bu proje `middleware.ts` KULLANMADIĞI için (repo'da bulunamadı) o spesifik CVE'ye karşı
büyük olasılıkla etkilenmiyor, ancak genel iyi pratik olarak Next.js'in en güncel 14.2.x
patch sürümüne yükseltilmesi önerilir. `bcryptjs@2.4.3`, `jose@5.9.6`, `pdf-lib@1.17.1`,
`qrcode@1.5.4`, `jsqr@1.4.0` — bilinen kritik bir CVE'ye dair bu denetimde bir emare
görülmedi ama bu KESİN bir tarama DEĞİLDİR; ağ erişimi olan bir ortamda `npm audit` veya
`npm outdated` çalıştırılması şiddetle önerilir.

### RATE LIMITING
`lib/rateLimit.ts` best-effort bir sayaç sağlıyor (bkz. M2). Kapsam taraması:
- login (8/15dk), signup (5/saat), forgot-password (5/15dk), change-password (8/15dk) ✓
- etiket-siparis oluşturma (5/saat, shopId bazlı) ✓
- whatsapp-webhook (120/dk, IP bazlı) ✓
- analytics-pageview (60/dk, IP bazlı) ✓
- veri-talebi/KVKK formu (5/saat, IP bazlı) ✓
- öneri/suggestion (10/saat, shopId bazlı) ✓
- reminder-sent manuel gönderim (60/saat, shopId bazlı) ✓
- whatsapp-optout (20/saat, IP bazlı) ✓
- **EKSİK:** `/api/etiket-token/[token]/bind` POST — rate limit YOK (bkz. H2).
- **EKSİK:** `/api/vehicles/search` (plaka arama) — rate limit YOK; giriş gerektirdiği
  için düşük risk ama bir bayi hesabı ele geçirilirse toplu plaka taraması yapılabilir.
- **EKSİK:** `/arac/[id]` genel sayfası (Next.js sayfası, API route değil) — rate limit YOK,
  ama UUID tahmini pratik değil (bkz. H2 tartışması).

### LOGGING / AUDIT
Kritik işlemler için ayrı bir "audit log" tablosu/mekanizması YOK — yalnızca
`console.warn`/`console.error` ile hata durumları loglanıyor (Netlify function logs'a
gider, kalıcı/sorgulanabilir bir audit trail değil). Admin'in bir bayiyi silmesi
(`DELETE /api/admin/shops/[id]`), plan değiştirmesi, sipariş durumunu güncellemesi gibi
işlemler "kim yaptı, ne zaman" şeklinde ayrı bir kayıt tutmuyor — yalnızca sonucun kendisi
(ör. `updatedAt`) saklanıyor. Ödeme (iyzico) tarafında `console.warn` ile tutar uyuşmazlığı
logu var ama kalıcı değil. Bu, KÜÇÜK ölçekli bir platformda (tek/az admin) düşük risk ama
büyüdükçe önemli bir eksik olacaktır.

### KVKK / VERİ MİNİMİZASYONU
`app/kvkk/page.tsx` incelendi — sayfa üstte açıkça "Bu metin bir ŞABLONDUR" uyarısı
içeriyor ve `[Firma Unvanınız]`, `[Adres]`, `[E-posta]`, `[Telefon]` gibi DOLDURULMAMIŞ
placeholder alanlar içeriyor. Bu, canlı bir üretim sitesinde yasal olarak eksik bir KVKK
aydınlatma metni anlamına gelir (bkz. aşağıda K1). İçerik yapısı (veri sorumlusu/veri
işleyen ayrımı, platform kullanıcıları vs araç sahipleri ayrımı) doğru kurgulanmış, yalnızca
gerçek şirket bilgileriyle doldurulması gerekiyor.

### PRODUCTION GÜVENLİK HEADER'LARI
`next.config.js` incelendi — TAMAMI mevcut: Content-Security-Policy (makul, sıkı,
yalnızca gerekli domain'lere izin veriyor — Unsplash img-src, Facebook Pixel script/connect-src),
X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy:
strict-origin-when-cross-origin, Permissions-Policy (yalnızca camera=self açık, gerekçesi
QR tarama), Strict-Transport-Security (max-age 2 yıl + includeSubDomains + preload).
Sorun bulunmadı — bu, çoğu üretim SaaS'ında bile eksik olan bir alan, burada tam.

---

## KVKK BULGUSU (ayrı madde)

### K1 — KVKK Aydınlatma Metni yayında bir ŞABLON, gerçek şirket bilgileriyle doldurulmamış
- **İlgili dosya:** `app/kvkk/page.tsx`
- **Risk:** Sayfa canlıda erişilebilir durumda ancak `[Firma Unvanınız]`, `[Adres]`,
  `[E-posta]`, `[Telefon]` gibi köşeli parantezli placeholder'lar içeriyor. 6698 sayılı
  KVKK m.10 uyarınca veri sorumlusunun kimliği ve iletişim bilgilerinin AÇIK ve GERÇEK
  olarak belirtilmesi zorunludur.
- **Önerilen çözüm:** Zeki'nin gerçek şirket/şahıs unvanı, adresi, e-postası, telefonu ile
  doldurulmalı; ardından bir hukuk danışmanına onaylatılması (sayfanın kendisinde zaten
  önerildiği gibi) tavsiye edilir. Bu bir kod değişikliği değil, içerik/metin güncellemesidir.
- **Düzeltme önceliği:** Orta-Yüksek (yasal uyum riski, teknik güvenlik açığı değil).
