import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import {
  createStickerOrder,
  getShopById,
  getStickerUnitPriceTry,
  linkStickerOrderToken,
} from "@/lib/blobStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { initializeCheckoutForm } from "@/lib/iyzico";
import type { StickerOrder, StickerOrderAddress } from "@/lib/types";

const MAX_QUANTITY = 500;
const MAX_SHORT_LEN = 120;
const MAX_ADDRESS_LEN = 300;
const IDENTITY_NUMBER_REGEX = /^\d{11}$/;
const MAX_ORDERS_PER_HOUR = 5;

function getSiteUrl(req: NextRequest): string {
  return process.env.URL || process.env.DEPLOY_URL || req.nextUrl.origin;
}

// Etiket siparişi oluşturur ve iyzico Checkout Form oturumu başlatır. Kart bilgileri
// hiçbir zaman bu sunucuya ulaşmaz — kullanıcı iyzico'nun barındırdığı ödeme
// sayfasına (paymentPageUrl) yönlendirilir, ödeme tamamlandığında iyzico
// /api/etiket-siparis/callback adresine geri yönlendirir.
export async function POST(req: NextRequest) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const rate = await checkRateLimit("sticker-order", shopId, MAX_ORDERS_PER_HOUR, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Çok fazla sipariş denemesi yaptınız. ${rate.retryAfterSeconds} saniye sonra tekrar deneyin.` },
      { status: 429 }
    );
  }

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const {
    quantity,
    address,
    identityNumber,
    contractAccepted,
  } = body as {
    quantity?: number;
    address?: StickerOrderAddress;
    identityNumber?: string;
    contractAccepted?: boolean;
  };

  if (!quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json({ error: `Adet 1 ile ${MAX_QUANTITY} arasında olmalıdır.` }, { status: 400 });
  }
  if (!contractAccepted) {
    return NextResponse.json(
      { error: "Devam etmek için Mesafeli Satış Sözleşmesi'ni onaylamalısınız." },
      { status: 400 }
    );
  }
  if (!identityNumber || !IDENTITY_NUMBER_REGEX.test(identityNumber)) {
    return NextResponse.json({ error: "Geçerli bir T.C. Kimlik No giriniz (11 hane)." }, { status: 400 });
  }
  if (
    !address ||
    !address.fullName ||
    !address.phone ||
    !address.addressLine ||
    !address.district ||
    !address.city
  ) {
    return NextResponse.json({ error: "Teslimat adresi bilgileri eksik." }, { status: 400 });
  }
  if (
    address.fullName.length > MAX_SHORT_LEN ||
    address.phone.length > 30 ||
    address.district.length > MAX_SHORT_LEN ||
    address.city.length > MAX_SHORT_LEN ||
    address.addressLine.length > MAX_ADDRESS_LEN ||
    (address.postalCode && address.postalCode.length > 10)
  ) {
    return NextResponse.json({ error: "Girilen adres bilgilerinden biri çok uzun." }, { status: 400 });
  }

  const unitPriceTry = await getStickerUnitPriceTry();
  const totalPriceTry = Math.round(unitPriceTry * quantity * 100) / 100;

  const orderId = randomUUID();
  const now = new Date().toISOString();
  const order: StickerOrder = {
    id: orderId,
    shopId,
    shopName: shop.name,
    quantity,
    unitPriceTry,
    totalPriceTry,
    status: "odeme_bekleniyor",
    shippingAddress: address,
    contractAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await createStickerOrder(order);

  const siteUrl = getSiteUrl(req);
  const priceStr = totalPriceTry.toFixed(2);
  const [firstName, ...rest] = shop.name.trim().split(/\s+/);

  const initResult = await initializeCheckoutForm({
    conversationId: orderId,
    price: priceStr,
    paidPrice: priceStr,
    callbackUrl: `${siteUrl}/api/etiket-siparis/callback`,
    buyer: {
      id: shopId,
      name: firstName || shop.name,
      surname: rest.join(" ") || "İşletme",
      identityNumber,
      email: shop.email,
      gsmNumber: address.phone,
      registrationAddress: address.addressLine,
      city: address.city,
      country: "Turkey",
      zipCode: address.postalCode,
      ip: getClientIp(req),
    },
    shippingAddress: {
      address: address.addressLine,
      zipCode: address.postalCode,
      contactName: address.fullName,
      city: address.city,
      country: "Turkey",
    },
    billingAddress: {
      address: address.addressLine,
      zipCode: address.postalCode,
      contactName: address.fullName,
      city: address.city,
      country: "Turkey",
    },
    basketItems: [
      {
        id: "qr-etiket",
        price: priceStr,
        name: `Oto Künye Dayanıklı QR Etiket x${quantity}`,
        category1: "Etiket",
        itemType: "PHYSICAL",
      },
    ],
    basketId: orderId,
  });

  if (initResult.status !== "success" || !initResult.token || !initResult.paymentPageUrl) {
    return NextResponse.json(
      { error: initResult.errorMessage || "Ödeme başlatılamadı, lütfen tekrar deneyin." },
      { status: 502 }
    );
  }

  await linkStickerOrderToken(initResult.token, orderId);

  return NextResponse.json({ paymentPageUrl: initResult.paymentPageUrl });
}
