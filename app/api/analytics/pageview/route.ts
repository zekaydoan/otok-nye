import { NextRequest, NextResponse } from "next/server";
import { incrementCityVisit, incrementDailyPageview, turkeyDateISO } from "@/lib/blobStore";
import { getProvinceFromRequest } from "@/lib/geo";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Herkese açık, kimlik doğrulaması gerektirmeyen bir uç nokta — client tarafı
// bkz. components/PageviewTracker.tsx. Kişisel veri (IP, kullanıcı kimliği vb.)
// hiçbir yere yazılmaz; yalnızca günün toplam sayacı ve (varsa) il bazlı sayaç
// bir artırılır. IP, sadece bu uç noktanın kötüye kullanılmasını (sahte trafik
// şişirme) sınırlamak için hız sınırlayıcıda anlık olarak kullanılır, kalıcı
// olarak saklanmaz.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("analytics-pageview", ip, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return new NextResponse("rate_limited", { status: 429 });
  }

  // Türkiye takvim gününe göre — bkz. lib/blobStore.ts turkeyDateISO (Netlify
  // Functions UTC'de çalıştığı için önceki UTC bazlı hesap, günü TR gece
  // yarısında değil 03:00'te sıfırlıyordu).
  const today = turkeyDateISO();
  try {
    await incrementDailyPageview(today);
    const province = getProvinceFromRequest(req);
    if (province) await incrementCityVisit(today, province);
  } catch (err) {
    console.error("[analytics-pageview] Sayaç artırılamadı:", err);
  }

  // Sayfa yüklenmesini yavaşlatmasın diye tarayıcı bu isteğin cevabını beklemez
  // (bkz. sendBeacon/fetch keepalive kullanımı), ama yine de düzgün bir yanıt döneriz.
  return NextResponse.json({ ok: true });
}
