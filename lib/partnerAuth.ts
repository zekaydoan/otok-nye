import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSecretBytes } from "./auth";

// Saha Partneri oturumu — bilinçli olarak Shop/StaffAccount oturumundan
// (lib/auth.ts) TAMAMEN AYRI bir çerez ve JWT kullanır. Partner bir Shop
// DEĞİLDİR (ayrı bir varlık, ayrı yetkiler, ayrı bir panel görür) — aynı
// çerezi paylaşmak "hangi rol giriş yaptı" karmaşasına ve yanlışlıkla
// bayi verisine erişime yol açabilirdi. İmzalama anahtarı ise (getSecretBytes)
// ortak — iki ayrı AUTH_SECRET yönetmeye gerek yok.

const PARTNER_COOKIE_NAME = "op_session";

export async function createPartnerSessionToken(partnerId: string): Promise<string> {
  return new SignJWT({ partnerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretBytes());
}

export async function verifyPartnerSessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretBytes());
    return typeof payload.partnerId === "string" ? payload.partnerId : null;
  } catch {
    return null;
  }
}

export function setPartnerSessionCookie(token: string) {
  cookies().set(PARTNER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearPartnerSessionCookie() {
  cookies().delete(PARTNER_COOKIE_NAME);
}

export async function getCurrentPartnerId(): Promise<string | null> {
  const token = cookies().get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyPartnerSessionToken(token);
}
