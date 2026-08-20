# OtoHafıza — Hukuki Sözleşme Paketi

**Durum (20 Ağustos 2026 itibarıyla):** Şirket kuruluşu tamamlandı; MERSİS/vergi no/adres bilgileri tüm belgelere işlendi, sorumluluk/tazminat maddeleri güçlendirildi ve aşağıdaki 3 açık nokta çözüldü (bkz. "Son Denetimde Bulunan Noktalar" — artık "Çözüldü" durumunda). Belgeler canlı siteye yayınlanmaya hazırdır; yine de bir bilişim hukuku avukatına onaylatılması güçlü şekilde önerilir — bu paket hukuki tavsiye değildir.

**Hazırlanma tarihi:** Ağustos 2026 · Claude (Anthropic) ile birlikte, kapsamlı bir hukuki keşif (discovery) sürecinin ardından hazırlanmış, 20 Ağustos 2026'da şirket kuruluşu sonrası revize edilmiştir.

## Bu Klasördeki Belgeler

1. `01_SaaS_Kullanim_ve_Lisans_Sozlesmesi.md` — Ana sözleşme
2. `02_Kabul_Edilebilir_Kullanim_Politikasi_AUP.md`
3. `03_Abonelik_Odeme_Yenileme_Iptal_Iade_Politikasi.md`
4. `04_Mesafeli_Satis_Sozlesmesi.md` — Ek-A (fiziksel etiket) + Ek-B (dijital abonelik)
5. `05_Kullanim_Kosullari.md` — genel/kamuya dönük
6. `06_KVKK_Aydinlatma_Metni_ve_Gizlilik_Esaslari.md` — canlı `/kvkk` sayfasının revizyonu
7. `07_Cerez_Politikasi.md`
8. `08_Veri_Isleme_Sozlesmesi_DPA_ve_Alt_Veri_Isleyenler.md`
9. `09_Saha_Partner_Sozlesmesi.md`

## Hukuki Keşif Sürecinde Belirlenen Temel Kararlar

