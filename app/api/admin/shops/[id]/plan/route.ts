import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  checkAndAccruePartnerConversionBonus,
  getShopById,
  recordAdminAuditLog,
  recordPlanStart,
  updateShopFields,
} from "@/lib/blobStore";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

// Admin, bir bayinin planını elle değiştirebilsin diye — POS/tekrarlayan ödeme
// entegrasyonu tamamlanana kadar (bkz. BEKLEMEDE task, README "Ödeme /
// Abonelik Notu") banka havalesiyle ödeme alan bayiler için tek yol bu.
// app/api/shop/plan/route.ts'teki bayinin KENDİ planını değiştirdiği uç
// noktadan farklı olarak burada session sahibi değil, admin e-postası
// yetkilendirir (bkz. lib/adminAuth.ts).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const { plan } = (await req.json()) as { plan?: Plan };
  if (!plan || !(plan in PLAN_LIMITS)) {
    return NextResponse.json({ error: "Geçersiz plan." }, { status: 400 });
  }

  const shop = await getShopById(params.id);
  if (!shop) return NextResponse.json({ error: "Bayi bulunamadı." }, { status: 404 });

  try {
    // Admin bir planı elle aktive ettiğinde, bayinin (varsa) beklemedeki
    // yükseltme talebi de temizlenir — artık aktif planla çelişen bir
    // "beklemede" durumu kalmasın (bkz. app/api/shop/plan/route.ts).
    await updateShopFields(params.id, (s) => ({
      ...s,
      plan,
      pendingPlan: undefined,
      pendingPlanRequestedAt: undefined,
    }));
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  await recordPlanStart(params.id, plan);

  // Saha Partner Ağı: bu bayi bir partnerin koduyla geldiyse ve free'den
  // ücretliye ilk kez geçiyorsa dönüşüm bonusunu tahakkuk ettirir (bkz.
  // lib/blobStore.ts checkAndAccruePartnerConversionBonus). Ana işlemi
  // bloklamaz — plan zaten değişti, bir komisyon hesaplama hatası bu kaydı
  // geri almamalı.
  checkAndAccruePartnerConversionBonus(params.id, shop.plan).catch((err) =>
    console.error("[admin/shops/plan] Partner dönüşüm bonusu kontrolü başarısız:", err)
  );

  // Audit log — bkz. app/admin/aktivite. Hata verse bile ana işlemi (plan zaten
  // değişti) geri almaya gerek yok, bu yüzden ayrı bir try/catch'e alınmadı;
  // recordAdminAuditLog kendi içinde bir hata fırlatırsa bu endpoint 500 döner
  // ama plan değişikliği zaten kalıcı olmuştur (Netlify Blobs write'ları ayrı).
  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "plan_degistirildi",
    targetType: "shop",
    targetId: params.id,
    targetLabel: shop.name,
    detail: `${PLAN_LIMITS[shop.plan].label} → ${PLAN_LIMITS[plan].label}`,
  });

  return NextResponse.json({ ok: true });
}
