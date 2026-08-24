# OtoHafıza — Düzeltme Planı (CRITICAL + HIGH Bulgular)

Bu belge yalnızca `SECURITY_AUDIT.md`'deki **CRITICAL** ve **HIGH** seviyeli bulgular
için hazırlanmıştır. CRITICAL bulgu bulunmadı. HIGH seviyesinde 2 bulgu vardı (H1, H2)
— ikisi de çözüldü (H1: 24 Ağustos 2026, H2: daha önce).

Bu belge yalnızca bir PLANDIR — henüz hiçbir kod yazılmadı/değiştirilmedi.

---

## H1 — Bayi kendi planını ödeme doğrulaması olmadan ücretli plana yükseltebiliyor — ✅ ÇÖZÜLDÜ (24 Ağustos 2026)

> **Güncelleme notu:** Aşağıdaki plan tarihsel kayıt olarak korunuyor. Adım 1
> (`pendingPlan`/admin onay akışı) daha önce uygulanmıştı; Adım 2'de "orta
> vadeli, kapsam dışı" denen gerçek iyzico Abonelik (tekrarlayan ödeme)
> entegrasyonu de 24 Ağustos 2026'da canlıya alındı ve uçtan uca test edildi
> — artık bayi kartını doğrulamadan hiçbir ücretli plana geçemiyor. Aşağıda
> "BEKLEMEDE task #125" olarak anılan roadmap notu da bu iş tamamlandığı için
> güncelliğini yitirmiştir (o numaralandırma artık kullanılmıyor).

**Dosya:** `app/api/shop/plan/route.ts`

### Değişiklik adımları (küçük, kademeli)

