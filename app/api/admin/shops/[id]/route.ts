import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { deleteShop, getShopById } from "@/lib/blobStore";

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

  return NextResponse.json({ ok: true });
}
