"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/components/AdPixels";

// Sunucu tarafında render edilen sipariş sonucu sayfası (ödeme başarılı
// olduğunda) tarafından render edilir — bkz. app/etiket-siparis/sonuc/page.tsx.
//
// ESKİ davranıştan (doğrudan fbq çağrısı) FARKLI olarak burada hiçbir zaman
// doğrudan Meta'ya event gönderilmez. Önce sunucudaki idempotent
// /api/etiket-siparis/[id]/purchase-tracked uç noktasına sorulur: "bu sipariş
// için Purchase daha önce gönderildi mi?" Yalnızca sunucu "hayır, sen gönder"
// derse (shouldTrack: true) tarayıcıda Purchase eventi ateşlenir — bu sayede
// F5/geri-ileri/aynı bağlantıyı tekrar açma veya aynı sayfayı iki sekmede
// açma durumlarında aynı sipariş için event tekrar gönderilmez (kalıcı işaret
// StickerOrder.metaPurchaseTrackedAt'te, sunucuda tutulur).
export default function PurchaseConversionPing({ orderId }: { orderId: string }) {
  const attempted = useRef(false);

  useEffect(() => {
    // React StrictMode (dev) efekti iki kez çalıştırabilir — aynı mount
    // içinde ikinci denemeyi burada engelliyoruz. Asıl (sayfa yenileme,
    // farklı sekme vb.) koruma sunucu tarafında.
    if (attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/etiket-siparis/${orderId}/purchase-tracked`, {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.shouldTrack && typeof data.value === "number") {
          trackPurchase({ orderId, value: data.value, currency: "TRY" });
        }
      } catch {
        // Ağ hatası — sessizce yok say. Sipariş üzerindeki işaret bu durumda
        // hâlâ boş kalacağından (istek sunucuya hiç ulaşmadıysa) kullanıcı
        // sayfayı tekrar açtığında (F5) yeniden denenir.
      }
    })();
  }, [orderId]);

  return null;
}
