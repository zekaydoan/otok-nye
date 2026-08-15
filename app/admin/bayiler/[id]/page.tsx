import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getShopById, listStickerOrdersByShop, listVehiclesByShop } from "@/lib/blobStore";
import { E_INVOICE_TYPE_LABELS, PLAN_LIMITS, STICKER_ORDER_STATUS_LABELS } from "@/lib/types";
import AdminPlanOverrideForm from "@/components/AdminPlanOverrideForm";

export default async function AdminShopDetailPage({ params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const shop = await getShopById(params.id);
  if (!shop) notFound();

  const [vehicles, orders] = await Promise.all([
    listVehiclesByShop(shop.id),
    listStickerOrdersByShop(shop.id),
  ]);

  return (
    <div>
      <Link href="/admin/bayiler" className="text-sm text-brand-600">
        ← Bayiler
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {shop.email} · {shop.phone} · {shop.city || "Şehir belirtilmemiş"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Kayıt: {shop.createdAt.slice(0, 10)} · {vehicles.length} araç
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          {PLAN_LIMITS[shop.plan].label}
        </span>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold text-slate-900">Planı Elle Değiştir</h2>
        <p className="mt-1 text-xs text-slate-400">
          POS entegrasyonu tamamlanana kadar (bkz. README) banka havalesiyle ödeme
          alınan bayiler için — burada yapılan değişiklik Plan Dağılımı istatistiğine
          de yansır.
        </p>
        <div className="mt-4">
          <AdminPlanOverrideForm shopId={shop.id} currentPlan={shop.plan} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold text-slate-900">Fatura Bilgileri</h2>
        {!shop.billingInfo ? (
          <p className="mt-2 text-sm text-slate-400">Bu bayi henüz fatura bilgilerini kaydetmedi.</p>
        ) : (
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">Tip</dt>
              <dd className="font-medium text-slate-800">
                {shop.billingInfo.type === "bireysel" ? "Bireysel" : "Kurumsal"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">
                {shop.billingInfo.type === "bireysel" ? "Ad Soyad" : "Firma Unvanı"}
              </dt>
              <dd className="font-medium text-slate-800">
                {shop.billingInfo.type === "bireysel" ? shop.billingInfo.fullName : shop.billingInfo.companyName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Vergi Dairesi</dt>
              <dd className="font-medium text-slate-800">{shop.billingInfo.taxOffice}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">
                {shop.billingInfo.type === "bireysel" ? "T.C. Kimlik No" : "Vergi Numarası"}
              </dt>
              <dd className="font-medium text-slate-800">{shop.billingInfo.taxNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Telefon</dt>
              <dd className="font-medium text-slate-800">{shop.billingInfo.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Mükellefiyet</dt>
              <dd className="font-medium text-slate-800">
                {E_INVOICE_TYPE_LABELS[shop.billingInfo.eInvoiceType]}
              </dd>
            </div>
            {shop.billingInfo.email && (
              <div>
                <dt className="text-xs text-slate-400">E-posta</dt>
                <dd className="font-medium text-slate-800">{shop.billingInfo.email}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-400">Adres</dt>
              <dd className="font-medium text-slate-800">{shop.billingInfo.address}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold text-slate-900">Etiket Siparişleri</h2>
        {orders.length === 0 && <p className="mt-2 text-sm text-slate-400">Hiç sipariş yok.</p>}
        <div className="mt-3 space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-600">
                {o.quantity} adet · {o.createdAt.slice(0, 10)}
              </span>
              <span className="font-medium text-slate-800">{STICKER_ORDER_STATUS_LABELS[o.status]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
