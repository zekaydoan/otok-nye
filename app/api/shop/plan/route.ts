import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { updateShopFields } from "@/lib/blobStore";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  // Plan/fatura değişikliği yalnızca hesap sahibine açık — çalışan hesapları
  // bu uç noktayı çağırırsa 403 alır (bkz. lib/auth.ts SessionInfo.role).
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }
  const shopId = session.shopId;

  const { plan } = (await req.json()) as { plan?: Plan };
  if (!plan || !(plan in PLAN_LIMITS)) {
    return NextResponse.json({ error: "Geçersiz plan." }, { status: 400 });
  }

  try {
    await updateShopFields(shopId, (shop) => {
      shop.plan = plan;
      return shop;
    });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
