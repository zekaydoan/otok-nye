# OtoHafıza — Güvenlik Düzeltme Günlüğü

`SECURITY_AUDIT.md` (bulgular) ve `SECURITY_FIX_PLAN.md` (planlar) referans alınarak
yapılan değişiklikler. Yalnızca CRITICAL/HIGH bulgular ve KVKK placeholder'ı kapsandı.

## 2026-08-16 — H1: Plan yükseltmesi artık ödeme doğrulaması olmadan anında aktif olmuyor

**Bulgu:** `app/api/shop/plan/route.ts` — bayi, gerçek bir ödeme doğrulaması yapılmadan
kendi hesabını ücretli plana (business dahil) anında yükseltebiliyordu.

**Değişiklik:**
- `lib/types.ts` — `Shop`'a `pendingPlan?: Plan` ve `pendingPlanRequestedAt?: string` eklendi.
- `app/api/shop/plan/route.ts` — `plan === "free"` davranışı AYNEN korundu (anında, risksiz).
  `plan !== "free"` artık `shop.plan`'i değiştirmiyor; yalnızca `pendingPlan` set ediliyor ve
  `notifyAdmins()` ile admin'e e-posta gidiyor. Yanıt: `{ ok: true, pending: true }`.
- `app/api/admin/shops/[id]/plan/route.ts` — admin planı elle aktive ettiğinde
  `pendingPlan`/`pendingPlanRequestedAt` temizleniyor.
- `components/PlanSelector.tsx` — beklemedeki plan için "Onay Bekleniyor" rozeti ve
  bilgilendirme mesajı eklendi.
- `app/dashboard/plan/page.tsx` — `pendingPlan` prop'u geçiliyor.
- `app/admin/bayiler/[id]/page.tsx` — admin, bayinin beklemedeki plan talebini
  (talep tarihiyle birlikte) görebiliyor.

**Regresyon riski:** Düşük-orta. Mevcut ücretli (`pro`/`business`) bayilerin erişimi
etkilenmedi — yalnızca YENİ yükseltme talebi akışı değişti. `free`'ye dönüş davranışı
hiç değişmedi.

**Test edilmesi gerekenler (henüz otomatik test yazılmadı, manuel doğrulama önerilir):**
- Ücretsiz bir bayi ücretli plan seçtiğinde `shop.plan` değişmemeli, admin'e mail gitmeli.
- Aynı bayi `free`'ye dönerse anında uygulanmalı.
- Admin panelinden plan aktive edildiğinde `pendingPlan` temizlenmeli.

---

## 2026-08-16 — H2: Etiket token bind ve araç arama endpoint'lerine rate limiting eklendi

**Bulgu:** `app/api/etiket-token/[token]/bind/route.ts` ve `app/api/vehicles/search/route.ts`
rate limiting olmadan çalışıyordu.

**Değişiklik:**
- `app/api/etiket-token/[token]/bind/route.ts` — mevcut `sticker-order` deseniyle tutarlı,
  `checkRateLimit("etiket-bind", shopId|ip, 30, 60*60*1000)` eklendi (saatte 30 deneme —
  bir siparişin tüm etiketlerini art arda bağlama gibi normal kullanımı etkilemeyecek
  kadar cömert).
- `app/api/vehicles/search/route.ts` — `checkRateLimit("vehicle-search", shopId, 60, 60*1000)`
  eklendi (dakikada 60 arama).

**Uygulanmadı (bilinçli, planın "opsiyonel" işaretlediği adım):** Token uzunluğunu
12'den 20 karaktere çıkarma (`lib/blobStore.ts` `createStickerTokens`) — rate limiting
tek başına yeterli koruma sağladığından ve bu değişiklik zaten basılmış fiziksel
etiketlerle ilgili ek dikkat gerektirdiğinden şimdilik ertelendi. İstenirse ayrı bir
adımda yapılabilir.

**Regresyon riski:** Çok düşük — eşikler normal kullanım desenlerinin belirgin şekilde
üzerinde tutuldu.

---

## 2026-08-16 — KVKK placeholder'ları dolduruldu

**Bulgu:** `/kvkk` sayfası `[Firma Unvanınız]`, `[E-posta]`, `[Adres]`, `[Telefon]`
placeholder'larını içeriyordu.

**Değişiklik:** `app/kvkk/page.tsx` — firma unvanı ("SARPER DİJİTAL TEKNOLOJİLER VE
KİRALAMA A.Ş.") ve e-posta (hello@otohafiza.com) dolduruldu. **Açık adres ve telefon
bilgisi elimde olmadığından uydurulmadı** — sayfada vurgulu (`[Adres bekleniyor]`,
`[Telefon bekleniyor]`) olarak bırakıldı, Zeki'den bu bilgiler istendi.

**Not:** Bu metin hâlâ bir taslaktır, yayına tam hazır hâle getirilmeden önce hukuk
danışmanı onayı öneriliyor (sayfadaki uyarı kutusu bunu belirtiyor).

---

## Ele alınmayan (kapsam dışı bırakılan) bulgular

- H1 Adım 2 (iyzico ile gerçek tekrarlayan ödeme entegrasyonu) — ayrı bir proje,
  bu denetimin kapsamı dışında, yol haritası notu olarak `SECURITY_FIX_PLAN.md`'de duruyor.
- MEDIUM/LOW/INFO seviyesindeki bulgular (`SECURITY_AUDIT.md`'ye bakınız) — yalnızca
  CRITICAL/HIGH ve KVKK istenmişti, bunlar henüz düzeltilmedi.
