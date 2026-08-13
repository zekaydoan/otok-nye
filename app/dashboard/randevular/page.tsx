import { getCurrentShopId } from "@/lib/auth";
import { listAppointmentsForShop, markWhatsappAppointmentsSeen } from "@/lib/blobStore";
import AppointmentsSection from "@/components/AppointmentsSection";

export default async function AppointmentsPage() {
  const shopId = await getCurrentShopId();
  const appointments = shopId ? await listAppointmentsForShop(shopId) : [];
  // Sayfa açıldığı an, WhatsApp onayıyla gelen ama henüz görülmemiş randevular
  // "görüldü" işaretlenir — header'daki kırmızı rozet (bkz. app/dashboard/layout.tsx)
  // bir sonraki sayfa yüklemesinde sıfırlanmış olur.
  if (shopId) await markWhatsappAppointmentsSeen(shopId);

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
