import Script from "next/script";

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
export default function AdPixels() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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

// Kayıt tamamlandığında veya bir etiket siparişi ödendiğinde çağrılır — GA4 ve
// Meta Pixel yüklüyse ilgili dönüşüm olayını gönderir, yüklü değilse (ortam
// değişkenleri tanımsızsa) sessizce hiçbir şey yapmaz.
export function trackConversionEvent(
  event: "sign_up" | "purchase",
  params?: { value?: number; currency?: string }
) {
  if (typeof window === "undefined") return;

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };

  if (typeof w.gtag === "function") {
    w.gtag("event", event, params);
  }
  if (typeof w.fbq === "function") {
    if (event === "sign_up") {
      w.fbq("track", "CompleteRegistration");
    } else if (event === "purchase") {
      w.fbq("track", "Purchase", { value: params?.value, currency: params?.currency || "TRY" });
    }
  }
}
