import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat } from "@/lib/blobStore";
import { getProvinceFromRequest } from "@/lib/geo";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const SESSION_ID_RE = /^[a-zA-Z0-9-]{10,64}$/;

// Herkese açık, kimlik doğrulaması gerektirmeyen bir uç nokta — client tarafı
// bkz. components/ActiveVisitorTracker.tsx. sessionId, tarayıcıda rastgele
// üretilen ve yalnızca o sekme oturumu boyunca yaşayan geçici bir değerdir;
// kişi/IP ile eşleştirilmez, kalıcı bir kimlik değildir. Amaç "şu an sitede
// kaç aktif sekme var" sayısını ve (varsa) hangi illerden olduğunu admin
// panelinde gösterebilmektir (bkz. lib/blobStore.ts getActiveVisitorStats).
// İl bilgisi Netlify'ın x-nf-geo header'ından (bkz. lib/geo.ts) çıkarılır —
// IP'nin kendisi hiçbir yere yazılmaz, yalnızca kaba il adı; kayıt en fazla
// 5 dakika (HEARTBEAT_STALE_MS) sonra otomatik silinir.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Sekme başına ~30 saniyede bir çağrılır; birden fazla sekme/yenilemeyi de
  // hesaba katan gevşek bir üst sınır.
  const rateLimit = await checkRateLimit("analytics-heartbeat", ip, 40, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    return new NextResponse("rate_limited", { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { sessionId } = body as { sessionId?: string };
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: "Geçersiz oturum kimliği." }, { status: 400 });
  }

  try {
    const province = getProvinceFromRequest(req);
    await recordHeartbeat(sessionId, province);
  } catch (err) {
    console.error("[analytics-heartbeat] Kaydedilemedi:", err);
  }

  return NextResponse.json({ ok: true });
}
