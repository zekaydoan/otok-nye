import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { updateShopFields } from "@/lib/blobStore";

const MAX_FAVORITES = 12;

export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { brand, model } = (await req.json()) as { brand?: string; model?: string };
  if (!brand || !model) {
    return NextResponse.json({ error: "Marka ve model zorunludur." }, { status: 400 });
  }
  if (brand.length > 80 || model.length > 80) {
    return NextResponse.json({ error: "Marka/model çok uzun." }, { status: 400 });
  }

  try {
    // updateShopFields, ETag tabanlı koşullu yazımla iyimser kilitleme uygular —
    // iki sekmeden aynı anda favori eklenirse biri diğerini sessizce ezmez.
    const updated = await updateShopFields(shopId, (shop) => {
      const favorites = shop.favoriteOils || [];
      const exists = favorites.some(
        (f) => f.brand.toLowerCase() === brand.toLowerCase() && f.model.toLowerCase() === model.toLowerCase()
      );
      if (!exists) {
        favorites.unshift({ brand, model });
        shop.favoriteOils = favorites.slice(0, MAX_FAVORITES);
      }
      return shop;
    });
    return NextResponse.json({ favoriteOils: updated.favoriteOils || [] });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { brand, model } = (await req.json()) as { brand?: string; model?: string };

  try {
    const updated = await updateShopFields(shopId, (shop) => {
      shop.favoriteOils = (shop.favoriteOils || []).filter(
        (f) => !(f.brand === brand && f.model === model)
      );
      return shop;
    });
    return NextResponse.json({ favoriteOils: updated.favoriteOils || [] });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }
}
