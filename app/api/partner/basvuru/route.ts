import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth";
import {
  createPartner,
  generatePartnerReferralCode,
  getPartnerByPhone,
  recordAdminAuditLog,
  recordContractAcceptance,
} from "@/lib/blobStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { CONTRACT_VERSIONS, PARTNER_CONTRACT_DOCUMENT_ORDER, computeAcceptanceHash } from "@/lib/contracts";
import { PARTNER_CATEGORY_LABELS, type ContractAcceptanceItem, type Partner, type PartnerCategory } from "@/lib/types";

const MAX_NAME_LEN = 150;
const MAX_PHONE_LEN = 30;
const MAX_REGION_LEN = 200;
const PASSWORD_REGEX = /^\d{6}$/;

// IP başına saatte 5 başvuru — admin onayı olmadan herkesin doğrudan hesap
// açabildiği bir uç nokta olduğu için (bkz. aşağıdaki genel not), kaba kuvvetle
// çok sayıda sahte partner hesabı üretilmesine karşı asıl fren burası.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 saat

// Saha Partnerinin kendi kendine BAŞVURU formu doldurabildiği uç nokta — bkz.
// app/partner-basvuru (form) ve app/api/admin/partnerler/route.ts (bunun admin
// tarafından elle ekleme karşılığı, hâlâ duruyor, istisnai durumlar için).
// ÖNEMLİ (revize edilen tasarım kararı): yeni partner status="onay_bekliyor"
// ile başlar, admin onaylamadan giriş yapamaz ve referans linki çalışmaz —
// önceki sürümde "aktif" ile anında başlıyordu ama bu, özellikle AYNI
// BÖLGEDEN/ŞEHİRDEN birden fazla kişi başvurduğunda (ör. aynı sanayi
// sitesinde 3 kişi partner olmak isterse) admin'in hiçbirini karşılaştırıp
// seçme şansı olmadan hepsinin otomatik aktif olması anlamına geliyordu — bu
// yüzden geri alındı. Admin artık app/admin/partnerler'da bölgeye göre
// gruplanmış "Onay Bekleyen Başvurular" listesinden başvuruları karşılaştırıp
// onaylıyor/reddediyor (bkz. components/AdminPendingPartners.tsx). Bu yüzden
// burada ARTIK oturum açtırılmıyor (createPartnerSessionToken/
// setPartnerSessionCookie kaldırıldı) — onaylanmamış bir hesaba panel erişimi
// vermenin anlamı yok, app/partner-basvuru sayfası "başvurunuz alındı" ekranı
// gösteriyor.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, password, email, category, region, consents } = body as {
    name?: string;
    phone?: string;
    password?: string;
    email?: string;
    category?: PartnerCategory;
    region?: string;
    // Başvuru formundaki 4 ayrı onay kutucuğunun anlık durumu (bkz.
    // app/partner-basvuru/page.tsx, lib/contracts.ts PARTNER_CONTRACT_DOCUMENT_ORDER).
    // pazarlama_izni hariç üçü zorunludur.
    consents?: Partial<Record<string, boolean>>;
  };

  const trimmedName = (name || "").trim();
  const trimmedPhone = (phone || "").trim();
  if (!trimmedName) return NextResponse.json({ error: "Ad Soyad zorunlu." }, { status: 400 });
  if (!trimmedPhone) return NextResponse.json({ error: "Telefon zorunlu." }, { status: 400 });
  if (!password || !PASSWORD_REGEX.test(password)) {
    return NextResponse.json({ error: "Şifre tam olarak 6 haneli rakam olmalı." }, { status: 400 });
  }
  // Zorunlu 3 onay (Saha Partner Sözleşmesi+Kullanım Şartları, KVKK Aydınlatma
  // Metni, yurt dışı veri aktarımı açık rızası) işaretlenmeden başvuru
  // gönderilemez — bkz. hukuki/09_Saha_Partner_Sozlesmesi.md ve KVKK Metni §5.
  const missingRequiredConsent = PARTNER_CONTRACT_DOCUMENT_ORDER.some(
    (doc) => doc.required && !consents?.[doc.key]
  );
  if (missingRequiredConsent) {
    return NextResponse.json(
      { error: "Devam etmek için sözleşme ve KVKK onaylarının tümünü işaretlemelisiniz." },
      { status: 400 }
    );
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
    status: "onay_bekliyor",
    category: category || undefined,
    region: region?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await createPartner(partner);

  // Sözleşme kabul kaydı: her onaylanan/pas geçilen madde için o an yürürlükte
  // olan versiyon ve bir bütünlük hash'i tek bir zaman damgasıyla saklanır
  // (bkz. lib/contracts.ts, app/api/auth/signup/route.ts'teki aynı desen).
  // identifier olarak email varsa email, yoksa telefon kullanılır — partnerde
  // email isteğe bağlı olduğundan (bkz. yukarısı) tek sabit alan telefon.
  // Bu adım başarısız olsa bile başvuru akışı BLOKLANMAZ; hata sessizce
  // loglanır, gerçek onay zaten yukarıdaki zorunlu kontrolle doğrulanmıştır.
  try {
    const acceptedAt = partner.createdAt;
    const identifier = partner.email || partner.phone;
    const items: ContractAcceptanceItem[] = PARTNER_CONTRACT_DOCUMENT_ORDER.map((doc) => {
      const version = CONTRACT_VERSIONS[doc.key];
      const accepted = Boolean(consents?.[doc.key]);
      return {
        document: doc.key,
        version,
        accepted,
        hash: computeAcceptanceHash({ document: doc.key, version, identifier, acceptedAt }),
      };
    });
    await recordContractAcceptance({
      accountType: "partner",
      accountId: partner.id,
      identifier,
      ip: rateLimitKey,
      userAgent: req.headers.get("user-agent") ?? undefined,
      items,
    });
  } catch (err) {
    console.error("[partner-basvuru] Sözleşme kabul kaydı oluşturulamadı (başvuru yine de tamamlandı):", err);
  }

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
    detail: `Telefon: ${trimmedPhone} · Bölge: ${region?.trim() || "belirtilmedi"} · Onay bekliyor`,
  });

  return NextResponse.json({ ok: true, pending: true });
}
