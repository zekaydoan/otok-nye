import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getAnnouncementById, getAnnouncementReadStats } from "@/lib/blobStore";

// Admin duyuru kartındaki "Kim okudu?" panelinin veri kaynağı — bir duyurunun
// hedef kitlesindeki toplam alıcı sayısını, kimlerin okuduğunu (ne zaman) ve
// kimlerin henüz okumadığını döner (bkz. lib/blobStore.getAnnouncementReadStats).
// Zeki'nin 22 Ağustos 2026 talebi: "bu duyuraları kimler okudu kimler okumadı
// görelim, ona göre aksiyon alalım" — okumayanlar burada isimleriyle listelenir,
// admin isterse ayrıca WhatsApp/telefonla dürtebilsin diye.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const announcement = await getAnnouncementById(params.id);
  if (!announcement) return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });

  const stats = await getAnnouncementReadStats(announcement);
  return NextResponse.json(stats);
}
