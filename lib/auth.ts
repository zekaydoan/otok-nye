import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const DEV_FALLBACK_SECRET = "oto-kunye-gelistirme-anahtari-2026";

// AUTH_SECRET, oturum jetonlarını (JWT) imzalamak için kullanılır — kodun kendisi
// herkese açık olabileceğinden (ör. bu depo), üretimde bilinen/varsayılan bir anahtarla
// çalışmak, herhangi birinin geçerli bir oturum jetonu sahtelemesine izin verir. Bu
// yüzden üretim ortamında (NODE_ENV=production) AUTH_SECRET tanımlı değilse uygulama
// isteği reddeder; yalnızca yerel geliştirmede sessizce yedek anahtara düşer.
function getSecretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET ortam değişkeni tanımlı değil. Üretimde oturum güvenliği için " +
          "Netlify ortam değişkenlerine güçlü, rastgele bir AUTH_SECRET eklemeniz zorunludur."
      );
    }
    console.warn(
      "[auth] AUTH_SECRET tanımlı değil, yalnızca geliştirme için yedek anahtar kullanılıyor. " +
        "Üretime almadan önce mutlaka gerçek bir AUTH_SECRET tanımlayın."
    );
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = "ok_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(shopId: string): Promise<string> {
  return new SignJWT({ shopId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretBytes());
}

export async function verifySessionToken(token: string): Promise<{ shopId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretBytes());
    if (typeof payload.shopId === "string") return { shopId: payload.shopId };
    return null;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // CSRF'ye karşı ek koruma — çerez hiçbir siteler arası istekte gönderilmez
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentShopId(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.shopId ?? null;
}
