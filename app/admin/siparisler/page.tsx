import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerUnitPriceTry, listAllShops, listAllStickerOrders } from "@/lib/blobStore";
import AdminGiftStickerForm from "@/components/AdminGiftStickerForm";
import AdminOrderRow from "@/components/AdminOrderRow";
import AdminOrdersExportButton from "@/components/AdminOrdersExportButton";
import AdminPriceSetting from "@/components/AdminPriceSetting";
import EmptyState from "@/components/EmptyState";
import { PackageIcon } from "@/components/icons";

// Bu sayfa yalnızca ADMIN_EMAILS ortam değişkeninde tanımlı hesaplara açıktır.
// Yetkisiz erişimde 404 döner (yönlendirme yerine) — böylece admin rotasının
// varlığı yetkisiz kullanıcılara sızdırılmaz.
export default async function AdminOrdersPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const [orders, unitPriceTry, shops] = await Promise.all([
    listAllStickerOrders(),
    getStickerUnitPriceTry(),
    listAllShops(),
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
      </div>

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
