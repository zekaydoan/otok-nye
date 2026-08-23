import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllDataRequests } from "@/lib/blobStore";
import AdminDataRequestRow from "@/components/AdminDataRequestRow";
import EmptyState from "@/components/EmptyState";
import { LockIcon } from "@/components/icons";
import type { DataRequestStatus } from "@/lib/types";

// Yalnızca ADMIN_EMAILS'te tanımlı hesaplara açık — bkz. app/admin/oneriler/page.tsx
// ile aynı desen. Araç sahiplerinin genel araç sayfasından gönderdiği KVKK m.11
// (bilgi edinme/silme) talepleri burada listelenir — bkz.
// app/api/vehicles/[id]/veri-talebi.
//
// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): liste artık durum önceliğine
// göre sıralanıyor (yeni → işlemde → tamamlandı) — önceden tüm talepler tarih
// sırasında karışık duruyordu, bekleyen (henüz işleme alınmamış) bir talep
// listenin ortasında/altında kalabiliyordu. Array.prototype.sort kararlı
// (stable) olduğundan aynı durum içindeki sıralama (en yeni/en eski) korunur.
const STATUS_PRIORITY: Record<DataRequestStatus, number> = { yeni: 0, islemde: 1, tamamlandi: 2 };

export default async function AdminDataRequestsPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const requests = await listAllDataRequests();
  const sortedRequests = [...requests].sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
  );
  const newCount = requests.filter((r) => r.status === "yeni").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">KVKK Veri Talepleri (Admin)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Araç sahiplerinin genel araç sayfasından gönderdiği bilgi edinme/silme talepleri.
        {newCount > 0 && ` ${newCount} tanesi henüz işleme alınmadı.`}
      </p>

      <div className="mt-6 space-y-3">
        {requests.length === 0 && (
          <EmptyState
            icon={<LockIcon className="h-6 w-6" />}
            title="Henüz veri talebi yok"
            description="Araç sahipleri genel araç sayfasından talep gönderdiğinde burada listelenecek."
          />
        )}
        {sortedRequests.map((r) => (
          <AdminDataRequestRow key={r.id} request={r} />
        ))}
      </div>
    </div>
  );
}