- Şirket: Sarper Dijital Teknolojiler ve Kiralama A.Ş., yetkili temsilci İbrahim Aydoğan (Genel Müdür); MERSİS No 0751112521900001, VKN 7511125219, Mesir V.D., Ticaret Sicil No 24016, adres Muradiye Mahallesi Zübeyde Hanım Cad. No:34/A Yunusemre/Manisa (20 Ağustos 2026'da netleşti).
- Platform yalnızca Türkiye'de faaliyet gösterecek; mobil uygulama kullanıcı sayısı arttıkça değerlendirilecek.
- Ürün şu an hiçbir AI/Claude/OpenAI servisini çalışma zamanında kullanmıyor — AI hükümleri şarta bağlı, minimal tek madde olarak yazıldı.
- Kaynak kodu şirket/kurucular kendisi yazdı (dış katkı yok) — IP mülkiyeti temiz.
- "OtoHafıza" markası **henüz tescilli değil** — TÜRKPATENT başvurusu öncelikli aksiyon.
- Sorumluluk üst sınırı: son 12 ayda ödenen abonelik bedeli (kasıt/ağır ihmal hariç).
- Yetkili yer: Manisa; zorunlu arabuluculuk sonrası dava yolu.
- Saha Partnerleri serbest meslek/bağımsız yüklenici statüsünde — muvazaa riski sözleşmede maddelerle azaltıldı ama fiili uygulamayla desteklenmesi şart.
- Netlify (barındırma/veritabanı) ve Resend (e-posta) verileri ABD'de işliyor — yurt dışı aktarım açık rızaya dayandırıldı (bkz. aşağıdaki kritik nokta).

## SaaS Hukuki Risk Analizi (Özet Tablo)

| # | Risk | Seviye | Önerilen Koruma | Belge |
|---|------|--------|------------------|-------|
| 1 | Kaynak kod kopyalanması/tersine mühendislik | Yüksek | Tersine mühendislik yasağı + IP mülkiyet maddesi + ticari sır koruması | SaaS Sözleşmesi, AUP |
| 2 | Marka tescilsiz | Yüksek (acil) | TÜRKPATENT başvurusu | — (idari işlem) |
| 3 | Rakip ürün geliştirilmesi | Orta | Dar kapsamlı, gizli bilgiye dayalı rekabet kısıtı (1 yıl) | SaaS Sözleşmesi Md.9.5 |
| 4 | Bayinin araç sahibi verisini kötüye kullanması | Orta-Yüksek | DPA'da net rol ayrımı + onay kutusu zorunluluğu | DPA, Kullanım Koşulları |
| 5 | Yurt dışına veri aktarımı (Netlify/Resend—ABD) | Orta (açık rıza geçici dayanak, standart sözleşme bekleniyor) | KVKK m.9 hiyerarşisi netleştirildi (yeterlilik > standart sözleşme/taahhütname > açık rıza-son çare); Netlify/Resend ile standart sözleşme imzalanana kadar açık rıza kullanılıyor — **avukat onayı hâlâ önerilir** | KVKK Metni §1.6, DPA §5.3 |
| 6 | Ödeme/tahsilat (iyzico) | Düşük-Orta | Kart verisi platforma dokunmuyor | Abonelik Politikası |
| 7 | Otomatik yenileme + iade uyuşmazlıkları | Orta | 14 gün cayma hakkı + gönüllü memnuniyet garantisi ayrımı | Mesafeli Satış, Abonelik Politikası |
| 8 | Kurucu Servis taahhüdünün geri çekilmesi | Orta | İlk 100 kayıt korunur, yalnızca yeni kayıtlar kapatılabilir | Abonelik Politikası Md.11 |
| 9 | Hesap/cihaz paylaşımı | Orta | AUP yasağı + fesih hakkı | AUP, SaaS Sözleşmesi |
| 10 | Scraping/bot/API kötüye kullanımı | Orta | AUP yasağı + rate limiting | AUP |
| 11 | Personel hesabı eylemlerinden sorumluluk | Düşük | Temsil esaslı madde | SaaS Sözleşmesi Md.4.5 |
| 12 | Partner muvazaa riski | Orta-Yüksek | Bağımsızlık kriterleri + fiili uygulama uyumu | Saha Partner Sözleşmesi Md.4 |
| 13 | 6 ay saklama vs. VUK/TTK asgari süreleri | Orta | Kademeli saklama süreleri | KVKK Metni Md.1.5 |
| 14 | Gelecekte AI özelliği eklenirse boşluk | Düşük | Şartlı minimal madde | SaaS Sözleşmesi Md.8 |
| 15 | WhatsApp Business API (Meta) aktifleşirse | Düşük (şimdilik) | Alt Veri İşleyenler Listesi güncellemesi | DPA Eki |
| 16 | Yetkili mahkeme/tahkim belirsizliği | Düşük-Orta | Manisa + zorunlu arabuluculuk + tüketici seçimlik hakkı saklı | Tüm belgeler |
| 17 | Sorumluluk sınırının Free kullanıcıda düşük olması | Orta | Kasıt/ağır ihmal istisnası (TBK m.115 uyumu) | SaaS Sözleşmesi Md.11.4 |
| 18 | Best-effort SLA'nın kurumsal beklentiyi karşılamaması | Düşük | İleride ayrı Kurumsal Ek Protokol | (opsiyonel, ileride) |
| 19 | Fesih sonrası veri export süresi | Düşük | 30 gün export + sonra silme | SaaS Sözleşmesi Md.12.4 |
| 20 | Şirketin henüz kurulmamış olması | ✅ Çözüldü (20 Ağustos 2026) | Kuruluş tamamlandı, MERSİS/vergi/adres tüm belgelere işlendi | Tümü |
| 21 | Sorumluluk/tazminat maddelerinin yetersizliği | ✅ Güçlendirildi (20 Ağustos 2026) | SaaS Sözleşmesi'ne "olduğu gibi" garanti reddi (Md.11.1) ve karşılıklı tazminat/indemnifikasyon maddesi (Md.11.7) eklendi | SaaS Sözleşmesi |

## Son Denetimde Bulunan Noktalar (20 Ağustos 2026'da gözden geçirildi)

1. **✅ Çözüldü — Mesafeli Satış Sözleşmesi madde numarası.** Ön Bilgilendirme Madde 6, Yürürlük Madde 7 olarak doğru numaralandırılmış hâlde teyit edildi (bkz. dosya 04).
2. **✅ Çözüldü — DPA'daki bildirim süresi.** Web araştırmasıyla doğrulandı: KVKK Kurulu'na bildirim süresi **72 saattir** (6698 sayılı Kanun m.12, Kurul kararları). DPA'daki Veri İşleyen→Veri Sorumlusu iç bildirim süresi (48 saat) BİLEREK bu 72 saatlik üst sınırdan kısa tutuldu — Veri Sorumlusu'na Kurul'a bildirim için tampon süre bırakır (bkz. dosya 08, Md.4.4).
3. **Kısmen çözüldü — Yurt dışı veri aktarımının hukuki sebebi.** 7499 sayılı Kanun'la değişen KVKK m.9 (2024 sonrası) incelendi: doğru hiyerarşi **yeterlilik kararı → uygun güvenceler (standart sözleşme/taahhütname) → açık rıza (yalnızca son çare, arızi aktarımlarda)**. Netlify/Resend'e yapılan aktarımlar sürekli/sistematik olduğundan, yalnızca açık rızaya dayanmak orta-vadede kırılgan bir zemin. KVKK Metni (§1.6) ve DPA (§5.3) artık standart sözleşme/taahhütnameyi hedef mekanizma olarak belirtiyor, açık rızayı ise bu tesis edilene kadarki geçici dayanak olarak çerçeveliyor. **Kalan iş:** Netlify ve Resend'in KVKK-uyumlu (veya adapte edilebilir bir EU SCC eşdeğeri) standart sözleşme sunup sunmadığının kontrol edilip imzalanması ve Kurul'a 5 iş günü içinde bildirilmesi — bu, bir KVKK danışmanı/avukat ile birlikte yürütülmesi gereken idari bir adımdır, yalnızca metin değişikliğiyle tamamlanamaz.

## Sözleşme Metinlerinin Dışında Kalan, Ama Gerekli Teknik/İdari Aksiyonlar

- [ ] **TÜRKPATENT'e "OtoHafıza" marka tescil başvurusu (öncelikli, yalnızca Zeki yapabilir — idari işlem)**
- [ ] Netlify ve Resend ile KVKK-uyumlu standart sözleşme/taahhütname imzalanması ve Kurul'a 5 iş günü içinde bildirilmesi (bkz. yukarıdaki nokta #3 — bir KVKK danışmanıyla birlikte yürütülmeli)
- [x] Sözleşme kabul kaydı: versiyon + SHA-256 hash + timestamp + IP altyapısının eklenmesi (20 Ağustos 2026 — bkz. `lib/contracts.ts`, `lib/blobStore.ts` `recordContractAcceptance`, `app/api/auth/signup/route.ts`)
- [x] Çerez onay banner'ı eklenmesi (20 Ağustos 2026 — bkz. `components/CookieConsentBanner.tsx`; `components/AdPixels.tsx` artık yalnızca "granted" onayında yükleniyor)
- [x] Kayıt/onay ekranında 4 ayrı checkbox'ın uygulanması: (1) SaaS Sözleşmesi+Kullanım Koşulları, (2) KVKK Aydınlatma Metni, (3) yurt dışı veri aktarımı açık rızası, (4) pazarlama izni (varsayılan kapalı) — 20 Ağustos 2026, bkz. `app/kayit/page.tsx` (Kullanıcı/Bayi) ve `app/partner-basvuru/page.tsx` (Saha Partneri — Saha Partner Sözleşmesi+Kullanım Şartları, KVKK, yurt dışı aktarım zorunlu; pazarlama isteğe bağlı). Sözleşme kabul kaydı (versiyon+hash+IP) her iki akışta da `recordContractAcceptance` ile ayrı ayrı tutulur (bkz. `lib/contracts.ts` `SHOP_CONTRACT_DOCUMENT_ORDER`/`PARTNER_CONTRACT_DOCUMENT_ORDER`).
- [x] Şirket kuruluşu tamamlanınca: MERSİS no, vergi dairesi/no, açık adres — tüm belgelerde yer tutucular dolduruldu (20 Ağustos 2026)
- [x] Canlı `/kvkk` ve `/mesafeli-satis-sozlesmesi` sayfalarının bu revize metinlerle güncellenmesi; `/kullanim-sartlari` genişletildi; çerez politikası (`/cerez-politikasi`) ve AUP (`/kabul-edilebilir-kullanim-politikasi`) için yeni sayfalar açıldı (20 Ağustos 2026)
