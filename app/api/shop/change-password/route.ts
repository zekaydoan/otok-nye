import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, updateShopFields } from "@/lib/blobStore";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Mevcut ve yeni şifre gerekli." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  // Zaten oturum açmış bir kullanıcı için de mevcut şifre kaba kuvvet denemesine
  // karşı hız sınırlanır.
  const rateLimit = await checkRateLimit("change-password", shopId, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme yapıldı, lütfen bir süre sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const shop = await getShopById(shopId);
  if (!shop || !(await verifyPassword(currentPassword, shop.passwordHash))) {
    return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  try {
    await updateShopFields(shopId, (s) => ({ ...s, passwordHash }));
  } catch {
    return NextResponse.json({ error: "Şifre güncellenemedi, lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
