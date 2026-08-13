import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/blobStore";
import EditVehicleForm from "@/components/EditVehicleForm";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id, { consistency: "strong" });
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <Link href={`/dashboard/araclar/${vehicle.id}`} className="text-sm text-brand-600">
        ← {vehicle.plateDisplay}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Araç Bilgilerini Düzenle</h1>
      <p className="mt-1 text-sm text-slate-500">
        Araç satıldıysa veya bilgilerde bir hata varsa buradan güncelleyin. Bakım
        geçmişi olduğu gibi korunur.
      </p>
      <EditVehicleForm vehicle={vehicle} />
    </div>
  );
}
