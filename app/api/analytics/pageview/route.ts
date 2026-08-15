import { NextRequest, NextResponse } from "next/server";
import { incrementCityVisit, incrementDailyPageview } from "@/lib/blobStore";
import { normalizeProvinceName } from "@/lib/geo";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Netlify, her isteğe CDN seviyesinde eklediği x-nf-geo header'ında IP tabanlı
// (yaklaşık) coğrafi konum bilgisini base64 + JSON olarak taşır — ayrı bir
// ücretli servise veya IP'nin herhangi bir yerde saklanmasına gerek kalmadan
// "hangi ilden" bilgisini buradan çıkarabiliyoruz. Header yoksa (yerel
// geliştirme, header'ı desteklemeyen bir ortam vb.) sessizce null döner.
function getProvinceFromRequest(req: NextRequest): string | null {
  const raw = req.headers.get("x-nf-geo");
  if (!raw) return null;
  try {
    const geo = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as {
      subdivision?: { name?: string };
      city?: string;
    };
    return normalizeProvinceName(geo.subdivision?.name) ?? normalizeProvinceName(geo.city);
  } catch {
    return null;
  }
}

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

  const today = new Date().toISOString().slice(0, 10);
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
