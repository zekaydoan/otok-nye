import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  getStickerUnitPriceTry,
  listAllShops,
  listAllStickerOrders,
  listAllStickerStockBatches,
} from "@/lib/blobStore";
import AdminGiftStickerForm from "@/components/AdminGiftStickerForm";
import AdminOrderRow from "@/components/AdminOrderRow";
import AdminOrdersExportButton from "@/components/AdminOrdersExportButton";
import AdminPriceSetting from "@/components/AdminPriceSetting";
import AdminStockStickerForm from "@/components/AdminStockStickerForm";
import EmptyState from "@/components/EmptyState";
import { PackageIcon } from "@/components/icons";

// Bu sayfa yalnızca ADMIN_EMAILS ortam değişkeninde tanımlı hesaplara açıktır.
// Yetkisiz erişimde 404 döner (yönlendirme yerine) — böylece admin rotasının
// varlığı yetkisiz kullanıcılara sızdırılmaz.
export default async function AdminOrdersPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const [orders, unitPriceTry, shops, stockBatches] = await Promise.all([
    listAllStickerOrders(),
    getStickerUnitPriceTry(),
    listAllShops(),
    listAllStickerStockBatches(),
  ]);
  const shopOptions = shops
    .map((s) => ({ id: s.id, name: s.name, email: s.email }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Etiket Siparişleri (Admin)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ödemesi onaylanan siparişleri üretime alın, kargo firması/takip numarasını
        girip durumunu güncelleyin. Bu ekran yalnızca size görünür.
      </p>

      <div className="mt-6 flex flex-col items-start gap-3">
        <AdminPriceSetting currentPriceTry={unitPriceTry} />
        <AdminGiftStickerForm shops={shopOptions} />
        <AdminStockStickerForm />
      </div>

      {/* Genel Stok Etiketleri — hiçbir bayiye/siparişe bağlı olmadan üretilmiş
          partiler (bkz. lib/types.ts StickerStockBatch). Sipariş listesindeki
          AdminOrderRow'lardan bilerek ayrı: bunlar StickerOrder değil, bir bayiye
          henüz atanmamış oldukları için orada anlamlı bir "bayi" satırı yok. */}
      {stockBatches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">Genel Stok Etiketleri</h2>
          <p className="mt-1 text-sm text-slate-500">
            Hiçbir bayiye bağlı olmadan üretilen etiket partileri — bir bayi
            etiketlerden birini ilk kez bir araca bağladığında o bayiye atanır.
          </p>
          <div className="mt-3 space-y-2">
            {stockBatches.map((b) => (
              <Link
                key={b.id}
                href={`/admin/stok/${b.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {b.quantity} adet{b.note ? ` — ${b.note}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(b.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-600">Görüntüle / Yazdır →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 flex justify-end">
          <AdminOrdersExportButton orders={orders} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {orders.length === 0 && (
          <EmptyState
            icon={<PackageIcon className="h-6 w-6" />}
            title="Henüz sipariş yok"
            description="Bayiler etiket sipariş verdiğinde burada listelenecek."
          />
        )}
        {orders.map((order) => (
          <AdminOrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
