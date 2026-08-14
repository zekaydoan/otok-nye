# OtoHafıza — Kapasite ve Ölçeklenebilirlik Analizi

**Senaryo:** Ayda 30.000 toplam ziyaretçi (tamirci/bayi panel kullanıcıları + QR okutan araç sahipleri dahil toplam trafik).

**Kısa cevap:** Ham istek trafiği açısından mevcut mimari (Next.js + Netlify Functions + Netlify Blobs) 30 bin ziyaretçi/ay yükünü rahatlıkla kaldırır — bu, Netlify'ın serverless altyapısı için düşük bir yüktür. Asıl risk trafik hacminde değil, **zamanla birikecek veri hacminde** ve **Netlify Blobs'un tasarım sınırlarında**: özellikle günlük SMS hatırlatma görevi, mevcut haliyle araç sayısı birkaç bini geçtiğinde sessizce yarıda kesilebilir. Aşağıda bunun gerekçesi, somut kod referansları ve önceliklendirilmiş bir yol haritası var.

---

## 1. Trafik profili tahmini

30.000 aylık ziyaretçiyi kaba bir varsayımla dağıtırsak:

- Ziyaretçi başına ortalama 2-4 dinamik istek (sayfa render + 1-2 API çağrısı; statik dosyalar CDN'den gelir, fonksiyonları tetiklemez) → **aylık ~60.000-120.000 fonksiyon çağrısı**.
- Günlük ortalama: ~2.000-4.000 istek → saatlik ortalama ~80-170 → **yoğun saatte muhtemelen dakikada 10-15 istek** civarında (5 kata varan sıçramalarla).

Bu, modern serverless altyapılar için çok düşük bir yüktür; Netlify Functions'ın işleyebileceği ham kapasitenin çok altındadır. **Yani "trafiği kaldırır mı" sorusunun cevabı evet** — asıl mesele aşağıdaki yapısal noktalar.

Not: Bazı üçüncü taraf kaynaklar Netlify'ın ücretsiz planında ayda 125.000 fonksiyon çağrısı dahil olduğunu belirtiyor; bu üst tahminimize (120.000) yakın. Kesin güncel rakamlar ve kredi bazlı fiyatlandırma detayları için canlıya almadan önce [netlify.com/pricing](https://www.netlify.com/pricing/) sayfasını doğrudan kontrol etmenizi öneririm — bu tür fiyatlandırma sayfaları sık güncellenir.

---

## 2. Netlify'ın kendi dokümantasyonundan doğrulanmış sınırlar

([docs.netlify.com/build/data-and-storage/netlify-blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) ve [docs.netlify.com/build/functions/scheduled-functions](https://docs.netlify.com/build/functions/scheduled-functions/) kaynaklarından, Ağustos 2026 itibarıyla):

| Konu | Sınır/Davranış |
|---|---|
| Zamanlanmış (Scheduled) fonksiyon süresi | **Sert 30 saniye** — aşılırsa fonksiyon kesilir, `Background Functions` için bu süre 15 dakikadır |
| Blobs tutarlılık modeli | Varsayılan **eventual (nihai) tutarlılık** — güncelleme/silme işlemleri tüm edge lokasyonlarına yayılması **60 saniyeye kadar** sürebilir |
| Blobs eşzamanlılık kontrolü | **Yok.** "Last write wins" — aynı anahtara yapılan çakışan yazımlarda sonuncusu kazanır, uygulama seviyesinde kilitleme mekanizması yoksa veri kaybı riski var |
| `list()` sayfalama | Sunucu sonuçları 1000'lik sayfalara böler; varsayılan olarak `list()` **tüm sayfaları otomatik çeker** — depo büyüdükçe bu çağrı yavaşlar |
| Blobs kullanım alanı (Netlify'ın kendi tavsiyesi) | "Karmaşık sorgular, eşzamanlılık kontrolü veya ilişkisel veri modeli gerektiren kullanımlar için" Netlify, kendi Blobs ürünü yerine **veritabanı entegrasyonlarını** öneriyor |
| Nesne/anahtar boyutu | Anahtar ≤ 600 bayt, nesne ≤ 5 GB, metadata ≤ 2 KB — bunlar bizim için sorun değil |

---

## 3. Kodda tespit edilen somut darboğazlar

### 🔴 Kritik — veri hacmi arttıkça kırılır

**a) Günlük SMS hatırlatma görevi (`netlify/functions/bakim-hatirlatma.mts`)**
Bu bir *Scheduled Function* — yani **30 saniyelik sert bir süre sınırına tabi**. Şu anki mantık:
1. `vehiclesStore.list()` ile **sistemdeki tüm araçları** çeker (araç sayısı arttıkça bu tek çağrı da yavaşlar — 1000'in üzerinde araçta otomatik çoklu sayfa çekimi gerekir).
2. Her araç için **ayrı bir** `oilRecordsStore.list({prefix})` çağrısı yapar (sıralı, N adet ağ isteği).

Bugün bu çalışıyor çünkü veri hacmi küçük. Ama araç sayısı birkaç bine ulaştığında (30 bin ziyaretçi/ay senaryosunda birkaç ay içinde beklenebilir bir rakam), bu döngü 30 saniyeyi aşar ve **fonksiyon ortadan kesilir** — listenin sonundaki araç sahipleri o gün hiç hatırlatma alamaz, üstelik hata da sessiz kalır (loglara düşer ama kimseye bildirim gitmez). Bu, ürünün temel vaadi olan "otomatik hatırlatma" özelliğini doğrudan tehdit eder.

**b) `updateShop` ve benzeri "oku-değiştir-yaz" desenleri**
`lib/blobStore.ts` içindeki `updateShop`, `getOrCreateReportToken` gibi fonksiyonlar tüm nesneyi okuyup değiştirip geri yazıyor. Blobs eşzamanlılık kontrolü sunmadığı için ("last write wins"), aynı bayinin iki sekmede aynı anda favori yağ eklemesi gibi nadir ama olası durumlarda bir güncelleme sessizce kaybolabilir. Düşük olasılıklı ama trafik arttıkça olasılığı artan bir risk.

### 🟡 Orta — kullanıcı deneyimini etkileyebilir

**c) Eventual consistency ile "az önce eklediğim kayıt görünmüyor" riski**
Varsayılan Blobs okuması nihai tutarlıdır (60 saniyeye kadar gecikme mümkün). `AddOilRecordForm` bir kayıt ekledikten hemen sonra `router.refresh()` çağırıyor — teorik olarak, yoğun anlarda kayıt henüz tüm edge'lere yayılmadan sayfa yenilenirse eski veri görülebilir. Bugünkü düşük trafikte pratikte fark edilmez ama büyüdükçe görünürlüğü artar.

**d) Plaka benzersizliği kontrolü de aynı riski taşır** — `getVehicleByPlate` eventual consistency ile okuyorsa, aynı plaka neredeyse eşzamanlı iki istekle (iki farklı bayi/sekme) gönderilirse teorik olarak iki kayıt oluşabilir.

### 🟢 Düşük — bugün sorun değil ama büyüdükçe maliyetli

**e) Fotoğraflar base64 metin olarak Blobs'ta saklanıyor** — ikili veriye göre ~%33 daha fazla yer kaplar, her görüntüleme bir fonksiyon çağrısı + base64 çözme gerektirir, CDN/görsel optimizasyonu yok.

