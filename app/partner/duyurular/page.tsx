import { getCurrentPartnerId } from "@/lib/partnerAuth";
import {
  getPartnerById,
  listAnnouncementsForPartner,
  markAnnouncementsSeenForPartner,
  recordAnnouncementRead,
} from "@/lib/blobStore";
import EmptyState from "@/components/EmptyState";
import { BellIcon } from "@/components/icons";

// app/dashboard/duyurular ile aynı desen, Saha Satış Partnerleri için (bkz.
// AnnouncementRecipientType). Partnerlerde plan kavramı olmadığından audience
// rozeti gösterilmez — recipientType "partner" olan duyurular her zaman
// "all" audience'la kaydedilir (bkz. app/api/admin/duyurular/route.ts).
export default async function PartnerAnnouncementsPage() {
  const partnerId = await getCurrentPartnerId();
  const partner = partnerId ? await getPartnerById(partnerId) : null;
  const announcements = partner ? await listAnnouncementsForPartner(partner) : [];

  if (partnerId) await markAnnouncementsSeenForPartner(partnerId);
  if (partner) {
    await Promise.all(
      announcements.map((a) => recordAnnouncementRead(a.id, "partner", partner.id, partner.name))
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Duyurular</h1>
      <p className="mt-1 text-sm text-slate-500">
        OtoHafıza ekibinin Saha Satış Partnerlerine yönelik duyuruları burada listelenir.
      </p>

      <div className="mt-6 space-y-3">
        {announcements.length === 0 && (
          <EmptyState
            icon={<BellIcon className="h-6 w-6" />}
            title="Henüz duyuru yok"
            description="Size özel duyurular yayınlandığında burada görünecek."
          />
        )}
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">{a.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{a.message}</p>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(a.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
