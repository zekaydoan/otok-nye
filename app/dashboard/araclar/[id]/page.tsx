import { notFound } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import {
  getReminderLogEntry,
  getShopById,
  getVehicleById,
  listOilRecordsForVehicle,
} from "@/lib/blobStore";
import { isWhatsAppAutoConfigured, reminderCycleKey, reminderStatusLabel } from "@/lib/whatsappReminder";
import VehicleDetailView from "@/components/VehicleDetailView";

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { plakaGuncellendi?: string };
}) {
  // Bu panel sayfası, bir bakım kaydı eklendikten hemen sonra (router.refresh() ile)
  // yeniden yükleniyor — bayinin az önce eklediği kaydı görememesi kötü bir deneyim
  // olacağından burada strong consistency kullanıyoruz. Yine de Netlify Blobs'un
  // .list() metodu strong consistency desteklemediğinden bu tek başına yeterli
  // olmayabiliyor; asıl gecikme çözümü VehicleDetailView'daki optimistic update.
  const vehicle = await getVehicleById(params.id, { consistency: "strong" });
  if (!vehicle) notFound();
  const records = await listOilRecordsForVehicle(vehicle.id, { consistency: "strong" });

  const currentShopId = await getCurrentShopId();
  const isOwnVehicle = vehicle.createdByShopId === currentShopId;
  const creatorShop = !isOwnVehicle ? await getShopById(vehicle.createdByShopId) : null;
  const currentShop = currentShopId ? await getShopById(currentShopId) : null;

  const latestRecord = records[0];
  const reminderStatus =
    vehicle.ownerPhone && latestRecord
      ? reminderStatusLabel(
          await getReminderLogEntry(vehicle.id),
          reminderCycleKey(latestRecord),
          isWhatsAppAutoConfigured(),
          vehicle.whatsappOptOut
        )
      : null;

  return (
    <VehicleDetailView
      vehicle={vehicle}
      initialRecords={records}
      isOwnVehicle={isOwnVehicle}
      creatorShopName={creatorShop?.name}
      favoriteOils={currentShop?.favoriteOils || []}
      plakaGuncellendi={!!searchParams.plakaGuncellendi}
      reminderStatus={reminderStatus}
      shopId={currentShopId}
    />
  );
}
