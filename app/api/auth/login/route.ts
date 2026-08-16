import { NextRequest, NextResponse } from "next/server";
import { getShopByEmail, getStaffByEmail, updateShopFields } from "@/lib/blobStore";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rateLimit";

// Aktivite takibi (bkz. lib/types.ts Shop.lastLoginAt) login'i asla bozmamalı —
// yazma başarısız olsa bile (ör. eşzamanlı ETag çakışması) hata sessizce yutulur.
async function markShopLoggedIn(shopId: string): Promise<void> {
  try {
    await updateShopFields(shopId, (shop) => ({ ...shop, lastLoginAt: new Date().toISOString() }));
  } catch {
    // sessizce yut — giriş zaten başarılı, bu yalnızca ikincil bir bilgi
  }
}

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

// Hesap bulunamadığında da gerçek bir bcrypt karşılaştırması çalıştırmak için
// kullanılan sahte (rastgele bir şifreden üretilmiş, hiçbir hesaba ait olmayan)
// bcrypt hash'i. Amaç: "e-posta hiç kayıtlı değil" durumuyla "e-posta kayıtlı
// ama şifre yanlış" durumunun yanıt süresini birbirine yaklaştırmak — aksi
// hâlde bcrypt.compare çağrılmayan ilk durum sistematik olarak daha hızlı
// döner ve bu fark, saldırganın hangi e-postaların sistemde kayıtlı olduğunu
// zamanlama farkından (timing side-channel) çıkarmasına izin verebilir.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Y6b0zM/9WlS5uHFAqhAOWvhWfAyfy";

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
  const [shop, staff] = await Promise.all([getShopByEmail(email), getStaffByEmail(email)]);

  // Hesabın var olup olmamasından bağımsız olarak her istekte tam olarak bir kez
  // bcrypt.compare çalıştırılır (var olan hesabın hash'i, ya da hiçbiri yoksa
  // sahte DUMMY_HASH). Böylece "e-posta kayıtlı değil", "e-posta kayıtlı ama
  // şifre yanlış" ve "e-posta+şifre doğru" durumları arasında bcrypt çağrı
  // sayısı hep aynı kalır — sadece sonuca göre dallanılır, zamanlama farkı
  // (timing side-channel) ile hesap varlığı tahmin edilemez.
  const passwordMatches = await verifyPassword(
    password,
    shop?.passwordHash ?? staff?.passwordHash ?? DUMMY_HASH
  );

  if (shop && passwordMatches) {
    await resetRateLimit("login", rateLimitKey);
    const token = await createSessionToken({ shopId: shop.id, role: "sahibi" });
    setSessionCookie(token);
    await markShopLoggedIn(shop.id);
    return NextResponse.json({ ok: true });
  }

  if (staff && passwordMatches) {
    await resetRateLimit("login", rateLimitKey);
    const token = await createSessionToken({
      shopId: staff.shopId,
      role: "calisan",
      staffId: staff.id,
    });
    setSessionCookie(token);
    await markShopLoggedIn(staff.shopId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
}
