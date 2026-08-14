import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentSession } from "@/lib/auth";
import { createSuggestion, getShopById, getStaffById, listSuggestionsForShop } from "@/lib/blobStore";
import { notifyAdmins } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import type { Suggestion } from "@/lib/types";

const MIN_LEN = 10;
const MAX_LEN = 2000;
const MAX_SUGGESTIONS_PER_WINDOW = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 saat

// Bayilerin ve ekip üyelerinin panelden doğrudan gönderdiği özellik önerisi /
// geri bildirim kutusu. Hem "sahibi" hem "calisan" rolü gönderebilir — sürece
// katkı sunmak yönetici hesabıyla sınırlı değil (bkz. app/dashboard/oneriler).
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  // Kimlik doğrulanmış bir uç nokta olsa da, aynı dükkanın kısa sürede çok
  // sayıda öneri göndermesini engellemek için basit bir hız sınırı uygulanır.
  const rateLimit = await checkRateLimit(
    "oneri",
    session.shopId,
    MAX_SUGGESTIONS_PER_WINDOW,
    WINDOW_MS
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok sık öneri gönderdiniz. Lütfen ${Math.ceil(
          (rateLimit.retryAfterSeconds || 60) / 60
        )} dakika sonra tekrar deneyin.`,
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { message } = body as { message?: string };
  const trimmed = (message || "").trim();

  if (trimmed.length < MIN_LEN) {
    return NextResponse.json(
      { error: `Öneriniz en az ${MIN_LEN} karakter olmalı.` },
      { status: 400 }
    );
  }
  if (trimmed.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Öneriniz en fazla ${MAX_LEN} karakter olabilir.` },
      { status: 400 }
    );
  }

  const shop = await getShopById(session.shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const authorName =
    session.role === "calisan" && session.staffId
      ? (await getStaffById(session.shopId, session.staffId))?.name
      : undefined;

  const suggestion: Suggestion = {
    id: randomUUID(),
    shopId: session.shopId,
    shopName: shop.name,
    authorName,
    message: trimmed,
    status: "yeni",
    createdAt: new Date().toISOString(),
  };
  await createSuggestion(suggestion);

  await notifyAdmins(
    `Yeni öneri — ${shop.name}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p><strong>${shop.name}</strong>${authorName ? ` (${authorName})` : ""} bir öneri gönderdi:</p>
      <p style="white-space:pre-wrap;">${trimmed}</p>
      <p><a href="https://yagbakim-defteri.netlify.app/admin/oneriler">Admin panelinden görüntüle</a></p>
    </div>`
  );

  return NextResponse.json({ suggestion });
}

// Panelde "Daha önce gönderdikleriniz" listesi için — bayinin kendi geçmişini
// görebilmesi amacıyla, rolden bağımsız olarak shopId'ye göre döner.
export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const suggestions = await listSuggestionsForShop(session.shopId);
  return NextResponse.json({ suggestions });
}
