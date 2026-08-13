import { NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getPhoto } from "@/lib/blobStore";

// Bakım fotoğrafları detay bilgisi sayıldığı için üyelere özeldir.
export async function GET(
  _req: Request,
  { params }: { params: { recordId: string; type: string } }
) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const type = params.type === "after" ? "after" : "before";
  const photo = await getPhoto(params.recordId, type);
  if (!photo) return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });

  const buffer = Buffer.from(photo.base64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": photo.contentType,
      "X-Content-Type-Options": "nosniff", // tarayıcının içeriği farklı bir tür olarak yorumlamasını engeller
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
