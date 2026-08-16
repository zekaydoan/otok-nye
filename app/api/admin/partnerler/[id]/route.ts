import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerById, recordAdminAuditLog, updatePartnerFields } from "@/lib/blobStore";
import { PARTNER_STATUS_LABELS, type PartnerStatus } from "@/lib/types";

// Admin, bir partnerin durumunu (aktif/pasif) değiştirebilsin diye — ör. 90
// gün boyunca yeni işletme getirmeyen ya da ilişkisi sona eren bir partneri
// pasif işaretlemek için (bkz. pazarlama/Saha_Partner_Agi_Analiz.docx Bölüm 2
// "bölge koruması süresiz değil"). Pasif bir partnerin referans koduyla yeni
// kayıt otomatik bağlanmaz (bkz. app/api/auth/signup status==="aktif" kontrolü).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const partner = await getPartnerById(params.id);
  if (!partner) return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });

  const body = await req.json();
  const { status, notes } = body as { status?: PartnerStatus; notes?: string };

  if (status !== undefined && !(status in PARTNER_STATUS_LABELS)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }
  if (notes !== undefined && notes.length > 1000) {
    return NextResponse.json({ error: "Not çok uzun." }, { status: 400 });
  }

  const updated = await updatePartnerFields(params.id, (p) => ({
    ...p,
    status: status ?? p.status,
    notes: notes !== undefined ? notes.trim() || undefined : p.notes,
  }));

  if (status && status !== partner.status) {
    const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
    await recordAdminAuditLog({
      actorEmail,
      action: "partner_durum_degisti",
      targetType: "partner",
      targetId: partner.id,
      targetLabel: partner.name,
      detail: `Durum: ${PARTNER_STATUS_LABELS[partner.status]} → ${PARTNER_STATUS_LABELS[status]}`,
    });
  }

  return NextResponse.json({ partner: updated });
}
