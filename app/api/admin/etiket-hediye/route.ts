import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminEmail, getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  createStickerOrder,
  createStickerTokens,
  getShopById,
  recordAdminAuditLog,
} from "@/lib/blobStore";
import type { StickerOrder, StickerOrderAddress } from "@/lib/types";

const MAX_QUANTITY = 500;
const MAX_SHORT_LEN = 120;
const MAX_ADDRESS_LEN = 300;
const MAX_NOTE_LEN = 1000;

// Admin panelinden, kart çekmeden ve iyzico'ya hiç dokunmadan ücretsiz/pilot
// etiket siparişi oluşturur (bkz. pazarlama/ETIKET_HEDIYE_KARARI_BEKLIYOR.md —
// "İlk üyelikte 100 QR etiket hediye" gibi pazarlama kampanyaları için). Aynı
// StickerOrder/StickerToken modelini kullanır (bkz. app/api/etiket-siparis/route.ts
// ile aynı temel adımlar: sipariş kaydı + token üretimi) — tek fark ödeme
// başlatma adımının hiç olmaması ve totalPriceTry'nin 0 olması. Sipariş doğrudan
// "odendi" durumunda oluşur (üretime alınmayı bekleyen durum) — admin sipariş
// ekranından normal bir sipariş gibi kargo/durum takibi yapılabilir.
export async function POST(req: NextRequest) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { shopId, quantity, address, note, labelName, labelPhone } = body as {
    shopId?: string;
    quantity?: number;
    address?: StickerOrderAddress;
    note?: string;
    labelName?: string;
    labelPhone?: string;
  };

  if (!shopId) {
    return NextResponse.json({ error: "Bir bayi seçmelisiniz." }, { status: 400 });
  }
  const shop = await getShopById(shopId);
  if (!shop) {
    return NextResponse.json({ error: "Bayi bulunamadı." }, { status: 404 });
  }

  if (!quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json({ error: `Adet 1 ile ${MAX_QUANTITY} arasında olmalıdır.` }, { status: 400 });
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
  if ((labelName && labelName.length > MAX_SHORT_LEN) || (labelPhone && labelPhone.length > 30)) {
    return NextResponse.json({ error: "Etiket üzerindeki isim/telefon çok uzun." }, { status: 400 });
  }
  if (note && note.length > MAX_NOTE_LEN) {
    return NextResponse.json({ error: "Not çok uzun." }, { status: 400 });
  }

  const orderId = randomUUID();
  const now = new Date().toISOString();
  const order: StickerOrder = {
    id: orderId,
    shopId,
    shopName: shop.name,
    quantity,
    unitPriceTry: 0,
    totalPriceTry: 0,
    status: "odendi",
    shippingAddress: address,
    contractAcceptedAt: now,
    isGift: true,
    adminNote: note?.trim() || "Ücretsiz/pilot etiket — admin tarafından hediye edildi.",
    labelName: labelName || shop.name,
    labelPhone: labelPhone || shop.phone,
    createdAt: now,
    updatedAt: now,
  };
  await createStickerOrder(order);
  await createStickerTokens(shopId, orderId, quantity);

  const actorEmail = (await getCurrentAdminEmail()) || "bilinmeyen";
  await recordAdminAuditLog({
    actorEmail,
    action: "siparis_hediye_edildi",
    targetType: "sticker_order",
    targetId: orderId,
    targetLabel: `${shop.name} — ${quantity} adet`,
    detail: `${quantity} adet ücretsiz etiket verildi${note?.trim() ? " — " + note.trim() : ""}`,
  });

  return NextResponse.json({ order });
}
