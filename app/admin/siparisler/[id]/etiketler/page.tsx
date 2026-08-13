import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerOrderById, listStickerTokensByOrder } from "@/lib/blobStore";

// Bir siparişe ait tüm etiket QR bağlantılarını listeler — admin bu listeyi fiziksel
// baskı firmasına iletir (her satır bir etiketin QR kodunun kodlayacağı URL'dir).
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
      <Link href="/admin/siparisler" className="text-sm text-brand-600">
        ← Siparişler
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {order.shopName} — {order.quantity} Adet Etiket
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Etikette basılı: <strong>{order.labelName || order.shopName}</strong> ·{" "}
        {order.labelPhone || order.shippingAddress.phone}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {tokens.length} / {order.quantity} etiket üretildi, {boundCount} tanesi bir araca
        bağlanmış. Aşağıdaki bağlantıların her biri fiziksel bir etikete karşılık gelir
        — baskı firmasına bu listeyi (her satırı ayrı bir QR koduna dönüştürerek) iletin.
      </p>

      <div className="mt-6 max-h-[70vh] overflow-y-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <ol className="space-y-1 font-mono text-sm text-slate-700">
          {tokens.map((t, i) => (
            <li key={t.token}>
              {i + 1}. {siteUrl}/e/{t.token}
              {t.vehicleId && <span className="ml-2 font-sans text-xs text-green-600">(bağlandı)</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
