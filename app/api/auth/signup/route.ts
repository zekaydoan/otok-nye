import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createShop, getShopByEmail } from "@/lib/blobStore";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { Shop } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 150;
const MAX_PHONE_LEN = 30;

export async function POST(req: NextRequest) {
  // Otomatik hesap oluşturma (spam/bot) girişimlerine karşı IP bazlı hız sınırı.
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("signup", ip, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla hesap oluşturma denemesi yapıldı. Lütfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, email, phone, password } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  }
  if (name.length > MAX_NAME_LEN || phone.length > MAX_PHONE_LEN) {
    return NextResponse.json({ error: "Girilen bilgiler çok uzun." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  const existing = await getShopByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta ile zaten bir hesap var." }, { status: 409 });
  }

  const shop: Shop = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash: await hashPassword(password),
    plan: "free",
    createdAt: new Date().toISOString(),
  };

  await createShop(shop);
  const token = await createSessionToken(shop.id);
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
