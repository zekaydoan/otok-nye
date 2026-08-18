import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPageviewsInRange } from "@/lib/blobStore";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Admin İstatistikler sayfasındaki haftalık/aylık ziyaret gezgini (bkz.
// components/PageviewsRangeExplorer.tsx) bu uç noktayı kullanıcının seçtiği
// başlangıç/bitiş tarihiyle çağırır ve o aralığın toplam + günlük sayfa
// görüntüleme dökümünü alır. Sunucu ilk yüklemede "bu hafta" için zaten bu
// veriyi hesaplayıp sayfaya gömer (bkz. app/admin/istatistikler/page.tsx) —
// bu uç nokta yalnızca kullanıcı farklı bir aralık seçtiğinde devreye girer.
export async function GET(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";
  if (!DATE_RE.test(start) || !DATE_RE.test(end)) {
    return NextResponse.json({ error: "Geçersiz tarih formatı." }, { status: 400 });
  }
  if (start > end) {
    return NextResponse.json({ error: "Başlangıç tarihi bitiş tarihinden sonra olamaz." }, { status: 400 });
  }

  const stats = await getPageviewsInRange(start, end);
  return NextResponse.json(stats);
}
