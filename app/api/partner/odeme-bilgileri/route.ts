import { NextRequest, NextResponse } from "next/server";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import { updatePartnerPaymentInfo } from "@/lib/blobStore";
import { validatePartnerPaymentInfo, type PartnerPaymentInfoInput } from "@/lib/paymentInfo";
import type { PartnerPaymentInfo } from "@/lib/types";

// app/api/shop/billing-info ile aynı desen — oturum açmış partnerin KENDİ
// IBAN/banka bilgisini kaydetmesi için (bkz. components/PartnerPaymentInfoForm.tsx,
// app/partner/ayarlar). Hakedişler ayda 1 kez bu bilgiye göre elden/EFT ile
// ödenir (bkz. lib/types.ts Partner.paymentInfo yorumu).
export async function POST(req: NextRequest) {
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const body = (await req.json()) as PartnerPaymentInfoInput;
  const error = validatePartnerPaymentInfo(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const paymentInfo: PartnerPaymentInfo = {
    fullName: (body.fullName || "").trim(),
    iban: (body.iban || "").replace(/\s+/g, "").toUpperCase(),
    bankName: (body.bankName || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await updatePartnerPaymentInfo(partnerId, paymentInfo);
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ paymentInfo });
}
