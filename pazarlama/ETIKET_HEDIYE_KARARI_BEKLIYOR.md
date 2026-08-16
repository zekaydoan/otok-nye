# Etiket Hediye Kararı — Beklemede

Bu konu 16 Ağustos 2026'da askıya alındı ("Bu konu burada dursun, hafızaya al, tekrar geleceğiz"). Devam ederken buradan başlanmalı.

## Konu

"İlk üyelikte 100 QR etiket hediye" fikri — ilk kaydolan pilot dükkanlara ücretsiz etiket verme kararı.

## Bilinenler

- Mevcut mimari (`StickerToken`, `createStickerTokens`, `bindStickerToken`, `app/e/[token]`) zaten "aktivasyonlu boş etiket havuzu" mantığında çalışıyor — plakasız basılır, ilk okutmada araca bağlanır. Yeniden tasarıma gerek yok.
- **Eksik olan tek şey:** token'lar şu an sadece gerçek iyzico ödemesiyle oluşan bir `StickerOrder`'a bağlı üretiliyor. Ücretsiz/pilot etiket vermenin (kart çekmeden) sistemde bir yolu yok.
- Kaba maliyet araştırması: standart selefonlu etiket 1000 adet ~450₺ (~0,45₺/adet); "su geçirmez/UV korumalı/motor bölmesine dayanıklı" malzeme muhtemelen daha pahalı ama büyük ihtimalle yine de birkaç TL/adet — kesin rakam için gerçek matbaa teklifi alınmadı.
- 100 adet × 20 pilot dükkan = 2.000 adet, tahmini birkaç bin TL — pazar testi için makul görünüyor ama teyit edilmedi.

## Önerilen Yön (henüz onaylanmadı)

1. "100 etiket hediye" vaadini pazarlamada kullan (güçlü, yuvarlak, koşulsuz sayı — esnafa satarken etkili).
2. Fiziksel teslimatı kademelendir: ilk elden 20-30 adet ver, kalanını "kullandıkça gönderiyoruz" diye tut — gereksiz stok/kargo maliyetinden kaçınmak için.
3. Admin panelinde küçük bir "Ücretsiz Etiket Ver" aracı yazılmalı: bir shopId + adet girilir, `totalPriceTry: 0` bir `StickerOrder` + `createStickerTokens` çağrısıyla token üretilir, iyzico'ya hiç dokunmaz. Mevcut admin sipariş/kargo takibi ekranını olduğu gibi kullanır.

## Netleşmesi Gereken Kararlar

- [ ] Adet: 100 mü, daha küçük bir sayı mı?
- [ ] Gerçek üretim maliyeti — bir matbazadan teklif alınmalı (su geçirmez/UV/motor bölmesi dayanıklı malzeme için).
- [ ] Admin "Ücretsiz Etiket Ver" aracı yazılsın mı, ne zaman?
- [ ] Fiziksel teslimat kademelendirilsin mi, yoksa hepsi baştan mı gönderilsin?

## Bağlam

Bu, "İlk 20 Müşteri" 30 günlük satış sprintinin bir parçası olarak gündeme geldi (bkz. `pazarlama/Satis_Playbook_Ilk20.md`, `pazarlama/OtoHafiza_Teklif_ve_Fiyat_Ilk20.docx`). Sprint, bu karara bağlı değil — kod yazılmadan da sahaya çıkılabilir.
