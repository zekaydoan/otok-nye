import { NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";

export async function GET() {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ shop: null });
  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ shop: null });
  const { passwordHash, ...safe } = shop;
  return NextResponse.json({ shop: safe });
}
