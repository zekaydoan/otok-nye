import { getCurrentShopId } from "@/lib/auth";
import { getShopById, listAnnouncementsForShop, markAnnouncementsSeen } from "@/lib/blobStore";
import EmptyState from "@/components/EmptyState";
import { BellIcon } from "@/components/icons";
import { ANNOUNCEMENT_AUDIENCE_LABELS } from "@/lib/types";

// Randevular sayfasındaki markWhatsappAppointmentsSeen deseniyle aynı: sayfa
// ziyareti, header'daki Duyurular rozetini otomatik olarak sıfırlar (bkz.
// lib/blobStore.markAnnouncementsSeen, app/dashboard/layout.tsx).
export default async function AnnouncementsPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  const announcements = shop ? await listAnnouncementsForShop(shop) : [];

  if (shopId) await markAnnouncementsSeen(shopId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Duyurular</h1>
      <p className="mt-1 text-sm text-slate-500">
        OtoHafıza ekibinin indirim, kampanya ve yeni özellik duyuruları burada listelenir.
      </p>

      <div className="mt-6 space-y-3">
        {announcements.length === 0 && (
          <EmptyState
            icon={<BellIcon className="h-6 w-6" />}
            title="Henüz duyuru yok"
            description="Kampanya ve yeni özellik duyuruları yayınlandığında burada görünecek."
          />
        )}
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{a.title}</p>
              {a.audience !== "all" && (
                <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {ANNOUNCEMENT_AUDIENCE_LABELS[a.audience]}
                </span>
              )}
            </div>
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
