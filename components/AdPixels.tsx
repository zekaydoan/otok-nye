"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_COOKIE, COOKIE_CONSENT_EVENT } from "./CookieConsentBanner";

// Google Analytics 4 ve Meta (Facebook) Pixel entegrasyonu — lib/email.ts ve
// lib/whatsappReminder.ts'teki "dormant" desenin aynısı: ortam değişkeni
// tanımlanmadığı sürece hiçbir şey yüklenmez, siteye ekstra bir script veya
// ağ isteği eklenmez. Gerçek ölçüm kimlikleri elde edilince (Google Analytics/
// Ads ve Meta Business Manager hesapları — bkz. README) yalnızca iki ortam
// değişkeni (NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_META_PIXEL_ID)
// tanımlanarak devreye alınır, kod değişikliği gerekmez.
//
// Bu kimlikler NEXT_PUBLIC_ önekiyle bilinçli olarak istemci tarafına açılır —
// bu bir güvenlik açığı değildir: her sitenin GA/Meta Pixel kimliği zaten
// sayfa kaynağında herkese açık şekilde görünür, sır değildir.
//
// KVKK/Çerez Politikası uyumu (bkz. hukuki/07_Cerez_Politikasi.md Madde 4,
// components/CookieConsentBanner.tsx): bu iki ölçüm scripti artık ortam
// değişkeni tanımlı olsa BİLE, kullanıcı çerez banner'ında "Kabul Et" demeden
// yüklenmez. Karar verilmemişse (banner henüz gösteriliyorsa) da yüklenmez —
// varsayılan her zaman "yükleme", asla "yükle ve sonra sor" değildir.
function useCookieConsentGranted(): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    function readCookie() {
      const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_COOKIE}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) === "granted" : false;
    }
    setGranted(readCookie());

    function handleConsentChange(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      setGranted(detail === "granted");
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
  }, []);

  return granted;
}

export default function AdPixels() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const consentGranted = useCookieConsentGranted();

  if (!consentGranted) return null;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

// Kayıt tamamlandığında çağrılır — GA4 ve Meta Pixel yüklüyse ilgili dönüşüm
// olayını gönderir, yüklü değilse (ortam değişkenleri tanımsızsa) sessizce
// hiçbir şey yapmaz.
// NOT: Bu fonksiyon eskiden "purchase" olayını da destekliyordu; o dal
// kaldırıldı — etiket siparişi Purchase'ı artık tamamen ayrı, event_id
// destekli ve tekrar-gönderimi engelleyen trackPurchase() üzerinden
// yönetiliyor (bkz. aşağısı + components/PurchaseConversionPing.tsx). İki
// yoldan aynı anda Purchase gitmesin diye eski dal buradan silindi.
export function trackConversionEvent(event: "sign_up", params?: { value?: number; currency?: string }) {
  if (typeof window === "undefined") return;

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };

  if (typeof w.gtag === "function") {
    w.gtag("event", event, params);
  }
  if (typeof w.fbq === "function" && event === "sign_up") {
    w.fbq("track", "CompleteRegistration");
  }
}

// Etiket siparişi ödeme sayfasına (iyzico) yönlendirilmeden HEMEN önce — yalnızca
// backend checkout session'ı gerçekten başarıyla açtığında çağrılır (bkz.
// components/StickerOrderForm.tsx). value, backend'in /api/etiket-siparis
// yanıtından gelen totalPriceTry'dir; kullanıcı tarafından manipüle edilebilecek
// bir tutar burada asla kullanılmaz. event_id (`checkout_<orderId>`) ileride
// Conversions API eklenirse aynı sipariş için sunucu tarafından da kullanılabilir.
export function trackInitiateCheckout({ orderId, value }: { orderId: string; value: number }) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq !== "function") return;
  w.fbq("track", "InitiateCheckout", { value, currency: "TRY" }, { eventID: `checkout_${orderId}` });
}

// Etiket siparişi ödemesi SUNUCU TARAFINDA doğrulandıktan sonra — bu fonksiyon
// yalnızca app/api/etiket-siparis/[id]/purchase-tracked uç noktası
// "shouldTrack: true" dediğinde (yani bu sipariş için Purchase daha önce
// gönderilmemişse) çağrılmalıdır, bkz. components/PurchaseConversionPing.tsx.
// event_id (`purchase_<orderId>`) deterministik: ileride Conversions API aynı
// ID ile aynı sipariş için sunucu tarafından da event gönderirse Meta,
// browser+server eventlerini otomatik olarak tek dönüşüm sayar (event dedup).
// orderId, sistemin ürettiği rastgele bir kimliktir — plaka/isim/telefon gibi
// kişisel bir veri değildir.
export function trackPurchase({
  orderId,
  value,
  currency = "TRY",
}: {
  orderId: string;
  value: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq !== "function") return;
  w.fbq("track", "Purchase", { value, currency }, { eventID: `purchase_${orderId}` });
}

// Yeni kayıt olan bir bayinin PANELE İLK ARACINI başarıyla eklediği an için —
// reklam kalitesini ölçmek amacıyla ayrı bir özel (custom) Meta Pixel olayı.
// Meta'nın standart event setinde karşılığı olmadığından 'track' değil
// 'trackCustom' kullanılır. Yalnızca ilgili API, bunun o bayinin gerçekten
// ilk aracı olduğunu (isFirstVehicle: true) döndürdüğünde çağrılır — bkz.
// app/dashboard/araclar/yeni/page.tsx ve components/BindStickerForm.tsx.
// Plaka, marka, müşteri adı/telefonu gibi hiçbir kişisel/araç verisi olay
// parametresi olarak gönderilmez. GA4'e kasıtlı olarak eklenmedi (yalnızca
// Meta reklam ölçümü için istendi).
export function trackFirstVehicleAdded() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq === "function") {
    w.fbq("trackCustom", "FirstVehicleAdded");
  }
}
