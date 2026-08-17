import { NextRequest, NextResponse } from "next/server";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import { getPartnerById, updatePartnerFields } from "@/lib/blobStore";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
// Partner şifreleri saha koşullarında numerik klavyeyle kolay yazılsın diye
// bilinçli olarak 6 haneli rakam olarak tutuluyor — bkz. app/partner-basvuru
// (kendi şifresini belirlerken) ve app/partner-girisi (giriş formu) aynı kural.
const PASSWORD_REGEX = /^\d{6}$/;

// Bayi tarafındaki app/api/shop/change-password ile birebir aynı desen —
// oturum açmış partnerin KENDİ şifresini, admin'e yazmasına gerek kalmadan
// değiştirmesi için (bkz. components/PartnerChangePasswordForm.tsx,
// app/partner/sifre). Admin'in elle sıfırlama akışı (bkz.
// app/api/admin/partnerler/[id]/sifre-sifirla) hâlâ ayrıca duruyor —
// partnerin telefonuna erişimi yoksa/hesabına giremiyorsa yedek yol.
export async function POST(req: NextRequest) {
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Mevcut ve yeni şifre gerekli." }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return NextResponse.json({ error: "Yeni şifre tam olarak 6 haneli rakam olmalı." }, { status: 400 });
  }

  // Zaten oturum açmış bir partner için de mevcut şifre kaba kuvvet
  // denemesine karşı hız sınırlanır — bkz. change-password route'undaki aynı desen.
  const rateLimit = await checkRateLimit("partner-change-password", partnerId, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme yapıldı, lütfen bir süre sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const partner = await getPartnerById(partnerId);
  if (!partner || !(await verifyPassword(currentPassword, partner.passwordHash))) {
    return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  try {
    await updatePartnerFields(partnerId, (p) => ({ ...p, passwordHash }));
  } catch {
    return NextResponse.json({ error: "Şifre güncellenemedi, lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
