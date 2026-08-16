import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  createPartner,
  generatePartnerReferralCode,
  generatePartnerTempPassword,
  getPartnerByPhone,
  recordAdminAuditLog,
} from "@/lib/blobStore";
import { PARTNER_CATEGORY_LABELS, type Partner, type PartnerCategory } from "@/lib/types";

const MAX_NAME_LEN = 150;
const MAX_PHONE_LEN = 30;
const MAX_REGION_LEN = 200;
const MAX_NOTES_LEN = 1000;

// Admin panelinden yeni bir Saha Partneri eklemek için — bkz. app/admin/partnerler,
// pazarlama/Saha_Partner_Agi_Analiz.docx. Referans kodu (?ref=KOD, bkz.
// app/kayit/page.tsx) partner adından otomatik üretilir, admin elle girmez.
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { name, phone, email, category, region, notes } = body as {
    name?: string;
    phone?: string;
    email?: string;
    category?: PartnerCategory;
    region?: string;
    notes?: string;
  };

  const trimmedName = (name || "").trim();
  const trimmedPhone = (phone || "").trim();
  if (!trimmedName) return NextResponse.json({ error: "Ad Soyad zorunlu." }, { status: 400 });
  if (!trimmedPhone) return NextResponse.json({ error: "Telefon zorunlu." }, { status: 400 });
  if (trimmedName.length > MAX_NAME_LEN || trimmedPhone.length > MAX_PHONE_LEN) {
    return NextResponse.json({ error: "Girilen bilgiler çok uzun." }, { status: 400 });
  }
  if (category && !(category in PARTNER_CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Geçersiz kategori." }, { status: 400 });
  }
  if (region && region.length > MAX_REGION_LEN) {
    return NextResponse.json({ error: "Bölge alanı çok uzun." }, { status: 400 });
  }
  if (notes && notes.length > MAX_NOTES_LEN) {
    return NextResponse.json({ error: "Not çok uzun." }, { status: 400 });
  }
  // Aynı telefonla ikinci bir partner oluşturulursa telefon->id indeksi
  // sessizce üzerine yazılır ve giriş karışır — baştan engellenir.
  const existingByPhone = await getPartnerByPhone(trimmedPhone);
  if (existingByPhone) {
    return NextResponse.json({ error: "Bu telefon numarasıyla zaten bir partner var." }, { status: 409 });
  }

  const referralCode = await generatePartnerReferralCode(trimmedName);
  // Partner kendi paneline (bkz. app/partner-girisi) bu geçici şifreyle giriş
  // yapar — düz metin yalnızca bu API yanıtında BİR KEZ döner, admin WhatsApp'tan
  // iletir; sistemde yalnızca hash'i saklanır.
  const tempPassword = generatePartnerTempPassword();
  const partner: Partner = {
    id: randomUUID(),
    name: trimmedName,
    phone: trimmedPhone,
    email: email?.trim() || undefined,
    passwordHash: await hashPassword(tempPassword),
    referralCode,
    status: "aktif",
    category: category || undefined,
    region: region?.trim() || undefined,
    notes: notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await createPartner(partner);

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "partner_olusturuldu",
    targetType: "partner",
    targetId: partner.id,
    targetLabel: partner.name,
    detail: `Referans kodu: ${partner.referralCode}`,
  });

  return NextResponse.json({ partner, tempPassword });
}
