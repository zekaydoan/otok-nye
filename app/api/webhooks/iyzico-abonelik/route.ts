import { NextRequest, NextResponse } from "next/server";
import {
  accruePartnerRecurringCommission,
  checkAndAccruePartnerConversionBonus,
  getShopById,
  getSubscriptionShopLink,
  updateShopFields,
} from "@/lib/blobStore";
import { verifySubscriptionWebhookSignature, type SubscriptionWebhookPayload } from "@/lib/iyzicoSubscription";
import { notifyAdmins, escapeHtml } from "@/lib/email";

// iyzico Abonelik tekrarlayan ödeme bildirimleri — HAZIRLIK AŞAMASI. Şu an
// hiçbir abonelik gerçek olarak başlatılmadığından (bkz.
// SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md madde 1) bu uç noktaya canlıda
// bildirim gelmiyor; iyzico Merchant Panel'de "Ayarlar > Firma Ayarları >
// İşyeri Bildirimleri" altındaki abonelik bildirim URL'si buraya
// (https://otohafiza.com/api/webhooks/iyzico-abonelik) tanımlandığında ve
// /api/shop/plan gerçek abonelik başlatacak şekilde güncellendiğinde devreye
// girer. Doğrulanmamış — bkz. lib/iyzicoSubscription.ts dosya başındaki not.
//
// iyzico, "2xx" dönene kadar 15 dakikada bir, 3 kez tekrar dener — bu yüzden
// işlenemeyen ama geçerli imzalı bir bildiride bile 200 dönmek yerine hatayı
// loglayıp yine 200 dönmek (idempotent yeniden deneme için) tercih edilir;
// yalnızca imza doğrulaması başarısız olursa 401 dönülür.
export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as SubscriptionWebhookPayload | null;
  if (!payload || !payload.subscriptionReferenceCode || !payload.iyziEventType) {
    return NextResponse.json({ error: "Geçersiz bildirim gövdesi." }, { status: 400 });
  }

  const signature = req.headers.get("x-iyz-signature-v3");
  let signatureValid = false;
  try {
    signatureValid = verifySubscriptionWebhookSignature(payload, signature);
  } catch (err) {
    // IYZICO_MERCHANT_ID/IYZICO_SECRET_KEY tanımlı değilse (hazırlık aşamasında
    // olağan) doğrulama hesaplanamaz — güvenlik gereği isteği reddet, sessizce
    // kabul etme.
    console.error("[iyzico-abonelik-webhook] İmza doğrulanamadı:", err);
    return NextResponse.json({ error: "Doğrulama yapılandırılmamış." }, { status: 500 });
  }
  if (!signatureValid) {
    return NextResponse.json({ error: "Geçersiz imza." }, { status: 401 });
  }

  const link = await getSubscriptionShopLink(payload.subscriptionReferenceCode);
  if (!link) {
    // Bilinmeyen bir abonelik referansı — eşleşme kaydı bizde yoksa (ör. henüz
    // /api/shop/plan bu akışa bağlanmadan test amaçlı gönderilmiş bir bildirim)
    // işlenecek bir şey yok; yine de 200 dönülür ki iyzico tekrar denemesin.
    console.warn(
      `[iyzico-abonelik-webhook] Bilinmeyen subscriptionReferenceCode: ${payload.subscriptionReferenceCode}`
    );
    return NextResponse.json({ ok: true });
  }

  try {
    if (payload.iyziEventType === "subscription.order.success") {
      // Saha Partner Ağı: dönüşüm bonusu ve tekrarlayan komisyon, planın
      // DEĞİŞMEDEN önceki hâline göre karar verilmeli — bu yüzden
      // updateShopFields'tan önce mevcut plan okunur.
      const shopBefore = await getShopById(link.shopId);
      const previousPlan = shopBefore?.plan;

      await updateShopFields(link.shopId, (shop) => ({
        ...shop,
        plan: link.plan,
        iyzicoSubscriptionReferenceCode: payload.subscriptionReferenceCode,
        planRenewsAt: new Date().toISOString(),
      }));

      if (previousPlan) {
        // Bilinçli olarak ana akışı bloklamaz/hataya düşürmez — plan zaten
        // güncellendi, bir komisyon hesaplama hatası bu ödemeyi geri almamalı.
        checkAndAccruePartnerConversionBonus(link.shopId, previousPlan).catch((err) =>
          console.error("[iyzico-abonelik-webhook] Partner dönüşüm bonusu kontrolü başarısız:", err)
        );
      }
      const periodMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      accruePartnerRecurringCommission(link.shopId, periodMonth).catch((err) =>
        console.error("[iyzico-abonelik-webhook] Partner recurring komisyon kontrolü başarısız:", err)
      );
    } else if (payload.iyziEventType === "subscription.order.failure") {
      // Otomatik düşürme YAPILMAZ — iyzico'nun kendi retry servisi/panel
      // üzerinden tekrar deneme imkanı var, admin'e haber verip elle
      // müdahaleye bırakılır (bkz. docs.iyzico.com abonelik entegrasyonu notu).
      await notifyAdmins(
        `Abonelik ödemesi başarısız — ${link.shopId}`,
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <p>Bayi (shopId: <strong>${escapeHtml(link.shopId)}</strong>) için tekrarlayan abonelik
          ödemesi başarısız oldu (subscriptionReferenceCode:
          ${escapeHtml(payload.subscriptionReferenceCode)}). iyzico panelinden veya retry
          servisiyle tekrar deneyin ya da bayiyle iletişime geçin.</p>
        </div>`
      );
    }
  } catch (err) {
    console.error("[iyzico-abonelik-webhook] İşlenemedi:", err);
    // 500 dönülmez — iyzico aynı bildirimi tekrar tekrar dener, geçici bir
    // blobStore hatasında bu istenen bir davranış; kalıcı hatalar loglardan izlenir.
  }

  return NextResponse.json({ ok: true });
}
