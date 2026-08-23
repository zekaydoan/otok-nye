import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import { deleteShop, getShopById, recordAdminAuditLog } from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";

// Admin bir bayi hesabını kalıcı olarak siler — bkz. lib/blobStore.ts
// deleteShop'taki kapsam notu (araçlar, bakım kayıtları ve etiket siparişleri
// silinmez; yalnızca bayiye özel hesap verileri silinir, abonelik/plan hesap
// kaydıyla birlikte ortadan kalkar). Bu işlem geri alınamaz.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  // Admin kendi hesabını (ADMIN_EMAILS'teki e-postayla eşleşen Shop kaydını) bu
  // uç noktadan silerse kendi admin erişimini kaybeder — bunu baştan engelliyoruz.
  if (params.id === adminShopId) {
    return NextResponse.json(
      { error: "Kendi admin hesabınızı buradan silemezsiniz." },
      { status: 400 }
    );
  }

  const shop = await getShopById(params.id);
  if (!shop) return NextResponse.json({ error: "Bayi bulunamadı." }, { status: 404 });

  await deleteShop(params.id);

  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı, madde 1): sistemdeki en geri
  // alınamaz aksiyonun (bir bayinin tüm hesabını kalıcı silme) hiçbir izi
  // kalmıyordu — sipariş silme, partner durum değişikliği gibi çok daha az
  // kritik işlemler bile audit log'a yazılırken bu yazılmıyordu. Silme
  // işleminden SONRA loglanıyor çünkü deleteShop başarısız olursa (ör. eşzamanlı
  // bir hata) yanlış bir "silindi" kaydı düşmesin isteniyor.
  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "bayi_silindi",
    targetType: "shop",
    targetId: params.id,
    targetLabel: `${shop.name} (${shop.email})`,
    detail: `${PLAN_LIMITS[shop.plan].label} plandaki bayi hesabı kalıcı olarak silindi`,
  });

  return NextResponse.json({ ok: true });
}
