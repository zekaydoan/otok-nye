import { NextRequest, NextResponse } from "next/server";
import { getVehicleById, setVehicleWhatsappOptOut } from "@/lib/blobStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Kimlik doğrulaması GEREKTİRMEZ — genel araç sayfasını (app/arac/[id]) görebilen
// herkes (yani QR etiketi elinde olan/aracın gerçek sahibi) bu tercihi
// değiştirebilir. Bu, sayfanın kendisiyle aynı güvenlik modelidir: vehicleId
// (rastgele UUID) zaten fiziksel etiketi görmenin verdiği örtük bir yetki
// jetonu olarak kullanılıyor — bkz. app/arac/[id]/page.tsx. Kötüye kullanımın
// pratik zararı düşük (en kötü ihtimalle birinin hatırlatmaları kapanır/açılır),
// yine de kaba kuvvetle vehicleId denemesine karşı IP bazlı hız sınırı var.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("whatsapp-optout", ip, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen biraz sonra tekrar deneyin." }, { status: 429 });
  }

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const { optOut } = (await req.json()) as { optOut?: boolean };
  if (typeof optOut !== "boolean") {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const updated = await setVehicleWhatsappOptOut(params.id, optOut);
  return NextResponse.json({ ok: true, whatsappOptOut: updated.whatsappOptOut });
}
