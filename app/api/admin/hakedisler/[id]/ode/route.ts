import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerById, markAllPendingCommissionsPaidForPartner, recordAdminAuditLog } from "@/lib/blobStore";

// Hakedişler ekranındaki (bkz. app/admin/hakedisler) "Tümünü Öde" butonu —
// bir partnerin O ANA KADAR tahakkuk etmiş TÜM bekleyen komisyonlarını tek
// istekte "ödendi" işaretler. Aynı app/api/admin/partnerler/[id]/komisyon
// deseni (elden/EFT ile ödeme fiilen yapıldıktan SONRA çağrılmalı — burada
// gerçek para transferi yapılmaz, yalnızca kayıt düşülür), ama partner
// sayısı arttıkça komisyon komisyon işaretlemek yerine tek partner için tek
// tıkla toplu işaretleme sağlar.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const partner = await getPartnerById(params.id);
  if (!partner) return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });

  const result = await markAllPendingCommissionsPaidForPartner(params.id);
  if (result.count === 0) {
    return NextResponse.json({ error: "Bekleyen komisyon yok." }, { status: 400 });
  }

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "partner_hakedis_toplu_odendi",
    targetType: "partner",
    targetId: partner.id,
    targetLabel: partner.name,
    detail: `${result.count} komisyon kaydı — toplam ${result.totalTry} TL ödendi olarak işaretlendi`,
  });

  return NextResponse.json(result);
}
