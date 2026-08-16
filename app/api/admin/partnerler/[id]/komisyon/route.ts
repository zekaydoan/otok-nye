import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerById, getPartnerCommissionById, markPartnerCommissionPaid, recordAdminAuditLog } from "@/lib/blobStore";
import { PARTNER_COMMISSION_TYPE_LABELS } from "@/lib/types";

// Admin, bir komisyon kaydını banka transferiyle/elden gerçekten ödedikten
// sonra burada "ödendi" işaretler — bkz. app/admin/partnerler/[id],
// pazarlama/Saha_Partner_Agi_Analiz.docx (tahsilat/ödeme hâlâ elle yürütülen
// bir süreç, bu yalnızca "ne kadar ödendi" kaydını tutar).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const partner = await getPartnerById(params.id);
  if (!partner) return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });

  const { commissionId } = (await req.json()) as { commissionId?: string };
  if (!commissionId) return NextResponse.json({ error: "commissionId zorunlu." }, { status: 400 });

  const commission = await getPartnerCommissionById(commissionId);
  if (!commission || commission.partnerId !== params.id) {
    return NextResponse.json({ error: "Komisyon kaydı bulunamadı." }, { status: 404 });
  }
  if (commission.status === "odendi") {
    return NextResponse.json({ commission }); // zaten ödenmiş, sessizce no-op
  }

  const updated = await markPartnerCommissionPaid(commissionId);

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "partner_komisyon_odendi",
    targetType: "partner",
    targetId: partner.id,
    targetLabel: partner.name,
    detail: `${PARTNER_COMMISSION_TYPE_LABELS[commission.type]} — ${commission.amountTry} TL (${commission.shopName})`,
  });

  return NextResponse.json({ commission: updated });
}
