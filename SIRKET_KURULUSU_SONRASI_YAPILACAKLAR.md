# Şirket Kuruluşu Sonrası Yapılacaklar

Bu dosya, şirket resmi olarak kurulup vergi levhası/imza sirküleri gibi evraklar
eline geçtiğinde geri dönüp düzeltilmesi gereken, şu an bilinçli olarak
placeholder/kapalı bırakılmış yerlerin listesidir. Zeki'nin "şirket ile ilgili
işlemleri yapmaya başladık" demesi üzerine bu liste sırayla ele alınmalı.

## 1. Ücretli planları aç

- **Dosya:** `lib/planAvailability.ts`
- **Değişiklik:** `PAID_PLANS_ENABLED = false` → `true`
- Başka hiçbir yer değiştirilmesi gerekmiyor — hem `/api/shop/plan` hem
  `PlanSelector` hem `/dashboard/plan` sayfası bu tek bayrağı okuyor.
- Bu noktada ayrıca gerçek kart tahsilatı (iyzico/Stripe entegrasyonu,
  `/api/shop/plan`'e ödeme adımı eklenmesi) hâlâ yapılmamış olacak — bkz.
  README.md "Ödeme / Abonelik Notu". Şimdilik plan talebi admin onayına
  düşmeye devam ediyor, bu istenen bir davranışsa dokunmaya gerek yok.

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

---
Bu listeyi güncel tutmak için: yeni bir "şirket kuruluşunu bekliyor" durumu
eklerken lütfen bu dosyaya da bir madde ekleyin.
