import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { updateShopBillingInfo } from "@/lib/blobStore";
import { validateBillingInfo, type BillingInfoInput } from "@/lib/billing";
import type { BillingInfo, BillingType, EInvoiceType } from "@/lib/types";

// Fatura bilgileri, plan/fatura değişikliğiyle aynı yetki sınırına tabi —
// yalnızca hesap sahibi kaydedebilir (bkz. app/api/shop/plan aynı desen).
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const body = (await req.json()) as BillingInfoInput;
  const error = validateBillingInfo(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const billingInfo: BillingInfo = {
    type: body.type as BillingType,
    fullName: body.type === "bireysel" ? (body.fullName || "").trim() : undefined,
    companyName: body.type === "kurumsal" ? (body.companyName || "").trim() : undefined,
    taxOffice: (body.taxOffice || "").trim(),
    taxNumber: (body.taxNumber || "").trim(),
    address: (body.address || "").trim(),
    phone: (body.phone || "").trim(),
    eInvoiceType: body.eInvoiceType as EInvoiceType,
    email: (body.email || "").trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateShopBillingInfo(session.shopId, billingInfo);
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }

  return NextResponse.json({ billingInfo });
}
