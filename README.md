# OtoHafıza

Araç bakım işletmeleri (tamirciler, oto servisler, galeriler) için QR kodlu, otomatik kayıt tutan yağ bakım defteri SaaS'ı.

## Özellikler

- Tamirci firma hesabı (kayıt/giriş), her firmanın kendi araç listesi
- Araç kaydı: plaka (format doğrulamalı), marka/model (hızlı seçim listesi), model yılı, araç sahibi bilgisi
- Yağ bakım kaydı: tarih, saat, yağ markası/modeli, kaç kg konulduğu, km, filtre bilgisi — hepsi otomatik olarak geçmişe eklenir
- Bakım kaydına öncesi/sonrası fotoğraf ekleme (tarayıcıda otomatik sıkıştırılır)
- Sonraki bakım tarihi/km takibi; panelden tek tıkla WhatsApp gönderimi + günlük otomatik WhatsApp hatırlatma altyapısı (bkz. "Otomatik WhatsApp Hatırlatma" bölümü — sağlayıcı bağlanana kadar dormant çalışır)
- Her bakım kaydı için markalı, doğrulama QR'lı PDF servis fişi
- Her araç için benzersiz QR kod + firma adı/telefonu için reklam alanı içeren yazdırılabilir etiket
- QR okutulduğunda açılan, giriş gerektirmeyen genel görünüm sayfası (`/arac/[id]`) — plaka, marka, model ve tüm yağ bakım geçmişini gösterir
- Abonelik planları (Ücretsiz / Pro / İşletme / İşletme Yıllık — yıllıkta 2 ay ücretsiz kampanyası) — panelden seçilip hesaba kaydedilir
- Gerçek içerikli KVKK aydınlatma metni (`/kvkk`) ve kayıt/araç ekleme formlarında açık rıza onayı
- **Paylaşımlı araç defteri:** Bir araç hangi bayi tarafından eklenirse eklensin, plaka ile arayıp bulan başka bir yetkili bayi de o araca bakım kaydı ekleyebilir. Araç, kayıt ekleyen her bayinin kendi "Araçlarım" listesinde görünür — araç tek bir bayiye kilitli değildir, geçmişi araçla birlikte taşınır.
- **Km tutarlılık uyarısı:** Bir sonraki bakım kaydında kilometre bir öncekinden düşükse (klasik km düşürme göstergesi), sistem otomatik uyarı verir — panelde detaylı, herkese açık sayfada "tutarsızlık var" olarak.
- **Bakım düzenliliği skoru + paylaşılabilir satış raporu:** Geçmiş kayıtlardan "Düzenli Bakımlı / Bakımlı / Düzensiz Bakım" rozeti hesaplanır. Panelden "📄 Satış Raporu Oluştur" ile token'lı, girişsiz erişilebilen özel bir bağlantı üretilir (`/arac/[id]/rapor/[token]`) — ikinci el satışta paylaşılabilir, fiziksel QR etiketinden farklı olarak sadece bilinçli paylaşılan kişiler görür.
- **Kamera ile QR tarama:** Panelde "📷 QR ile Ara" butonuyla usta telefon kamerasıyla aracın üzerindeki etiketi tarayıp doğrudan o aracın kaydına gider (jsQR, native bağımlılık yok, iOS Safari dahil çalışır).
- **Yaklaşan Bakımlar widget'i:** Dashboard'da bu bayinin ilgilendiği araçlardan bakım zamanı gecikmiş/yaklaşan olanlar, tek tıkla WhatsApp hatırlatma butonuyla listelenir.
- **Sık kullanılan yağ hızlı seçimi:** Bayi bir yağ markası/modelini favorilere ekleyebilir; sonraki kayıtlarda tek tıkla seçilir, elle yazmaya gerek kalmaz.
- **Özet açık, detay üyelere özel:** QR okutan girişsiz bir ziyaretçi sadece plaka/marka/model, son bakım tarihi ve kaç kayıt olduğunu görür. Yağ markası/modeli, km, notlar, fotoğraflar, servis fişi (PDF) gibi detaylar ve tüm geçmiş listesi yalnızca giriş yapmış (üye) bayilere açıktır — bizi kullanmayan bir usta/bayi detaya ulaşmak için üye olmak zorunda kalır.
- **Araç bilgilerini düzenleme:** Araç satıldığında plaka ve/veya sahibi adı/telefonu panelden güncellenebilir (`/dashboard/araclar/[id]/duzenle`) — paylaşımlı defter politikasıyla tutarlı olarak herhangi bir yetkili bayi düzenleyebilir. Bakım geçmişi olduğu gibi korunur (araç kimliği/QR bağlantısı değişmez). Plaka değişirse panelde etiketi yeniden yazdırma hatırlatması gösterilir; sahibi telefonu güncellenmezse hatırlatma SMS'leri eski sahibe gitmeye devam edebileceğinden bu alanın da güncellenmesi önerilir.
- **Mobil öncelikli tasarım:** Tüm paneller ve formlar telefon ekranına göre tasarlandı — bakım geçmişi masaüstünde tablo, telefonda kart listesi olarak gösterilir; butonlar ve giriş alanları dokunmatik kullanım için büyütüldü; sayfalar Inter fontu, favicon ve ana ekrana eklenebilir PWA ikonlarıyla geldi (usta telefonuna "uygulama gibi" ekleyebilir).
- **Etiket Mağazası:** Bayiler panelden (`/dashboard/etiket-siparis`) motor bölmesi gibi zorlu koşullara dayanıklı, profesyonel basılmış QR etiket sipariş edip iyzico Checkout Form üzerinden kartla ödeyebilir. Kargo takibi elle yönetilir; admin panelinden (`/admin/siparisler`) sipariş durumu ve takip numarası güncellenir. Bkz. aşağıdaki "Etiket Mağazası" bölümü.

