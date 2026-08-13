import { NextRequest, NextResponse } from "next/server";
import { getShopByEmail, getStaffByEmail } from "@/lib/blobStore";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }

  // Kaba kuvvet (brute-force) denemelerine karşı: e-posta + IP bazlı hız sınırı.
  const rateLimitKey = `${email.toLowerCase()}|${getClientIp(req)}`;
  const rateLimit = await checkRateLimit("login", rateLimitKey, MAX_ATTEMPTS, WINDOW_MS);
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

  // Önce hesap sahibi (Shop) tablosuna bakılır; bulunamazsa e-posta bir çalışan
  // hesabına ait olabilir (bkz. lib/types.ts StaffAccount) — iki tablo da aynı
  // e-posta alanı için global olarak benzersiz tutulur (bkz. signup ve
  // app/api/staff POST), bu yüzden en fazla biri eşleşir.
  const shop = await getShopByEmail(email);
  if (shop && (await verifyPassword(password, shop.passwordHash))) {
    await resetRateLimit("login", rateLimitKey);
    const token = await createSessionToken({ shopId: shop.id, role: "sahibi" });
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  }

  const staff = await getStaffByEmail(email);
  if (staff && (await verifyPassword(password, staff.passwordHash))) {
    await resetRateLimit("login", rateLimitKey);
    const token = await createSessionToken({
      shopId: staff.shopId,
      role: "calisan",
      staffId: staff.id,
    });
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
}
