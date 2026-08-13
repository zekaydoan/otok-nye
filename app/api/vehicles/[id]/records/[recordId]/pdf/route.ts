import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getOilRecordById, getShopById, getVehicleById } from "@/lib/blobStore";
import { generateServiceReceiptPdf } from "@/lib/pdf";

// Servis fişi detaylı bakım bilgisi içerdiği için üyelere özeldir.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; recordId: string } }
) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const record = await getOilRecordById(vehicle.id, params.recordId);
  if (!record) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  const shop = (await getShopById(record.shopId)) ?? {
    id: record.shopId,
    name: record.shopName,
    email: "",
    passwordHash: "",
    phone: record.shopPhone || "",
    plan: "free" as const,
    createdAt: record.createdAt,
  };

  const verifyUrl = `${req.nextUrl.origin}/arac/${vehicle.id}`;
  const pdfBytes = await generateServiceReceiptPdf(shop, vehicle, record, verifyUrl);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${vehicle.plate}-${record.date}-servis-fisi.pdf"`,
    },
  });
}
