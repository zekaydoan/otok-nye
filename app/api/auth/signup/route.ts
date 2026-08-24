import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  attributeShopToPartnerIfUnset,
  createShop,
  getPartnerByReferralCode,
  getShopByEmail,
  getStaffByEmail,
  recordContractAcceptance,
  recordPlanStart,
} from "@/lib/blobStore";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { SHOP_CONTRACT_DOCUMENT_ORDER, CONTRACT_VERSIONS, computeAcceptanceHash } from "@/lib/contracts";
import { TR_PROVINCES, type ContractAcceptanceItem, type Shop } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 150;
const MAX_PHONE_LEN = 30;

export async function POST(req: NextRequest) {
  // Otomatik hesap oluşturma (spam/bot) girişimlerine karşı IP bazlı hız sınırı.
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("signup", ip, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Çok fazla hesap oluşturma denemesi yapıldı. Lütfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, email, phone, password, city, ref, consents } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    city?: string;
    ref?: string; // Saha Partner Ağı referans kodu (?ref=KOD) — bkz. app/kayit/page.tsx
    // Kayıt formundaki 4 ayrı onay kutucuğunun anlık durumu (bkz. app/kayit/page.tsx,
    // lib/contracts.ts CONTRACT_DOCUMENT_ORDER). pazarlama_izni hariç üçü zorunludur.
    consents?: Partial<Record<string, boolean>>;
  };

  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): Şehir artık zorunlu değil —
  // Hesap Aç → İlk Araç → İlk Bakım akışının hiçbir adımında kullanılmıyor,
  // yalnızca daha sonraki abonelik/fatura akışlarında devreye giriyor ve
  // orada zaten bir "İstanbul" varsayılanı var (bkz. app/api/shop/plan).
  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: "Tüm alanları doldurun." }, { status: 400 });
  }
  // Zorunlu 3 onay (SaaS Sözleşmesi+Kullanım Şartları, KVKK Aydınlatma Metni,
  // yurt dışı veri aktarımı açık rızası) işaretlenmeden hesap açılamaz — bkz.
  // hukuki/00_INDEKS_ve_RISK_ANALIZI.md aksiyon listesi ve KVKK Metni §5.
  const missingRequiredConsent = SHOP_CONTRACT_DOCUMENT_ORDER.some(
    (doc) => doc.required && !consents?.[doc.key]
  );
  if (missingRequiredConsent) {
    return NextResponse.json(
      { error: "Devam etmek için sözleşme ve KVKK onaylarının tümünü işaretlemelisiniz." },
      { status: 400 }
    );
  }
  // Şehir opsiyonel ama girildiyse serbest metin yerine sabit il listesiyle
  // eşleşmeli — bkz. lib/types.ts TR_PROVINCES yorumu (şehir bazlı raporlarda
  // yazım farkı sorunu olmasın diye).
  if (city && !(TR_PROVINCES as readonly string[]).includes(city)) {
    return NextResponse.json({ error: "Geçerli bir şehir seçin." }, { status: 400 });
  }
  if (name.length > MAX_NAME_LEN || phone.length > MAX_PHONE_LEN) {
    return NextResponse.json({ error: "Girilen bilgiler çok uzun." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  // E-posta hem Shop (hesap sahibi) hem StaffAccount (çalışan) tablosunda
  // benzersiz olmalı — aksi hâlde giriş sırasında hangi hesaba ait olduğu
  // belirsizleşir (bkz. app/api/auth/login).
  const [existingShop, existingStaff] = await Promise.all([
    getShopByEmail(email),
    getStaffByEmail(email),
  ]);
  if (existingShop || existingStaff) {
    return NextResponse.json({ error: "Bu e-posta ile zaten bir hesap var." }, { status: 409 });
  }

  const shop: Shop = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash: await hashPassword(password),
    plan: "free",
    ...(city ? { city } : {}),
    createdAt: new Date().toISOString(),
  };

  await createShop(shop);
  await recordPlanStart(shop.id, shop.plan);

  // Sözleşme kabul kaydı: her onaylanan/pas geçilen madde için o an yürürlükte
  // olan versiyon ve bir bütünlük hash'i tek bir zaman damgasıyla saklanır
  // (bkz. lib/contracts.ts). Bu adım başarısız olsa bile kayıt akışı BLOKLANMAZ
  // — kullanıcı deneyimini bozmamak için hata sessizce loglanır; ancak yukarıdaki
  // zorunlu onay kontrolü sayesinde gerçek onay zaten formdan doğrulanmış olur.
  try {
    const acceptedAt = shop.createdAt;
    const items: ContractAcceptanceItem[] = SHOP_CONTRACT_DOCUMENT_ORDER.map((doc) => {
      const version = CONTRACT_VERSIONS[doc.key];
      const accepted = Boolean(consents?.[doc.key]);
      return {
        document: doc.key,
        version,
        accepted,
        hash: computeAcceptanceHash({ document: doc.key, version, identifier: shop.email, acceptedAt }),
      };
    });
    await recordContractAcceptance({
      accountType: "shop",
      accountId: shop.id,
      identifier: shop.email,
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
      items,
    });
  } catch (err) {
    console.error("[signup] Sözleşme kabul kaydı oluşturulamadı (kayıt yine de tamamlandı):", err);
  }

  // Saha Partner Ağı: geçerli bir referans koduyla geldiyse bayiyi o partnere
  // bağlar (bkz. lib/blobStore.ts attributeShopToPartnerIfUnset). Bilinmeyen/
  // geçersiz bir kod ya da bulunamayan partner sessizce yok sayılır — kayıt
  // akışını ASLA bloklamaz, bu yalnızca bir izleme/komisyon detayıdır.
  if (ref) {
    try {
      const partner = await getPartnerByReferralCode(ref);
      if (partner && partner.status === "aktif") {
        await attributeShopToPartnerIfUnset(shop.id, partner.id);
      }
    } catch (err) {
      console.error("[signup] Partner ataması başarısız (kayıt yine de tamamlandı):", err);
    }
  }

  const token = await createSessionToken({ shopId: shop.id, role: "sahibi" });
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
