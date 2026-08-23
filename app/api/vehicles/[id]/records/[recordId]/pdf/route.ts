import { NextRequest, NextResponse } from "next/server";
import { getOilRecordById, getShopById, getVehicleById } from "@/lib/blobStore";
import { generateServiceReceiptPdf } from "@/lib/pdf";

// V2 Paket 3: Servis fişi kişisel veri (araç sahibinin adı/telefonu/e-postası/
// adresi) İÇERMEZ — yalnızca araç bilgisi (plaka/marka/model) ve bakımı yapan
// işletmenin kendi iş bilgisini (ad, telefon) barındırır (bkz. lib/pdf.ts).
// QR ile açılan araç sayfası artık giriş yapmadan da bakım geçmişini
// gösterdiğinden ("Servis fişini PDF olarak görüntüle" bağlantısı — bkz.
// app/arac/[id]/page.tsx), bu uç de aynı şekilde herkese açıktır; eskiden
// burada bulunan zorunlu bayi girişi kaldırıldı.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; recordId: string } }
) {
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
