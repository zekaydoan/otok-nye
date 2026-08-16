import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerById, recordAdminAuditLog, resetPartnerPassword } from "@/lib/blobStore";

// Partner şifresini unuttuğunda (SMS ile kendi kendine sıfırlama altyapısı
// henüz yok — bkz. app/api/admin/partnerler/route.ts giriş bilgisi kararı)
// admin burada yeni bir geçici şifre üretir ve partnere WhatsApp'tan iletir.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const partner = await getPartnerById(params.id);
  if (!partner) return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });

  const tempPassword = await resetPartnerPassword(params.id);

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "partner_sifre_sifirlandi",
    targetType: "partner",
    targetId: partner.id,
    targetLabel: partner.name,
    detail: "Şifre sıfırlandı",
  });

  return NextResponse.json({ tempPassword });
}