**f) PDF servis fişi her istekte sıfırdan üretiliyor** — önbellek yok; aynı fişe tekrar tekrar bakan bir kullanıcı her seferinde yeniden PDF oluşturma maliyetine yol açar.

**g) `/arac/[id]` genel sayfasında (QR hedefı) önbellekleme başlığı yok** — çok okutulan bir QR etiketi her seferinde fonksiyonu tetikler; kısa süreli (ör. 30-60 sn) bir `Cache-Control` ile fonksiyon çağrısı sayısı azaltılabilir.

---

## 4. Öncelik sıralaması (etki × efor)

| # | Konu | Etki | Efor | Aciliyet |
|---|---|---|---|---|
| 1 | Hatırlatma cron görevini 30sn sınırına dayanıklı hale getirme (background function'a devretme / sayfalama+kuyruk) | Yüksek — temel özellik kırılıyor | Orta | **Şimdi** |
| 2 | Kritik okuma-sonrası-yazma noktalarında `consistency: "strong"` kullanımı (plaka kontrolü, kayıt ekleme sonrası) | Orta | Düşük | Yakında |
| 3 | `updateShop` gibi noktalarda `onlyIfMatch`/ETag ile iyimser kilitleme | Düşük-Orta | Orta | Yakında |
| 4 | Genel QR sayfasına kısa süreli önbellek başlığı | Düşük (maliyet/performans) | Düşük | İsteğe bağlı |
| 5 | Fotoğrafları Blobs yerine bir nesne depolama/CDN'e taşıma | Düşük (bugün için) | Yüksek | İleride |
| 6 | Tüm veri katmanını ilişkisel bir veritabanına (ör. Netlify Database/Postgres) taşıma | Uzun vadede en sağlam çözüm | **Çok yüksek** | Kullanıcı sayısı ciddi büyürse |

---

## 5. Üç yol haritası seçeneği

**A. Hızlı düzeltmeler (bu oturumda yapılabilir, düşük risk)**
1-4 numaralı maddeleri kapsar. Netlify Blobs mimarisi kalır. Cron görevi güvenli hale getirilir, tutarlılık riskleri kapatılır. 30 bin ziyaretçi/ay ve makul bir veri büyümesi (birkaç bin araç/kayıt) için yeterli.

**B. Hibrit — hızlı düzeltmeler + kademeli veri katmanı iyileştirmesi**
A'ya ek olarak fotoğraf depolamayı ayırma ve önbellekleme eklenir. Orta efor.

**C. Tam veritabanı geçişi**
14 API route'un ve veri katmanının tamamı ilişkisel bir veritabanına (Netlify Database — Postgres tabanlı — veya benzeri) taşınır. En sağlam uzun vadeli çözüm; gerçek indeksler, atomik sayaçlar, JOIN'ler mümkün olur. Ancak büyük bir yeniden yazım: bu ortamda `npm install`/derleme yapamadığımız için (bkz. önceki oturumlarda belgelenen sandbox kısıtı) canlıya alma riski daha yüksek olur ve muhtemelen birden fazla oturuma yayılması gerekir. Kullanıcı/veri hacmi gerçekten büyürse (ör. on binlerce araç kaydı) bu geçiş önerilir; bugünkü 30 bin ziyaretçi/ay hedefi için zorunlu değildir.

---

## Sonuç

Mevcut mimari **30 bin ziyaretçi/ay ham trafiğini** rahatlıkla kaldırır. Ancak **hatırlatma cron görevi**, veri hacmi büyüdükçe kırılacak somut ve öncelikli bir mühendislik borcudur — bu, "kullanıcı sayısı" değil "biriken araç/kayıt sayısı" ile orantılı bir risktir, dolayısıyla erken düzeltilmesi mantıklıdır. Diğer maddeler daha düşük öncelikli ama bilinmesi gereken noktalardır.

**Önerim:** A yol haritasıyla (hızlı düzeltmeler) başlamak — özellikle 1 ve 2 numaralı maddeler. Onaylarsanız uygulamaya geçebilirim.
