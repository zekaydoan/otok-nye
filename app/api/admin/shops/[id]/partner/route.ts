import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPartnerById, getShopById, recordAdminAuditLog, setShopPartner } from "@/lib/blobStore";

const MAX_REASON_LEN = 500;

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): admin panelinden bir bayinin
// partner atamasını DÜZELTMEK için tek uç nokta. `setShopPartner`
// (lib/blobStore.ts) daha önce yazılmış ama hiçbir UI'a bağlanmamış "ölü
// kod"du — otomatik ilk-temas mantığına (attributeShopToPartnerIfUnset,
// app/api/auth/signup) HİÇ dokunulmuyor, bu yalnızca admin'in nadir bir hatayı
// (ör. sahada yanlış referans kodu verilmesi) elle düzeltmesi için ikincil bir
// araç. Geçmiş komisyon kayıtları (PartnerCommissionEntry) oluşturuldukları
// andaki partnerId'yi taşıdığından bu işlemden ETKİLENMEZ — yalnızca
// BUNDAN SONRA tahakkuk edecek komisyonlar (accruePartnerRecurringCommission
// vb. her çağrıda shop.partnerId'yi güncel okur) yeni partnere gitmeye başlar.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { partnerId, reason } = body as { partnerId?: string | null; reason?: string };

  const trimmedReason = (reason || "").trim();
  if (!trimmedReason) {
    return NextResponse.json({ error: "Gerekçe zorunlu." }, { status: 400 });
  }
  if (trimmedReason.length > MAX_REASON_LEN) {
    return NextResponse.json({ error: "Gerekçe çok uzun." }, { status: 400 });
  }

  const shop = await getShopById(params.id);
  if (!shop) return NextResponse.json({ error: "Bayi bulunamadı." }, { status: 404 });

  const nextPartnerId = partnerId || null;
  if (nextPartnerId === (shop.partnerId || null)) {
    return NextResponse.json({ error: "Seçilen partner zaten mevcut atama." }, { status: 400 });
  }

  let newPartnerLabel = "Partnersiz";
  if (nextPartnerId) {
    const newPartner = await getPartnerById(nextPartnerId);
    if (!newPartner) return NextResponse.json({ error: "Seçilen partner bulunamadı." }, { status: 404 });
    newPartnerLabel = newPartner.name;
  }

  let oldPartnerLabel = "Partnersiz";
  if (shop.partnerId) {
    const oldPartner = await getPartnerById(shop.partnerId);
    oldPartnerLabel = oldPartner ? oldPartner.name : "(silinmiş partner)";
  }

  const updated = await setShopPartner(params.id, nextPartnerId);

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "partner_atandi",
    targetType: "shop",
    targetId: params.id,
    targetLabel: `${shop.name} (${shop.email})`,
    detail: `${oldPartnerLabel} → ${newPartnerLabel} · Gerekçe: ${trimmedReason}`,
  });

  return NextResponse.json({ shop: updated });
}
