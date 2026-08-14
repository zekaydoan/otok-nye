import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import {
  getReminderLogEntry,
  getShopById,
  listAppointmentsForShop,
  listUpcomingServicesForShop,
  listVehiclesByShop,
} from "@/lib/blobStore";
import { buildReminderMessage } from "@/lib/maintenance";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { isWhatsAppAutoConfigured, reminderCycleKey, reminderStatusLabel } from "@/lib/whatsappReminder";
import { getTimeGreeting } from "@/lib/greeting";
import { PLAN_LIMITS } from "@/lib/types";
import PlateSearch from "@/components/PlateSearch";
import QrScanner from "@/components/QrScanner";
import VehicleListSection from "@/components/VehicleListSection";
import WhatsAppReminderButton from "@/components/WhatsAppReminderButton";
import { CalendarIcon } from "@/components/icons";

function dateBadge(daysUntil: number): { text: string; className: string } {
  if (daysUntil < 0) {
    return { text: `${Math.abs(daysUntil)} gün gecikti`, className: "bg-red-100 text-red-700" };
  }
  if (daysUntil === 0) {
    return { text: "Bugün", className: "bg-amber-100 text-amber-700" };
  }
  return { text: `${daysUntil} gün kaldı`, className: "bg-brand-50 text-brand-700" };
}

function kmBadge(kmRemaining: number): { text: string; className: string } {
  if (kmRemaining < 0) {
    return {
      text: `${Math.abs(kmRemaining).toLocaleString("tr-TR")} km geçti`,
      className: "bg-red-100 text-red-700",
    };
  }
  return { text: `${kmRemaining.toLocaleString("tr-TR")} km kaldı`, className: "bg-sky-50 text-sky-700" };
}

export default async function DashboardPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  const vehicles = shopId ? await listVehiclesByShop(shopId) : [];
  const upcomingRaw = shopId ? await listUpcomingServicesForShop(shopId, 14) : [];
  const autoConfigured = isWhatsAppAutoConfigured();
  const upcoming = await Promise.all(
    upcomingRaw.map(async (u) => ({
      ...u,
      reminderStatus: u.vehicle.ownerPhone
        ? reminderStatusLabel(
            await getReminderLogEntry(u.vehicle.id),
            reminderCycleKey(u.record),
            autoConfigured,
            u.vehicle.whatsappOptOut
          )
        : null,
    }))
  );
  const appointments = shopId ? await listAppointmentsForShop(shopId) : [];
  const limit = shop ? PLAN_LIMITS[shop.plan] : null;

  const greeting = getTimeGreeting();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments
    .filter((a) => a.date === todayISO && a.status === "bekliyor")
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  return (
    <div>
      {/* Karşılama paneli — pazarlama sayfasındaki dekoratif blur motifiyle aynı
          görsel dili kullanır, panele giriş yapan ustaya markanın "aynı ürün"
          hissini anında verir. */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-accent-500/20 blur-2xl"
        />
        <p className="relative text-sm font-medium text-brand-100">
          {greeting}{shop ? `, ${shop.name}` : ""}
        </p>
        <h1 className="relative mt-1 text-2xl font-bold">Araçlarım</h1>
        <p className="relative mt-1 text-sm text-brand-100/90">
          Oluşturduğunuz + bakım kaydı eklediğiniz tüm araçlar
        </p>
      </div>

      <div className="mt-4 flex w-full gap-2 sm:w-auto sm:justify-end">
        <div className="flex-1 sm:flex-none">
          <QrScanner />
        </div>
        <Link
          href="/dashboard/araclar/yeni"
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-center font-semibold text-white hover:bg-brand-700 active:scale-[0.98] sm:flex-none"
        >
          + Yeni Araç Ekle
        </Link>
      </div>

      <div className="mt-2 flex items-center justify-end gap-3 text-xs font-medium">
        <a href="/api/shop/export" className="text-brand-600 hover:underline">
          Verimi İndir (CSV) ↓
        </a>
        <Link href="/dashboard/araclar/toplu-ekle" className="text-brand-600 hover:underline">
          Toplu Ekle (CSV) →
        </Link>
      </div>

      <Link
        href="/dashboard/etiket-siparis"
        className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-4 hover:bg-brand-50"
      >
        <div>
          <p className="text-sm font-semibold text-brand-700">Dayanıklı QR Etiket Sipariş Et</p>
          <p className="text-xs text-brand-600/80">
            Motor bölmesine dayanıklı, su geçirmez profesyonel etiket — kapınıza gelsin.
          </p>
        </div>
        <span className="text-brand-600">→</span>
      </Link>

      {todaysAppointments.length > 0 && (
        <Link
          href="/dashboard/randevular"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-brand-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Bugün {todaysAppointments.length} randevunuz var
              </p>
              <p className="text-xs text-slate-500">
                {todaysAppointments
                  .slice(0, 3)
                  .map((a) => `${a.time}${a.plateDisplay ? ` · ${a.plateDisplay}` : ""}`)
                  .join(" · ")}
                {todaysAppointments.length > 3 ? " · ..." : ""}
              </p>
            </div>
          </div>
          <span className="text-brand-600">→</span>
        </Link>
      )}

      <VehicleListSection
        shopId={shopId}
        initialVehicles={vehicles}
        upcomingCount={upcoming.length}
        planLabel={limit?.label ?? null}
        maxVehicles={limit?.maxVehicles ?? null}
      >
        {shopId && (
          <div className="mt-6">
            <PlateSearch currentShopId={shopId} />
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Yaklaşan Bakımlar</h2>
              <Link href="/dashboard/hatirlatmalar" className="text-xs font-medium text-brand-600 hover:underline">
                Tümünü gör →
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {upcoming.map(({ vehicle, record, daysUntil, kmRemaining, reminderStatus }) => {
                const whatsAppLink = vehicle.ownerPhone
                  ? buildWhatsAppLink(vehicle.ownerPhone, buildReminderMessage(vehicle, record))
                  : null;
                return (
                  <div
                    key={vehicle.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 border-amber-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        {daysUntil !== null && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dateBadge(daysUntil).className}`}
                          >
                            {dateBadge(daysUntil).text}
                          </span>
                        )}
                        {kmRemaining !== null && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${kmBadge(kmRemaining).className}`}
                          >
                            {kmBadge(kmRemaining).text}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/araclar/${vehicle.id}`}
                          className="font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {vehicle.plateDisplay}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {vehicle.brand} {vehicle.model}
                          {record.nextServiceDate ? ` · önerilen: ${record.nextServiceDate}` : ""}
                          {record.nextServiceKm ? ` · ${record.nextServiceKm.toLocaleString("tr-TR")} km` : ""}
                        </p>
                        {reminderStatus && (
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${reminderStatus.className}`}
                          >
                            {reminderStatus.text}
                          </span>
                        )}
                      </div>
                    </div>
                    {whatsAppLink && (
                      <WhatsAppReminderButton vehicleId={vehicle.id} whatsAppLink={whatsAppLink} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </VehicleListSection>
    </div>
  );
}
