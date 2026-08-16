import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, updateStickerOrder } from "@/lib/blobStore";
import { notifyAdmins, escapeHtml } from "@/lib/email";
import { isStickerOrderCancelableByShop } from "@/lib/stickerOrderUi";

type CancelOutcome = "cancelled" | "not_found_or_forbidden" | "not_cancelable";

// Bayinin kendi etiket siparişini iptal etmesi — "Siparişlerim" listesindeki
// "İptal Et" butonu (bkz. components/StickerOrderList.tsx). Siparişi GERÇEKTEN
// SİLMEZ: StickerOrder mali/muhasebe kaydı olduğu için (bkz. lib/blobStore.ts
// deleteShop yorumu, aynı gerekçe) veritabanından kaldırılmaz — yalnızca
// status "iptal" olarak işaretlenir. Kargoya verilmiş bir sipariş burada
// iptal edilemez (bkz. isStickerOrderCancelableByShop); o noktadan sonrası
// Mesafeli Satış Sözleşmesi'ndeki cayma hakkı/iade süreci ile yürütülür.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const state: { outcome: CancelOutcome; wasPaid: boolean } = {
    outcome: "not_found_or_forbidden",
    wasPaid: false,
  };

  let updatedOrder;
  try {
    updatedOrder = await updateStickerOrder(params.id, (order) => {
      if (order.shopId !== shopId) {
        state.outcome = "not_found_or_forbidden";
        return order;
      }
      if (!isStickerOrderCancelableByShop(order.status)) {
        state.outcome = "not_cancelable";
        return order;
      }
      // Ödemesi zaten alınmış (odendi/hazirlaniyor) bir siparişin iptalinde
      // admin'e haber verilir — para iadesi burada otomatik yapılmaz, admin
      // panelinden elle işaretlenir (bkz. app/api/admin/siparisler/[id]/route.ts).
      state.wasPaid = order.status === "odendi" || order.status === "hazirlaniyor";
      state.outcome = "cancelled";
      return {
        ...order,
        status: "iptal",
        cancelledBy: "bayi",
        cancelledAt: new Date().toISOString(),
        cancelledWithPayment: state.wasPaid,
        updatedAt: new Date().toISOString(),
      };
    });
  } catch {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  if (state.outcome === "not_found_or_forbidden") {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }
  if (state.outcome === "not_cancelable") {
    return NextResponse.json(
      { error: "Bu sipariş artık panelden iptal edilemez — kargoya verilmiş veya zaten sonuçlanmış." },
      { status: 409 }
    );
  }

  if (state.wasPaid) {
    const shop = await getShopById(shopId);
    await notifyAdmins(
      `Etiket siparişi bayi tarafından iptal edildi — ${updatedOrder.shopName}`,
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <p><strong>${escapeHtml(shop?.name || updatedOrder.shopName)}</strong>,
        ${updatedOrder.quantity} adet, ${updatedOrder.totalPriceTry.toLocaleString("tr-TR")}₺ tutarındaki
        ÖDENMİŞ siparişini panelden iptal etti — iade sürecini başlatmayı unutmayın.</p>
        <p><a href="https://otohafiza.com/admin/siparisler">Admin panelinden görüntüle</a></p>
      </div>`
    );
  }

  return NextResponse.json({ order: updatedOrder });
}
