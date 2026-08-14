import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllShops, listVehiclesByShop } from "@/lib/blobStore";
import AdminShopSearch, { type AdminShopRow } from "@/components/AdminShopSearch";

// Yalnızca ADMIN_EMAILS'te tanımlı hesaplara açık — bkz. app/admin/siparisler/page.tsx
// ile aynı desen. İstatistik panelinin (bkz. app/admin/istatistikler) aksine bu
// sayfa TOPLU sayılar değil, TEK TEK bayi satırları gösterir — destek talebi
// geldiğinde ("bayi X'te sorun var") veya banka havalesiyle ödeme alıp elle plan
// yükseltmeniz gerektiğinde asıl ihtiyacınız bu sayfa.
export default async function AdminShopsPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const shops = await listAllShops();
  const rows: AdminShopRow[] = await Promise.all(
    shops
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(async (s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        city: s.city,
        plan: s.plan,
        vehicleCount: (await listVehiclesByShop(s.id)).length,
        createdAt: s.createdAt,
      }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bayiler (Admin)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tüm bayi hesapları — plan, şehir ve araç sayısına göre arayabilir, detayına
        girip planını elle değiştirebilirsiniz.
      </p>
      <div className="mt-6">
        <AdminShopSearch shops={rows} />
      </div>
    </div>
  );
}
