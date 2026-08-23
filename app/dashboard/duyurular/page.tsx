import { getCurrentShopId } from "@/lib/auth";
import {
  getShopById,
  listAnnouncementsForShop,
  markAnnouncementsSeen,
  recordAnnouncementRead,
} from "@/lib/blobStore";
import EmptyState from "@/components/EmptyState";
import { BellIcon } from "@/components/icons";
import AnnouncementCard from "@/components/AnnouncementCard";

// Randevular sayfasındaki markWhatsappAppointmentsSeen deseniyle aynı: sayfa
// ziyareti, header'daki Duyurular rozetini otomatik olarak sıfırlar (bkz.
// lib/blobStore.markAnnouncementsSeen, app/dashboard/layout.tsx). Ayrıca
// admin'in "kim okudu?" panelinde (bkz. AdminAnnouncementForm) görünebilmesi
// için her gösterilen duyuru için ayrı bir okundu kaydı düşülür (bkz.
// blobStore.recordAnnouncementRead) — bu, kaba rozet imlecinden (yukarıdaki
// markAnnouncementsSeen) BAĞIMSIZ, duyuru bazlı ayrı bir mekanizmadır.
export default async function AnnouncementsPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  const announcements = shop ? await listAnnouncementsForShop(shop) : [];
  // "Yeni" rozeti için: markAnnouncementsSeen ÇAĞRILMADAN ÖNCEKİ imleç değeri
  // (V2 sadeleştirme, 23 Ağustos 2026, Zeki onayı) — `shop` zaten bu satırdan
  // önce okunduğu için burada hâlâ eski değeri taşıyor, ayrı bir sorgu gerekmez.
  const lastSeenBefore = shop?.lastSeenAnnouncementAt;

  if (shopId) await markAnnouncementsSeen(shopId);
  if (shop) {
    await Promise.all(
      announcements.map((a) => recordAnnouncementRead(a.id, "usta", shop.id, shop.name))
    );
  }

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
          <AnnouncementCard
            key={a.id}
            title={a.title}
            message={a.message}
            createdAt={a.createdAt}
            isNew={!lastSeenBefore || a.createdAt > lastSeenBefore}
          />
        ))}
      </div>
    </div>
  );
}
