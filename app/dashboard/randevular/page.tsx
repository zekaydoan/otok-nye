import { getCurrentShopId } from "@/lib/auth";
import { listAppointmentsForShop } from "@/lib/blobStore";
import AppointmentsSection from "@/components/AppointmentsSection";

export default async function AppointmentsPage() {
  const shopId = await getCurrentShopId();
  const appointments = shopId ? await listAppointmentsForShop(shopId) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Randevular</h1>
      <p className="mt-1 text-sm text-slate-500">
        Günlük iş listenizi planlayın, müşterilerinize randevu hatırlatması gönderin.
      </p>
      <AppointmentsSection initialAppointments={appointments} />
    </div>
  );
}
