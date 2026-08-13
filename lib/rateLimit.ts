import { getStore } from "@netlify/blobs";
import { NextRequest } from "next/server";

// Basit, "best-effort" bir hız sınırlayıcı. Netlify Blobs atomik artırma
// desteklemediği için çok yoğun eşzamanlı isteklerde birkaç istek sınırı hafifçe
// aşabilir — bu, kaba kuvvet/istismar saldırılarını pratikte etkisiz kılmak için
// yeterlidir, ama finansal kesinlik gerektiren bir sayaç değildir. Ölçek büyüdükçe
// Upstash Redis gibi atomik bir çözüme geçilmesi önerilir.

const rateLimitStore = () => getStore("rate_limits");

interface RateLimitRecord {
  count: number;
  windowStart: number; // epoch ms
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  scope: string,
  identifier: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `${scope}:${identifier}`;
  const now = Date.now();
  const existing = (await rateLimitStore().get(key, { type: "json" })) as RateLimitRecord | null;

  if (!existing || now - existing.windowStart > windowMs) {
    await rateLimitStore().setJSON(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  await rateLimitStore().setJSON(key, { count: existing.count + 1, windowStart: existing.windowStart });
  return { allowed: true };
}

// Başarılı bir işlemden sonra (ör. doğru şifreyle giriş) sayaç sıfırlanabilir.
export async function resetRateLimit(scope: string, identifier: string): Promise<void> {
  await rateLimitStore().delete(`${scope}:${identifier}`);
}

// İstemci IP adresini olabildiğince güvenilir şekilde çıkarır (Netlify, x-nf-client-connection-ip
// başlığını proxy'den gerçek istemci IP'siyle doldurur; yoksa x-forwarded-for'a düşer).
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
