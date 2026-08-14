"use client";

import { useEffect } from "react";
import { trackConversionEvent } from "@/components/AdPixels";

// Sunucu tarafında render edilen sipariş sonucu sayfasının (ödeme başarılı
// olduğunda) GA4/Meta Pixel'e "purchase" dönüşüm olayını bildirmesi için küçük
// bir istemci köprüsü — bkz. app/dashboard/etiket-siparis/sonuc/page.tsx.
export default function PurchaseConversionPing({
  orderId,
  value,
}: {
  orderId: string;
  value: number;
}) {
  useEffect(() => {
    trackConversionEvent("purchase", { value, currency: "TRY" });
    // orderId yalnızca aynı siparişte tekrar tetiklenmemesi (sayfa yeniden
    // render olsa da) için effect bağımlılığında tutuluyor, kullanılmıyor.
  }, [orderId, value]);

  return null;
}
