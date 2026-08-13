import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { updateShopFields } from "@/lib/blobStore";

// Not: E-posta değişikliği bu uç noktanın kapsamında değil — e-posta, giriş
// kimliği olarak `shops_by_email` indeksinde de tutuluyor ve değiştirilmesi
// ayrı bir eşsizlik kontrolü + indeks güncellemesi gerektiriyor. Şimdilik
// yalnızca isim ve telefon güncellenebiliyor; e-posta değişikliği talepleri
// destek üzerinden elle yapılabilir.
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }
  // Firma bilgisi değişikliği yalnızca hesap sahibine açık (bkz. lib/auth.ts
  // SessionInfo.role) — Ayarlar sayfası çalışan girişinde bu formu zaten
  // göstermiyor, burası API seviyesinde ikinci bir güvenlik katmanı.
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }
  const shopId = session.shopId;

  const { name, phone } = (await req.json()) as { name?: string; phone?: string };
  if (!name || !phone) {
    return NextResponse.json({ error: "Firma adı ve telefon gerekli." }, { status: 400 });
  }

  try {
    const updated = await updateShopFields(shopId, (shop) => ({ ...shop, name, phone }));
    return NextResponse.json({ ok: true, name: updated.name, phone: updated.phone });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi, lütfen tekrar deneyin." }, { status: 500 });
  }
}
