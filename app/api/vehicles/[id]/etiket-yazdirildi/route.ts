import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, getVehicleById, recordStickerSelfPrint } from "@/lib/blobStore";
import { checkRateLimit } from "@/lib/rateLimit";

// Bayi kendi yazıcısından QR etiket bastığında (bkz. components/StickerEditor
// "Yazdır / PDF Kaydet" butonu) bu uç nokta çağrılır — yalnızca bilgi amaçlı bir
// kayıt düşer (bkz. app/admin/bekleyen-isler), yazdırma işleminin kendisini
// engellemez/geciktirmez: istemci tarafında fire-and-forget çağrılır.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  // Aynı araç için art arda "Yazdır"a basılması (ör. yanlış kopya sayısıyla
  // deneme) admin listesini şişirmesin diye cömert bir üst sınır — bkz.
  // lib/rateLimit.ts'teki diğer kullanımlarla aynı desen.
  const rate = await checkRateLimit("sticker-self-print", `${shopId}|${params.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ ok: true }); // sessizce yut, kullanıcıya hata gösterme

  const [shop, vehicle] = await Promise.all([getShopById(shopId), getVehicleById(params.id)]);
  if (!shop || !vehicle) return NextResponse.json({ ok: true }); // bilgi amaçlı, sert hata vermeye gerek yok

  await recordStickerSelfPrint({
    shopId,
    shopName: shop.name,
    vehicleId: vehicle.id,
    plateDisplay: vehicle.plateDisplay,
  });

  return NextResponse.json({ ok: true });
}
