import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createShop, getShopByEmail, getStaffByEmail, recordPlanStart } from "@/lib/blobStore";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { TR_PROVINCES, type Shop } from "@/lib/types";

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
  const { name, email, phone, password, city } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    city?: string;
  };

  if (!name || !email || !phone || !password || !city) {
    return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  }
  // Serbest metin yerine sabit il listesiyle eşleşmeli — bkz. lib/types.ts
  // TR_PROVINCES yorumu (şehir bazlı raporlarda yazım farkı sorunu olmasın diye).
  if (!(TR_PROVINCES as readonly string[]).includes(city)) {
    return NextResponse.json({ error: "Geçerli bir şehir seçin." }, { status: 400 });
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

  // E-posta hem Shop (hesap sahibi) hem StaffAccount (çalışan) tablosunda
  // benzersiz olmalı — aksi hâlde giriş sırasında hangi hesaba ait olduğu
  // belirsizleşir (bkz. app/api/auth/login).
  const [existingShop, existingStaff] = await Promise.all([
    getShopByEmail(email),
    getStaffByEmail(email),
  ]);
  if (existingShop || existingStaff) {
    return NextResponse.json({ error: "Bu e-posta ile zaten bir hesap var." }, { status: 409 });
  }

  const shop: Shop = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash: await hashPassword(password),
    plan: "free",
    city,
    createdAt: new Date().toISOString(),
  };

  await createShop(shop);
  await recordPlanStart(shop.id, shop.plan);
  const token = await createSessionToken({ shopId: shop.id, role: "sahibi" });
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
