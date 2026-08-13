import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { updateShopFields } from "@/lib/blobStore";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

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