## Güvenlik

- **AUTH_SECRET zorunluluğu:** Üretim ortamında (`NODE_ENV=production`) `AUTH_SECRET` tanımlı değilse uygulama oturum işlemlerini reddeder; bilinen/varsayılan bir anahtarla oturum jetonu (JWT) sahtelenmesi engellenir.
- **Hız sınırlama (rate limiting):** Giriş denemeleri (e-posta+IP başına 15 dakikada 8 deneme), hesap oluşturma (IP başına saatte 5) ve manuel SMS hatırlatma (araç başına saatte 3) sınırlandırıldı — kaba kuvvet ve SMS maliyet istismarına karşı. Not: Netlify Blobs atomik sayaç desteklemediği için bu "best-effort" bir korumadır, çok yüksek trafikte kesin/atomik değildir.
- **Çerez güvenliği:** Oturum çerezi `httpOnly`, üretimde `secure` ve `sameSite=strict` — istemci tarafı script'ler çerezi okuyamaz, siteler arası isteklerde gönderilmez (CSRF'ye karşı).
- **Güvenlik başlıkları:** Content-Security-Policy, X-Frame-Options (tıklama hırsızlığına karşı), X-Content-Type-Options, Referrer-Policy, Permissions-Policy ve HSTS tüm sayfalarda `next.config.js` üzerinden ayarlandı.
- **Fotoğraf yükleme:** Yalnızca jpeg/png/webp/gif kabul edilir — SVG gibi biçimler script içerebildiği ve doğrudan açıldığında tarayıcıda çalıştırılabildiği için (depolanan XSS riski) reddedilir.
- **Girdi sınırları:** Tüm API uçlarında metin alanları için sunucu taraflı uzunluk/sayı sınırları eklendi (aşırı büyük payload'larla depolama istismarına karşı).
- **Yetkilendirme:** Detay içeren tüm uçlar (araç detayı, fotoğraf, PDF fişi) giriş yapılmadan 401 döner; genel QR sayfası yalnızca özet gösterir (bkz. "Özet açık, detay üyelere özel").
- Bu, profesyonel bir sızma testinin yerini tutmaz — üretime almadan önce bağımsız bir güvenlik incelemesi önerilir.

## Ölçeklenebilirlik

Detaylı kapasite analizi için `kapasite-analizi.md` dosyasına bakın. Bu analiz sonrası uygulanan "hızlı düzeltmeler":

- **Hatırlatma görevi henüz tek parça:** `netlify/functions/send-maintenance-reminders.ts` şu an tüm filoyu tek bir Scheduled Function çalışmasında tarıyor (Netlify'ın standart Scheduled Function süre sınırına tabi). Bugünkü ölçekte (test/erken aşama) sorun değil; araç sayısı büyüyüp tarama süresi sınıra yaklaşırsa, görevi ince bir tetikleyici + bir Background Function işçisine (15 dakikaya kadar çalışabilen, sayfalamalı) bölmek gerekecek — bu henüz yapılmadı, büyüme belirtisi görülünce ele alınmalı.
- **Kritik noktalarda güçlü tutarlılık (`consistency: "strong"`):** Netlify Blobs varsayılan olarak nihai tutarlılıdır (güncellemelerin yayılması 60 saniyeye kadar sürebilir). Plaka benzersizlik kontrolünde ve bir bakım kaydı eklendikten hemen sonra panelin o kaydı göstermesi gereken okumalarda strong consistency kullanılarak "az önce eklediğim şeyi göremiyorum" sınıfı hatalar önlendi.
- **Bayi kayıtlarında iyimser kilitleme:** `lib/blobStore.ts` içindeki `updateShopFields`, ETag tabanlı koşullu yazım (`onlyIfMatch`) ile aynı bayi kaydına eşzamanlı yapılan "oku-değiştir-yaz" işlemlerinin (favori yağ ekleme, plan değiştirme) birbirini sessizce ezmesini önlüyor; çakışma olursa otomatik yeniden dener.

## Teknoloji

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Veri katmanı: Netlify Blobs (`@netlify/blobs`) — ekstra veritabanı kurulumu gerekmez (araç fotoğrafları da Blobs'ta saklanır)
- Kimlik doğrulama: bcryptjs (şifre hash) + jose (JWT, httpOnly cookie)
- QR kod: `qrcode.react` (arayüz) + `qrcode` (PDF içine gömülen QR)
- PDF servis fişi: `pdf-lib`
- Günlük otomatik WhatsApp hatırlatma: Netlify Scheduled Function (`netlify/functions/send-maintenance-reminders.ts`, her gün 06:00 UTC / 09:00 TR)

## Otomatik WhatsApp Hatırlatma

Bakım zamanı yaklaşan/geçen araçlar için her gün otomatik çalışan bir tarama var
(`netlify/functions/send-maintenance-reminders.ts` → `lib/blobStore.listDueReminders` →
`lib/whatsappReminder.ts`). **Şu an "dormant" durumda:** `WHATSAPP_API_KEY` ve
`WHATSAPP_API_URL` ortam değişkenleri tanımlı olmadığı için tarama her gün çalışıyor
ama gerçek mesaj göndermiyor, sadece konsola logluyor — hiçbir müşteriye mesaj
gitmiyor, uygulamanın geri kalanını etkilemiyor.

Neden hâlâ dormant: WhatsApp Business Platform'da sınırsız/canlı gönderim yapabilmek
için Meta'nın resmi şirket evrakı (vergi levhası, imza sirküleri vb.) istediği bir
"Business Verification" süreci gerekiyor — bu da şirket kuruluşunun tamamlanmasını
bekliyor. Kuruluş tamamlanıp bir WhatsApp API sağlayıcısıyla (ör. Netgsm'in WhatsApp
Business modülü) anlaşma yapıldığında:

1. Netlify → Site ayarları → Environment variables içine `WHATSAPP_API_KEY` ve
   `WHATSAPP_API_URL` eklenir.
2. `lib/whatsappReminder.ts` içindeki `sendWhatsAppReminder` fonksiyonu, seçilen
   sağlayıcının gerçek istek/yanıt formatına göre güncellenir (şu an generic bir
   POST isteği taslağı var).
3. Mesaj metni Meta'ya "utility" kategorisinde şablon olarak onaylatılır
   (`lib/whatsappReminder.ts` → `buildAutoReminderMessage` fonksiyonundaki metin,
   şablonun taslağıdır — panelden tek tıkla manuel gönderim yapan ayrı bir
   `buildReminderMessage` fonksiyonu da var, bkz. `lib/maintenance.ts`, ikisini
   karıştırmayın).

Başka hiçbir dosyanın değişmesi gerekmez — tarama mantığı, tekrar gönderimi
engelleyen döngü takibi (`hasReminderBeenSent`/`markReminderSent`) ve zamanlama
zaten hazır ve test edilebilir durumda.

### Evet/Hayır butonuyla otomatik randevu

Hatırlatma mesajına iki hızlı cevap butonu ekleniyor: "Evet, randevu oluşturalım" /
"Hayır, şimdilik değil" (bkz. `send-maintenance-reminders.ts` içindeki `buttons`
parametresi, `lib/whatsappReminder.ts` → `encodeConfirmationPayload`). Müşteri
"Evet"e bastığında WhatsApp bunu `app/api/whatsapp/webhook/route.ts` uç noktasına
bildirir; bu uç nokta otomatik olarak bir randevu kaydı açar (`source: "whatsapp_onay"`)
— bayi bunu hem Randevular sayfasında hem de panel header'ındaki Randevular
ikonunun üzerindeki kırmızı sayı rozetinde görür (bkz. `countUnseenWhatsappAppointments`).
Rozet, bayi Randevular sayfasını ziyaret edince otomatik sıfırlanır.

Bu uç nokta da aynı sebeple (Meta iş doğrulaması bekliyor) henüz canlı çalışmıyor —
kod tarafı hazır. Devreye almak için ek olarak:

```
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...   # Meta'nın webhook kaydı sırasında istediği doğrulama token'ı
WHATSAPP_APP_SECRET=...             # Gelen isteklerin imzasını doğrulamak için (Meta App ayarları)
```

ve Meta App ayarlarında webhook URL'si olarak `https://yagbakim-defteri.netlify.app/api/whatsapp/webhook`
tanımlanması yeterli.

**Merkezi mi, bayi kendi numarasından mı?** Mesajlar OtoHafıza'nın tek merkezi
WhatsApp hattından gönderiliyor (her bayiye ayrı Meta iş hesabı açtırmak büyük bir
kayıt engeli olurdu); mesaj içeriğinde bayinin adı ve telefonu geçtiği için müşteri
kimin hatırlattığını görür. "Kendi numaranızdan gönderin" (Meta Embedded Signup ile)
ileride üst pakete taşınabilecek ayrı bir özellik olarak değerlendirilebilir.

## Faz 1 Kapsamında Kapatılan Boşluklar

Piyasa analizinde tespit edilen ve bu sürümde kapatılan eksikler:

1. **Plaka doğrulama + hızlı marka/model seçimi** — `lib/plates.ts`. Gerçek zamanlı
   "ruhsattan otomatik çekme" resmi/ücretli bir API gerektirdiği için bu aşamada dahil
   edilmedi; ileride bu dosyaya bir plaka sorgu servisi eklenebilir.
2. **Otomatik WhatsApp bakım hatırlatma** — bakım kaydına eklenen "sonraki bakım"
   tarihi/km baz alınarak günlük otomatik tarama çalışıyor (bkz. "Otomatik WhatsApp
   Hatırlatma" bölümü; sağlayıcı bağlanana kadar dormant) + panelden tek tıkla
   WhatsApp mesajı gönderilebiliyor.
3. **PDF servis fişi** — her kayıt için `/api/vehicles/[id]/records/[recordId]/pdf`
   üzerinden markalı, doğrulama QR'lı fiş indirilebiliyor.
4. **KVKK aydınlatma metni** — `/kvkk` sayfası ve kayıt/araç ekleme formlarında açık
   rıza onayı eklendi. **Bu bir şablondur, yayına almadan önce hukuk danışmanınıza
   onaylatın.**
5. **Öncesi/sonrası fotoğraf** — bakım kaydına fotoğraf eklenip panelde ve genel
   görünüm sayfasında gösterilebiliyor.

## Netlify Projesi

Bu proje için Netlify'da **yagbakim-defteri** adında bir site zaten oluşturuldu
(site ID: `beb5d615-d68d-4a08-9720-8c2783e666a0`) ve `AUTH_SECRET` ortam değişkeni
tanımlandı. Siteye https://app.netlify.com/projects/yagbakim-defteri adresinden
ulaşabilirsiniz. *(Bu, sadece Netlify'daki teknik proje/alt alan adıdır; markanız
"OtoHafıza" olarak değişti. İsterseniz Netlify panelinden Site settings → Change
site name yoluyla proje adını da `otohafiza` yapıp kendi alan adınızı
bağlayabilirsiniz — henüz canlıda gerçek kullanıcı olmadığı için bu değişiklik
risksizdir.)*

**Önemli not:** Bu oturumdaki çalışma alanının internet erişimi kısıtlı olduğu için
(npm paket kaydına erişim engellendi) bağımlılıkları buradan kurup canlıya
otomatik alamadım. Aşağıdaki adımları kendi bilgisayarınızda birkaç dakikada
tamamlayabilirsiniz.

## Kendi Bilgisayarınızda Canlıya Alma

1. Bu klasörü bilgisayarınıza indirin (bu proje çıktı klasöründe zaten mevcut).
2. Terminalde klasöre girin ve bağımlılıkları kurun:
   ```
   npm install
   ```
3. Netlify CLI kurulu değilse kurun ve siteye bağlanın:
   ```
   npm install -g netlify-cli
   netlify login
   netlify link --id beb5d615-d68d-4a08-9720-8c2783e666a0
   ```
4. Canlıya alın:
   ```
   netlify deploy --prod
   ```
   (Build komutu ve `.next` publish ayarı `netlify.toml` içinde zaten tanımlı.)

Alternatif olarak bu klasörü bir GitHub deposuna yükleyip Netlify panelinden
"Import from Git" ile siteyi o depoya bağlayabilirsiniz; böylece her `git push`
sonrası otomatik yeniden deploy olur.

## Yerel Geliştirme

```
npm install
netlify dev
```
`netlify dev` kullanmanız önerilir; bu sayede Netlify Blobs yerel ortamda da
otomatik olarak simüle edilir (sadece `next dev` ile Blobs çalışmayabilir).

## Ödeme / Abonelik Notu

Plan seçimi şu anda hesabınıza kaydediliyor ancak gerçek kredi kartı tahsilatı
bağlı değil. Canlıda otomatik tahsilat için kendi ödeme sağlayıcı hesabınızın
(iyzico, Stripe vb.) API anahtarlarını ortam değişkeni olarak eklemeniz ve
`/api/shop/plan` uç noktasına ödeme adımını entegre etmeniz gerekir. Aşağıdaki
Etiket Mağazası özelliği iyzico'yu zaten entegre ediyor (`lib/iyzico.ts`) — aynı
API anahtarları/altyapı, ileride abonelik tahsilatını otomatikleştirmek için de
kullanılabilir (iyzico'nun ayrı bir "Abonelik" API'si de mevcut, bkz. docs.iyzico.com).

## Etiket Mağazası (Fiziksel QR Etiket Sipariş + Ödeme)

Bayiler, panelden kendi yazdırdıkları etiket yerine dayanıklı/su geçirmez,
profesyonel basılmış bir QR etiket sipariş edip kartla ödeyebilir
(`/dashboard/etiket-siparis`). Ödeme, iyzico'nun barındırdığı Checkout Form
(hosted ödeme sayfası) üzerinden alınır — kart bilgileri hiçbir zaman bu
sunucuya ulaşmaz.

**Gerekli ortam değişkenleri** (`.env.example`'a eklendi):

```
IYZICO_API_KEY=...
IYZICO_SECRET_KEY=...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com   # canlıda https://api.iyzipay.com
ADMIN_EMAILS=siz@ornek.com                          # virgülle ayrılmış, /admin/siparisler erişimi
```

**Akış:**

1. Bayi `/dashboard/etiket-siparis` formunu doldurur (adet, teslimat adresi, T.C.
   Kimlik No — iyzico'nun kart güvenliği için zorunlu tuttuğu bir alan,
   kaydedilmez), Mesafeli Satış Sözleşmesi'ni (`/mesafeli-satis-sozlesmesi`)
   onaylar.
2. `POST /api/etiket-siparis` bir sipariş kaydı oluşturur ve iyzico
   Checkout Form oturumunu başlatır (`lib/iyzico.ts`); bayi iyzico'nun
   `paymentPageUrl` adresine yönlendirilir.
3. Ödeme tamamlandığında iyzico, `POST /api/etiket-siparis/callback`
   adresine `token` ile geri yönlendirir. Sunucu bu token'la CF-Retrieve
   çağrısı yaparak ödemeyi doğrular (callback verisine asla doğrudan
   güvenilmez) ve sipariş durumunu günceller.
4. Admin (`ADMIN_EMAILS`'te tanımlı hesap), `/admin/siparisler` sayfasından
   ödemesi onaylanan siparişleri görür, kargo firması/takip numarası girip
   durumunu ("Hazırlanıyor" → "Kargoda" → "Teslim Edildi") elle günceller.
   Aynı sayfadan etiket birim fiyatı da değiştirilebilir (fiyat henüz
   kesinleşmedi, tedarikçi araştırması sonrası güncellenmeli — varsayılan
   29₺/adet, `lib/blobStore.ts` içindeki `DEFAULT_STICKER_UNIT_PRICE_TRY`).

**Önemli — canlıya almadan önce:**

- `lib/iyzico.ts`, resmi iyzico dokümantasyonuna göre yazıldı ve statik olarak
  gözden geçirildi, ancak bu ortamda iyzico'nun ağına erişim olmadığından
  **gerçek bir sandbox hesabıyla uçtan uca test edilmedi**. Sandbox
  anahtarlarınızla en az bir tam sipariş + ödeme + callback akışını mutlaka
  test edin.
- `/mesafeli-satis-sozlesmesi` sayfası bir **taslak şablondur**, hukuki tavsiye
  değildir — köşeli parantez içindeki alanları doldurup bir hukuk danışmanına
  onaylatmadan yayına almayın. Alıcılarınızın (servis/tamirci işletmeleri) bu
  satın alımı ticari amaçla yaptığından, cayma hakkı hükümlerinin yasal
  zorunluluk mu yoksa gönüllü ticari politika mı olacağı ayrıca teyit
  edilmeli.
- Etiket birim fiyatı henüz araştırma sonrası netleşmedi; canlıya almadan önce
  admin panelinden gerçekçi bir fiyatla güncelleyin.
- iyzico webhook doğrulaması (bkz. docs.iyzico.com/en/advanced/webhook) bu
  sürümde eklenmedi — yalnızca callback + CF-Retrieve akışı kullanılıyor, bu
  çoğu durum için yeterlidir ama ekstra güvenilirlik için webhook da eklenebilir.

### Ödeme Güven Rozetleri

`components/PaymentBadges.tsx`, iyzico'nun kendi dokümantasyonunun önerdiği gibi
("iyzico ile Öde" ibaresi Visa/Mastercard logolarıyla birlikte gösterilmeli —
bkz. docs.iyzico.com/en/add-ons/iyzico-logo-pack) etiket sipariş formunda (ödeme
butonunun altında) ve ana sayfa alt bilgisinde gösteriliyor. **Bu ortamda dış
dosya indirme erişimi olmadığından iyzico'nun resmi logo paketi indirilemedi** —
bunun yerine Visa/Mastercard için yaygın kullanılan sade SVG temsilleri elle
çizildi. Canlıya almadan önce:

1. iyzico merchant panelinizden (veya yukarıdaki dokümantasyon linkinden) resmi
   logo paketini indirin,
2. `public/odeme/` klasörüne ekleyin,
3. `components/PaymentBadges.tsx` içindeki elle çizilmiş SVG'leri gerçek
   dosyalara (`<img src="/odeme/...">`) işaret edecek şekilde güncelleyin.

## Admin İstatistik Paneli ve Reklam Ölçümü

`/admin/istatistikler` (yalnızca `ADMIN_EMAILS`'te tanımlı hesaplara açık, bkz.
`lib/adminAuth.ts`) günlük site ziyareti, plan bazında abone dağılımı + tahmini
MRR, etiket mağazası ciro/sipariş sayısı ve şehir bazında satış kırılımını
gösterir.

**Ziyaret sayacı nasıl çalışır?** `components/PageviewTracker.tsx`, her sayfa
yüklendiğinde `/api/analytics/pageview` uç noktasına kimliksiz bir istek atar;
`lib/blobStore.ts`'teki `incrementDailyPageview` yalnızca günün toplam sayısını
bir artırır — IP, çerez veya başka bir kişisel tanımlayıcı saklanmaz. Aynı
sekmede sayfalar arası gezinirken tekrar saymamak için `sessionStorage`'a bir
bayrak bırakılır (kalıcı değildir, sekme kapanınca silinir). Netlify Blobs
atomik artırma desteklemediği için (bkz. `lib/rateLimit.ts`'teki aynı not) çok
yoğun eşzamanlı trafikte sayaç birkaç görüntülemeyi kaçırabilir — kaba bir
trend göstergesi için yeterlidir, kesin bir analitik motoru değildir. Trafik
büyüdükçe Plausible/Google Analytics gibi özel bir araca geçilmesi önerilir.

**Google Analytics 4 / Google Ads ve Meta Pixel entegrasyonu** —
`components/AdPixels.tsx`, diğer entegrasyonlardaki (`lib/email.ts`,
`lib/whatsappReminder.ts`) "dormant" desenin aynısını izler: ortam değişkeni
tanımlı olmadığı sürece hiçbir script yüklenmez.

1. Google Analytics hesabı açıp bir "veri akışı" (data stream) oluşturun,
   "G-" ile başlayan Ölçüm Kimliğini `NEXT_PUBLIC_GA_MEASUREMENT_ID` olarak
   tanımlayın. Aynı etiket Google Ads dönüşüm ölçümü için de kullanılabilir
   (Google Ads hesabını Analytics'e bağlayarak).
2. Meta Business Manager'da bir Pixel oluşturup kimliğini
   `NEXT_PUBLIC_META_PIXEL_ID` olarak tanımlayın.
3. Bu iki değişken tanımlandığında: sayfa görüntülemeleri otomatik, kayıt
   tamamlandığında `sign_up`/`CompleteRegistration`, etiket siparişi
   ödendiğinde `purchase`/`Purchase` (tutarla birlikte) dönüşüm olayı
   otomatik gönderilir (bkz. `app/kayit/page.tsx`,
   `components/PurchaseConversionPing.tsx`).
4. `/admin/istatistikler` sayfasındaki "Reklam Ölçümü Bağlantı Durumu"
   bölümünden hangi pikselin aktif olduğunu görebilirsiniz.

Bu iki ortam değişkeni bilinçli olarak `NEXT_PUBLIC_` önekiyle tanımlanır —
GA/Meta Pixel kimlikleri sır değildir, her sitenin sayfa kaynağında zaten
herkese açık şekilde görünür.

## Canlıya Alma Öncesi Bu Turda Eklenenler

- **Şifre sıfırlama akışı** (`/sifremi-unuttum`, `/sifre-sifirla`) — Resend REST
  API üzerinden e-posta gönderir (bkz. `lib/email.ts`). `RESEND_API_KEY`
  tanımlı değilse gönderim sessizce atlanır ve bağlantı konsola yazılır; canlıya
  almadan önce bir Resend hesabı açıp `RESEND_API_KEY`/`RESEND_FROM`
  ortam değişkenlerini tanımlamanız gerekir (`.env.example`'a eklendi).
- **Özel 404 / hata sayfaları** (`app/not-found.tsx`, `app/error.tsx`) —
  Next.js'in varsayılan çıplak sayfaları yerine markayla uyumlu ekranlar.
- **Favicon / PWA ikonları** yeni marka rozetiyle (yağ damlası + onay işareti)
  yeniden üretildi (`public/favicon.ico`, `icon-*.png`, `apple-touch-icon.png`).
- **Open Graph görseli** (`app/opengraph-image.tsx`) — bağlantı paylaşıldığında
  sosyal medyada markayla uyumlu bir önizleme kartı gösterir, ekstra dosya
  gerekmez (Next.js build sırasında otomatik üretir).
- **Kullanım Şartları sayfası** (`/kullanim-sartlari`) — KVKK metni gibi bu da
  bir **şablondur**, hukuk danışmanına onaylatmadan yayına almayın.
- **Yükleniyor (loading) durumları** — dashboard, araç detay ve herkese açık
  araç sayfalarında Netlify Blobs okumaları gecikirse iskelet (skeleton)
  gösterilir (`components/Skeleton.tsx`, ilgili `loading.tsx` dosyaları).
- **SSS bölümü** ana sayfaya eklendi (`components/FaqAccordion.tsx`).

## Klasör Yapısı

- `app/` — sayfalar ve API route'ları (Next.js App Router)
- `components/` — istemci tarafı formlar ve etiket bileşeni
- `lib/` — veri katmanı (`blobStore.ts`), kimlik doğrulama (`auth.ts`), tipler (`types.ts`)
