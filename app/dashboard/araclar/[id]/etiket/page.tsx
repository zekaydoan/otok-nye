import { notFound } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, getVehicleById } from "@/lib/blobStore";
import StickerEditor from "@/components/StickerEditor";

export default async function StickerPage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">QR Etiket Oluştur</h1>
      <p className="mt-1 text-sm text-slate-500">
        Etiketi yazdırıp aracın motor kaputu / yağ dolum kapağı gibi görünür bir yerine yapıştırın.
      </p>
      <div className="mt-6">
        <StickerEditor
          vehicleId={vehicle.id}
          plateDisplay={vehicle.plateDisplay}
          defaultShopName={shop?.name || ""}
          defaultShopPhone={shop?.phone || ""}
        />
      </div>
    </div>
  );
}