1. **Adım 1 — Geçici acil önlem (en hızlı, en düşük riskli):** `POST` handler'ında,
   `plan !== "free"` durumunda isteği admin onayı gerektiren bir "beklemede" akışına
   yönlendirin. Somut olarak:
   - `Shop` tipine (`lib/types.ts`) `pendingPlan?: Plan` ve `pendingPlanRequestedAt?: string`
     alanları eklenir (opsiyonel, geriye dönük uyumlu).
   - `app/api/shop/plan/route.ts` POST'ta: `plan === "free"` ise mevcut davranış AYNEN
     kalır (serbestçe free'ye dönebilir — ücretsiz düşüş risksiz). `plan !== "free"` ise
     artık `shop.plan`'i DEĞİŞTİRMEZ; bunun yerine `updateShopFields` ile yalnızca
     `pendingPlan`/`pendingPlanRequestedAt` set edilir ve admin'e `notifyAdmins()` ile
     bildirim gönderilir (mevcut `lib/email.ts` altyapısı zaten var, `etiket-siparis`
     akışındaki `notifyAdmins` çağrısıyla aynı desen kullanılabilir).
   - Yanıt olarak istemciye `{ ok: true, pending: true }` dönülür; `PlanSelector.tsx`
     bileşeninde "Talebiniz alındı, admin onayladıktan sonra planınız aktif olacak"
     mesajı gösterilir (küçük bir UI metni değişikliği).
   - `app/api/admin/shops/[id]/plan/route.ts` (zaten var olan admin route'u) admin
     onayladığında hem `plan`'i set eder hem `pendingPlan`/`pendingPlanRequestedAt`'i temizler.

2. **Adım 2 — Orta vadeli (gerçek ödeme entegrasyonu):** Etiket siparişinde kullanılan
   iyzico Checkout Form akışının aynısı (`lib/iyzico.ts`, `app/api/etiket-siparis/route.ts`
   ve `callback/route.ts` deseni) plan yükseltmesi için de kurulmalı — iyzico'da
   TEKRARLAYAN ödeme (subscription) API'si ayrı bir entegrasyon gerektirir, bu READMEde
   zaten "BEKLEMEDE task #125" olarak not edilmiş. Bu adım bu denetimin kapsamı dışında,
   yalnızca yol haritası notu olarak eklenmiştir.

3. **Adım 3 — Doğrulama:** `updateShopFields` optimistic locking deseni zaten mevcut,
   yeni alanlar bu deseni bozmaz; ek bir race condition riski yok.

### Tahmini regresyon riski
- **Düşük-Orta.** `PlanSelector.tsx`'te buton davranışı değişecek (anında "Plan güncellendi"
  yerine "Talebiniz alındı" mesajı) — bu bir UX değişikliği, mevcut ücretli kullanıcıları
  ETKİLEMEZ (yalnızca YENİ yükseltme talepleri akışı değişir). `free`'ye dönüş davranışı
  hiç değişmiyor, bu yüzden mevcut kullanıcı akışlarının çoğu bozulmaz.
- Admin panelinde yeni bir "bekleyen plan talepleri" listesi/görünümü eklenmesi gerekebilir
  (opsiyonel — mevcut e-posta bildirimi + `admin/shops/[id]/plan` route'u ile manuel olarak
  da yönetilebilir, admin bayi detay sayfasını (`app/admin/bayiler/[id]/page.tsx`) açıp
  planı elle değiştirebilir).

### Test edilmesi gereken senaryolar
1. Ücretsiz plandaki bir bayi "İşletme" planını seçtiğinde: `shop.plan` DEĞİŞMEMELİ,
   `pendingPlan: "business"` set edilmeli, admin'e e-posta gitmeli.
2. Aynı bayi tekrar `free` planı seçerse: doğrudan (bekletmeden) `shop.plan = "free"`
   olmalı (mevcut davranış korunmalı).
3. Admin, `admin/shops/[id]/plan` üzerinden bayinin planını "business" yaparsa:
   `pendingPlan` temizlenmeli, bayi panelinde artık "business" aktif görünmeli.
4. Fatura bilgileri eksik bir bayi hâlâ `requiresBilling: true` ile aynı şekilde
   `/dashboard/fatura-bilgileri`'ne yönlendirilmeli (mevcut davranış korunmalı).
5. Eşzamanlı iki istek (aynı bayi, iki sekme) aynı anda plan değiştirmeye çalışırsa
   `updateShopFields`'in optimistic locking retry mekanizması hatasız çalışmalı.
6. Regresyon: mevcut ücretli plandaki (`pro`/`business`) bir bayinin oturumu/erişimi bu
   değişiklikten ETKİLENMEMELİ — `PLAN_LIMITS[shop.plan]` okuması her yerde aynı kalıyor.

---

## H2 — Etiket token bind endpoint'inde rate limiting eksik + token uzunluğu kısa

**Dosya:** `app/api/etiket-token/[token]/bind/route.ts`, `lib/blobStore.ts` (`createStickerTokens`)

### Değişiklik adımları (küçük, kademeli)

1. **Adım 1 — Rate limiting ekle (öncelikli, düşük risk):**
   `app/api/etiket-token/[token]/bind/route.ts` POST handler'ının başına, `getCurrentShopId()`
   kontrolünden hemen sonra `lib/rateLimit.ts`'teki `checkRateLimit` ve `getClientIp`
   import edilip çağrılır:
   ```
   const rate = await checkRateLimit("etiket-bind", `${shopId}|${getClientIp(req)}`, 10, 60 * 60 * 1000);
   if (!rate.allowed) return NextResponse.json({ error: "..." }, { status: 429 });
   ```
   Bu, `app/api/etiket-siparis/route.ts`'teki mevcut `sticker-order` rate limit deseniyle
   birebir tutarlı (kopyala-uyarla, yeni bir desen icat etmiyor).

2. **Adım 2 — Token uzunluğunu artır (opsiyonel, savunma derinliği):**
   `lib/blobStore.ts` içinde `createStickerTokens()` fonksiyonunda:
   ```
   const token = randomUUID().replace(/-/g, "").slice(0, 12);
   ```
   satırındaki `12` değerini `20`'ye çıkarmak (hâlâ tek bir `randomUUID()`'den türetildiği
   için maliyetsiz, format/QR kod boyutunu önemli ölçüde etkilemez — 20 hex karakter QR
   kodda 12'ye göre yalnızca birkaç mm ek yer kaplar). **DİKKAT:** Bu değişiklik yalnızca
   YENİ üretilecek token'ları etkiler; VAR OLAN, zaten basılmış fiziksel etiketlerdeki
   12 karakterlik token'lar hâlâ çalışmaya devam etmelidir (kod bu konuda zaten esnek —
   `getStickerToken(token)` yalnızca eşleşen anahtarı arıyor, sabit uzunluk varsaymıyor).
   Bu adım ACİL değildir, Adım 1 yeterli koruma sağlar.

