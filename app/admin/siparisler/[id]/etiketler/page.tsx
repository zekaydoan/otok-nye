import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerOrderById, listStickerTokensByOrder } from "@/lib/blobStore";
import StickerTokenGrid from "@/components/StickerTokenGrid";

// Bir siparişe ait tüm etiket QR kodlarını gösterir — admin bunları doğrudan
// yazdırabilir/PDF olarak kaydedebilir, ya da düz link listesini profesyonel bir
// baskı firmasına iletebilir (her satır bir etiketin QR kodunun kodlayacağı URL'dir).
export default async function AdminOrderTokensPage({ params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const order = await getStickerOrderById(params.id);
  if (!order) notFound();

  const tokens = await listStickerTokensByOrder(order.id);
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || "";
  const boundCount = tokens.filter((t) => t.vehicleId).length;

  return (
    <div>
      <Link href="/admin/siparisler" className="no-print text-sm text-brand-600">
        ← Siparişler
      </Link>
      <h1 className="no-print mt-4 text-2xl font-bold text-slate-900">
        {order.shopName} — {order.quantity} Adet Etiket
      </h1>
      <p className="no-print mt-1 text-sm text-slate-500">
        Etikette basılı: <strong>{order.labelName || order.shopName}</strong> ·{" "}
        {order.labelPhone || order.shippingAddress.phone}
      </p>
      <p className="no-print mt-1 text-sm text-slate-500">
        {tokens.length} / {order.quantity} etiket üretildi, {boundCount} tanesi bir araca
        bağlanmış.
      </p>

      <div className="mt-6">
        <StickerTokenGrid
          tokens={tokens}
          baseUrl={siteUrl}
          labelName={order.labelName || order.shopName}
          labelPhone={order.labelPhone || order.shippingAddress.phone}
        />
      </div>
    </div>
  );
}
