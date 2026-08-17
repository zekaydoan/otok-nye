import { NextRequest, NextResponse } from "next/server";
import { getPartnerByPhone } from "@/lib/blobStore";
import { verifyPassword } from "@/lib/auth";
import { createPartnerSessionToken, setPartnerSessionCookie } from "@/lib/partnerAuth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

// bkz. app/api/auth/login/route.ts DUMMY_HASH yorumu — aynı zamanlama
// side-channel önlemi burada da uygulanır: numara kayıtlı olsun/olmasın her
// istekte tam olarak bir kez bcrypt.compare çalışır.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Y6b0zM/9WlS5uHFAqhAOWvhWfAyfy";

export async function POST(req: NextRequest) {
  const { phone, password } = (await req.json()) as { phone?: string; password?: string };
  if (!phone || !password) {
    return NextResponse.json({ error: "Telefon ve şifre gerekli." }, { status: 400 });
  }

  const rateLimitKey = `${phone}|${getClientIp(req)}`;
  const rateLimit = await checkRateLimit("partner-login", rateLimitKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla başarısız deneme yapıldı. Lütfen ${Math.ceil(
          (rateLimit.retryAfterSeconds || 60) / 60
        )} dakika sonra tekrar deneyin.`,
      },
      { status: 429 }
    );
  }

  const partner = await getPartnerByPhone(phone);
  const passwordMatches = await verifyPassword(password, partner?.passwordHash ?? DUMMY_HASH);

  if (!partner || !passwordMatches) {
    return NextResponse.json({ error: "Telefon veya şifre hatalı." }, { status: 401 });
  }
  // "onay_bekliyor" ve "pasif" için ayrı mesajlar — biri henüz hiç
  // onaylanmamış yeni bir başvuru (bkz. app/partner-basvuru), diğeri daha
  // önce aktifken sonradan durdurulmuş bir hesap. İkisini aynı mesajla
  // karıştırmak, yeni başvuran birine "hesabınız pasif" deyip kafasını
  // karıştırırdı.
  if (partner.status === "onay_bekliyor") {
    return NextResponse.json(
      { error: "Başvurunuz henüz onaylanmadı. İnceleme tamamlanınca giriş yapabilirsiniz." },
      { status: 403 }
    );
  }
  if (partner.status !== "aktif") {
    return NextResponse.json(
      { error: "Hesabınız şu anda pasif durumda. OtoHafıza ile iletişime geçin." },
      { status: 403 }
    );
  }

  await resetRateLimit("partner-login", rateLimitKey);
  const token = await createPartnerSessionToken(partner.id);
  setPartnerSessionCookie(token);

  return NextResponse.json({ ok: true });
}