3. **Adım 3 — `vehicles/search` endpoint'ine de rate limit eklenmesi (audit'te ayrı not
   edildi, H2'nin bir parçası olarak ele alınabilir):** `app/api/vehicles/search/route.ts`
   GET handler'ına `checkRateLimit("vehicle-search", shopId, 60, 60*1000)` gibi cömert
   ama var olan bir sınır eklenebilir — meşru kullanımı (panelden hızlı arama) etkilemeyecek
   kadar yüksek, kötüye kullanımı zorlaştıracak kadar düşük bir eşik.

### Tahmini regresyon riski
- **Çok düşük.** Rate limit eşiği (saatte 10 bind denemesi) gerçek kullanım desenine göre
  cömert tutulmalı — bir bayinin aynı oturumda art arda birden fazla fiziksel etiket
  bağlaması (ör. yeni gelen 20 etiketlik siparişi tek tek araçlara bağlama) normal bir
  akıştır, bu yüzden eşik çok düşük tutulmamalı (10-20/saat makul, `MAX_ORDERS_PER_HOUR = 5`
  ile aynı büyüklük mertebesinde ama bind işlemi sipariş vermekten daha sık olabileceği
  için biraz daha yüksek tutulması önerilir).
- Token uzunluğu artışı (Adım 2) YALNIZCA yeni token'ları etkiler, geriye dönük uyumluluk
  sorunu yaratmaz.

### Test edilmesi gereken senaryolar
1. Bir bayi, kendi 5 etiketini art arda (rate limit eşiğinin altında) sorunsuz bağlayabilmeli.
2. Rate limit eşiği aşıldığında 429 dönmeli ve `retryAfterSeconds` doğru hesaplanmalı.
3. Başarılı bir bind sonrası rate limit sayacı SIFIRLANMAMALI (yalnızca login gibi
   "başarılı girişte reset" mantığı burada uygun değil — sürekli deneme sınırlaması amaçlanıyor,
   bu yüzden `resetRateLimit` ÇAĞRILMAMALI, mevcut `sticker-order` deseninde de bind için
   reset yok, tutarlı olmalı).
3. Var olan (kod değişikliğinden ÖNCE üretilmiş, 12 karakterlik) token'lar hâlâ
   `/e/[token]` sayfasında ve bind endpoint'inde çalışmaya devam etmeli (geriye dönük
   uyumluluk regresyon testi).
4. Farklı bir bayinin token'ı bağlamaya çalışması hâlâ 403 ("başka bir yetkili servise ait")
   dönmeli — rate limit eklenmesi mevcut sahiplik kontrolünü bozmamalı.
5. `vehicles/search`'e rate limit eklenirse: normal panel kullanımında (art arda birkaç
   plaka arama) 429 ALINMAMALI; yalnızca anormal derecede hızlı/otomatik istek dizisinde
   tetiklenmeli.

---

## Genel not

Her iki değişiklik de mevcut kod tabanındaki YERLEŞİK desenleri (rate limiting için
`lib/rateLimit.ts`, admin onayı için `lib/adminAuth.ts` + `notifyAdmins`, optimistic
locking için `updateShopFields`) yeniden kullanır — yeni bir mimari kavram/kütüphane
gerektirmez. Bu, değişikliklerin küçük, gözden geçirilebilir ve düşük riskli PR'lar
hâlinde yapılabileceği anlamına gelir.
