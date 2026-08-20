import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllAnnouncements } from "@/lib/blobStore";
import AdminAnnouncementForm from "@/components/AdminAnnouncementForm";

// Bu sayfa yalnızca ADMIN_EMAILS ortam değişkeninde tanımlı hesaplara açıktır —
// bkz. app/admin/oneriler/page.tsx ile aynı desen ve gerekçe.
export default async function AdminAnnouncementsPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const announcements = await listAllAnnouncements();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Duyurular</h1>
      <p className="mt-1 text-sm text-slate-500">
        Buradan yayınladığınız duyurular, hedef kitlenize giren bayilerin panelinde
        (bkz. Duyurular sayfası) anında görünür. Aşağıdaki kutuyu işaretli bırakırsanız
        aynı duyuru hedef kitledeki her bayiye e-posta olarak da gönderilir.
      </p>

      <AdminAnnouncementForm initialAnnouncements={announcements} />
    </div>
  );
}
