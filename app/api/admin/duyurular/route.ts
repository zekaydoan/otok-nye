import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { createAnnouncement } from "@/lib/blobStore";
import { ANNOUNCEMENT_AUDIENCE_LABELS, type Announcement, type AnnouncementAudience } from "@/lib/types";

const MAX_TITLE_LEN = 120;
const MAX_MESSAGE_LEN = 2000;

// Admin panelinden bayilere/ustalara indirim/kampanya/yeni özellik duyurusu
// yayınlamak için — e-posta değil, doğrudan panel içinde (bkz.
// app/dashboard/duyurular) gösterilir. Sadece ADMIN_EMAILS'teki hesap
// yayınlayabilir (bkz. app/admin/oneriler/[id]'deki aynı desen).
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { title, message, audience } = body as {
    title?: string;
    message?: string;
    audience?: AnnouncementAudience;
  };

  const trimmedTitle = (title || "").trim();
  const trimmedMessage = (message || "").trim();

  if (!trimmedTitle) {
    return NextResponse.json({ error: "Başlık zorunlu." }, { status: 400 });
  }
  if (trimmedTitle.length > MAX_TITLE_LEN) {
    return NextResponse.json(
      { error: `Başlık en fazla ${MAX_TITLE_LEN} karakter olabilir.` },
      { status: 400 }
    );
  }
  if (!trimmedMessage) {
    return NextResponse.json({ error: "Duyuru metni zorunlu." }, { status: 400 });
  }
  if (trimmedMessage.length > MAX_MESSAGE_LEN) {
    return NextResponse.json(
      { error: `Duyuru metni en fazla ${MAX_MESSAGE_LEN} karakter olabilir.` },
      { status: 400 }
    );
  }
  if (!audience || !(audience in ANNOUNCEMENT_AUDIENCE_LABELS)) {
    return NextResponse.json({ error: "Geçersiz hedef kitle." }, { status: 400 });
  }

  const announcement: Announcement = {
    id: randomUUID(),
    title: trimmedTitle,
    message: trimmedMessage,
    audience,
    createdAt: new Date().toISOString(),
  };
  await createAnnouncement(announcement);

  return NextResponse.json({ announcement });
}
