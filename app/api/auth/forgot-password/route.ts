import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, getShopByEmail } from "@/lib/blobStore";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

// Güvenlik notu: bu uç nokta, e-postanın sistemde kayıtlı olup olmadığını
// sızdırmamak için her koşulda aynı genel "e-posta gönderildiyse..." mesajını
// döner (bkz. login route'undaki gibi doğrudan hata mesajı yerine).
export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
  }

  const rateLimitKey = `${email.toLowerCase()}|${getClientIp(req)}`;
  const rateLimit = await checkRateLimit("forgot-password", rateLimitKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla deneme yapıldı. Lütfen ${Math.ceil(
          (rateLimit.retryAfterSeconds || 60) / 60
        )} dakika sonra tekrar deneyin.`,
      },
      { status: 429 }
    );
  }

  const shop = await getShopByEmail(email);
  if (shop) {
    const token = await createPasswordResetToken(shop.id);
    const resetUrl = `${req.nextUrl.origin}/sifre-sifirla?token=${token}`;
    await sendPasswordResetEmail(shop.email, resetUrl);
  }

  // shop bulunamasa bile aynı cevap döner.
  return NextResponse.json({
    ok: true,
    message: "Bu e-posta sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
  });
}
