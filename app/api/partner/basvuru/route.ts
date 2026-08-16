import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth";
import {
  createPartner,
  generatePartnerReferralCode,
  getPartnerByPhone,
  recordAdminAuditLog,
} from "@/lib/blobStore";
import { createPartnerSessionToken, setPartnerSessionCookie } from "@/lib/partnerAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { PARTNER_CATEGORY_LABELS, type Partner, type PartnerCategory } from "@/lib/types";

const MAX_NAME_LEN = 150;
const MAX_PHONE_LEN = 30;
const MAX_REGION_LEN = 200;
const PASSWORD_REGEX = /^\d{6}$/;

// IP başına saatte 5 başvuru — admin onayı olmadan herkesin doğrudan hesap
// açabildiği bir uç nokta olduğu için (bkz. aşağıdaki genel not), kaba kuvvetle
// çok sayıda sahte partner hesabı üretilmesine karşı asıl fren burası.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 saat

// Saha Partnerinin ADMİN BEKLEMEDEN kendi kendine hesap açabildiği uç nokta —
// bkz. app/partner-basvuru (form) ve app/api/admin/partnerler/route.ts (bunun
// admin tarafından elle ekleme karşılığı, hâlâ duruyor, istisnai durumlar için).
// Kasıtlı tasarım kararı: yeni partner status="aktif" ile hemen başlar, "admin
// onayı bekliyor" ara durumu YOK — kullanıcının talebi tam olarak buydu ("satıcı
// partner kendisi üye olmalı, adminden bir şey beklememeli"). Bu güvenli, çünkü
// partnere GERÇEK ödeme (bkz. types.ts Partner.passwordHash yorumu ve
// pazarlama/Saha_Partner_Agi_Analiz.docx) sistemde otomatik değil, admin'in
// "Bekleyen Komisyon" rakamını görüp elle yaptığı ayrı bir adım — yani sahte bir
// başvuru, kimse elle para göndermediği sürece OtoHafıza'ya maliyet çıkarmaz.
// Admin, aktivite günlüğünde (partner_kendi_basvurdu, bkz. app/admin/aktivite)
// her yeni başvuruyu görür ve şüpheli bir hesabı PartnerStatusToggle ile
// istediği an pasife çekebilir.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, password, email, category, region } = body as {
    name?: string;
    phone?: string;
    password?: string;
    email?: string;
    category?: PartnerCategory;
    region?: string;
  };

  const trimmedName = (name || "").trim();
  const trimmedPhone = (phone || "").trim();
  if (!trimmedName) return NextResponse.json({ error: "Ad Soyad zorunlu." }, { status: 400 });
  if (!trimmedPhone) return NextResponse.json({ error: "Telefon zorunlu." }, { status: 400 });
  if (!password || !PASSWORD_REGEX.test(password)) {
    return NextResponse.json({ error: "Şifre tam olarak 6 haneli rakam olmalı." }, { status: 400 });
  }
  if (trimmedName.length > MAX_NAME_LEN || trimmedPhone.length > MAX_PHONE_LEN) {
    return NextResponse.json({ error: "Girilen bilgiler çok uzun." }, { status: 400 });
  }
  if (category && !(category in PARTNER_CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Geçersiz kategori." }, { status: 400 });
  }
  if (region && region.length > MAX_REGION_LEN) {
    return NextResponse.json({ error: "Bölge alanı çok uzun." }, { status: 400 });
  }

  const rateLimitKey = getClientIp(req);
  const rateLimit = await checkRateLimit("partner-basvuru", rateLimitKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla başvuru denemesi yapıldı. Lütfen ${Math.ceil(
          (rateLimit.retryAfterSeconds || 60) / 60
        )} dakika sonra tekrar deneyin.`,
      },
      { status: 429 }
    );
  }

  // bkz. app/api/admin/partnerler/route.ts — aynı çakışma engeli, burada da
  // aynı telefonla ikinci bir hesabın açılmasını (ve giriş->indeks karışmasını)
  // önlemek için.
  const existingByPhone = await getPartnerByPhone(trimmedPhone);
  if (existingByPhone) {
    return NextResponse.json(
      { error: "Bu telefon numarasıyla zaten bir partner hesabı var. Giriş yapmayı deneyin." },
      { status: 409 }
    );
  }

  const referralCode = await generatePartnerReferralCode(trimmedName);
  const partner: Partner = {
    id: randomUUID(),
    name: trimmedName,
    phone: trimmedPhone,
    email: email?.trim() || undefined,
    passwordHash: await hashPassword(password),
    referralCode,
    status: "aktif",
    category: category || undefined,
    region: region?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await createPartner(partner);

  // Admin bu işlemi yapmadı ama aktivite günlüğünde görebilsin diye kaydediliyor
  // — actorEmail alanı burada bir admin e-postası değil, kaynağı belirten sabit
  // bir etiket (bkz. app/admin/aktivite listesinde bu satır normal admin
  // işlemleriyle karışmasın diye "Kim: ..." yerine doğrudan bu metin görünür).
  await recordAdminAuditLog({
    actorEmail: "Partner kendi başvurdu",
    action: "partner_kendi_basvurdu",
    targetType: "partner",
    targetId: partner.id,
    targetLabel: partner.name,
    detail: `Telefon: ${trimmedPhone} · Referans kodu: ${partner.referralCode}`,
  });

  const token = await createPartnerSessionToken(partner.id);
  setPartnerSessionCookie(token);

  return NextResponse.json({ ok: true, referralCode: partner.referralCode });
}
