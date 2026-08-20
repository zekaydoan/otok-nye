import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { createAnnouncement, listShopsForAnnouncementAudience } from "@/lib/blobStore";
import { sendAnnouncementEmail, type BulkEmailSummary } from "@/lib/email";
import { ANNOUNCEMENT_AUDIENCE_LABELS, type Announcement, type AnnouncementAudience } from "@/lib/types";

const MAX_TITLE_LEN = 120;
const MAX_MESSAGE_LEN = 2000;

// Admin panelinden bayilere/ustalara indirim/kampanya/yeni özellik duyurusu
// yayınlamak için — doğrudan panel içinde (bkz. app/dashboard/duyurular)
// gösterilir, admin isterse (sendEmailToShops) AYNI duyurunun e-posta
// kopyasını da hedef kitledeki her bayiye gönderir (bkz.
// lib/email.sendAnnouncementEmail). Sadece ADMIN_EMAILS'teki hesap
// yayınlayabilir (bkz. app/admin/oneriler/[id]'deki aynı desen).
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { title, message, audience, sendEmailToShops } = body as {
    title?: string;
    message?: string;
    audience?: AnnouncementAudience;
    sendEmailToShops?: boolean;
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

  const wantsEmail = !!sendEmailToShops;
  const announcement: Announcement = {
    id: randomUUID(),
    title: trimmedTitle,
    message: trimmedMessage,
    audience,
    createdAt: new Date().toISOString(),
    ...(wantsEmail ? { emailedAt: new Date().toISOString() } : {}),
  };
  await createAnnouncement(announcement);

  // Duyuru panelde her koşulda görünür (yukarıda kaydedildi) — e-posta bunun
  // üzerine EK bir bildirim kanalı, kaydı engellememesi için announcement
  // yayınlandıktan SONRA, ayrı bir try/catch içinde denenir.
  let emailSummary: BulkEmailSummary | null = null;
  if (wantsEmail) {
    try {
      const shops = await listShopsForAnnouncementAudience(audience);
      const recipients = [...new Set(shops.map((s) => s.email).filter(Boolean))];
      emailSummary =
        recipients.length > 0
          ? await sendAnnouncementEmail(recipients, trimmedTitle, trimmedMessage)
          : { attempted: 0, sent: 0, failed: 0 };
    } catch (err) {
      console.error("[admin/duyurular] Toplu e-posta gönderimi başarısız:", err);
      emailSummary = { attempted: 0, sent: 0, failed: 0 };
    }
  }

  return NextResponse.json({ announcement, emailSummary });
}
