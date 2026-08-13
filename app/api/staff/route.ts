import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentSession, hashPassword } from "@/lib/auth";
import {
  createStaffAccount,
  getShopByEmail,
  getShopById,
  getStaffByEmail,
  listStaffForShop,
} from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";
import type { StaffAccount } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 150;

// Ekip yönetimi (çalışan ekleme/listeleme) yalnızca "sahibi" rolüne açıktır —
// bir çalışan hesabı başka çalışan ekleyip kendine daha fazla erişim
// tanımlayamaz. Bkz. lib/auth.ts SessionInfo.role.
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const staff = await listStaffForShop(session.shopId);
  const safe = staff.map(({ passwordHash: _passwordHash, ...s }) => s);
  return NextResponse.json({ staff: safe });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const shop = await getShopById(session.shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { name, email, password } = body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "İsim, e-posta ve şifre gerekli." }, { status: 400 });
  }
  if (name.length > MAX_NAME_LEN) {
    return NextResponse.json({ error: "İsim çok uzun." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  const limit = PLAN_LIMITS[shop.plan].maxStaff;
  const current = await listStaffForShop(session.shopId);
  if (limit !== Infinity && current.length >= limit) {
    return NextResponse.json(
      {
        error: `${PLAN_LIMITS[shop.plan].label} plan limiti (${limit} çalışan) doldu. Daha fazla çalışan eklemek için planınızı yükseltin.`,
      },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [existingShop, existingStaff] = await Promise.all([
    getShopByEmail(normalizedEmail),
    getStaffByEmail(normalizedEmail),
  ]);
  if (existingShop || existingStaff) {
    return NextResponse.json({ error: "Bu e-posta ile zaten bir hesap var." }, { status: 409 });
  }

  const staffAccount: StaffAccount = {
    id: randomUUID(),
    shopId: session.shopId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  await createStaffAccount(staffAccount);

  const { passwordHash: _passwordHash, ...safe } = staffAccount;
  return NextResponse.json({ staff: safe });
}
