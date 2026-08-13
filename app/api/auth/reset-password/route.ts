import { NextRequest, NextResponse } from "next/server";
import { consumePasswordResetToken, updateShopFields } from "@/lib/blobStore";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token, password } = (await req.json()) as { token?: string; password?: string };
  if (!token || !password) {
    return NextResponse.json({ error: "Token ve yeni şifre gerekli." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  const shopId = await consumePasswordResetToken(token);
  if (!shopId) {
    return NextResponse.json(
      { error: "Bağlantının süresi dolmuş veya geçersiz. Lütfen yeni bir sıfırlama isteği oluşturun." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  try {
    await updateShopFields(shopId, (shop) => ({ ...shop, passwordHash }));
  } catch {
    return NextResponse.json({ error: "Şifre güncellenemedi, lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
