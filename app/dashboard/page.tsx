import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import {
  getReminderLogEntry,
  getShopById,
  getTodayActivitySummary,
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
import IconBadge from "@/components/IconBadge";
import { CalendarIcon, DownloadIcon, PlusIcon, StickerIcon, UploadIcon, WarningIcon } from "@/components/icons";

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
  const todayActivity = shopId ? await getTodayActivitySummary(shopId) : { newVehicles: 0, oilRecords: 0 };

  const greeting = getTimeGreeting();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments
    .filter((a) => a.date === todayISO && a.status === "bekliyor")
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  // Gecikmiş bakımları (tarih ya da km hedefi geçilmiş) yaklaşanlardan ayırıyoruz —
  // aynı listede karışınca en acil olanı kaçırmak kolaylaşıyordu, artık ayrı ve
  // en üstte, kırmızı bir bölümde gösteriliyor.
  const overdue = upcoming.filter(
    (u) => (u.daysUntil !== null && u.daysUntil < 0) || (u.kmRemaining !== null && u.kmRemaining < 0)
  );
  const dueSoon = upcoming.filter((u) => !overdue.includes(u));

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
        {/* "Bugün ne yaptım" özet şeridi — küçük ama gün içinde panelin bir işe
            yaradığı hissini güçlendiriyor. */}
        <div className="relative mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">
            Bugün {todayActivity.newVehicles} yeni araç
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1">
            Bugün {todayActivity.oilRecords} bakım kaydı
          </span>
        </div>
      </div>

      {/* Gecikmiş bakımlar — tarih ya da km hedefi geçilmiş kayıtlar, en acil
          olanı kaçırmamak için ayrı ve en üstte, kırmızı vurgulu. */}
      {overdue.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <IconBadge icon={<WarningIcon />} color="red" size="sm" />
            <h2 className="text-sm font-bold text-red-800">
              {overdue.length} aracın bakım zamanı geçti
            </h2>
          </div>
          <div className="mt-3 space-y-2">
            {overdue.map(({ vehicle, record, daysUntil, kmRemaining, reminderStatus }) => {
              const whatsAppLink = vehicle.ownerPhone
                ? buildWhatsAppLink(vehicle.ownerPhone, buildReminderMessage(vehicle, record))
                : null;
              return (
                <div
                  key={vehicle.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      {daysUntil !== null && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dateBadge(daysUntil).className}`}>
                          {dateBadge(daysUntil).text}
                        </span>
                      )}
                      {kmRemaining !== null && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${kmBadge(kmRemaining).className}`}>
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
                      </p>
                      {reminderStatus && (
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${reminderStatus.className}`}>
                          {reminderStatus.text}
                        </span>
                      )}
                    </div>
                  </div>
                  {whatsAppLink && <WhatsAppReminderButton vehicleId={vehicle.id} whatsAppLink={whatsAppLink} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hızlı işlemler — her biri isimli + renkli IconBadge ile: admin panelindeki
          "beyaz ikon, renkli kutucuk" görsel diliyle tutarlı (bkz. components/IconBadge).
          V2 madde 13: Henüz hiç aracı olmayan yeni kullanıcı için "Toplu Ekle (CSV)"
          ve "Verimi İndir (CSV)" birincil aksiyon olarak gösterilmiyor — fonksiyonlar
          silinmedi, ilk araç eklenir eklenmez (vehicles.length > 0) normal şekilde
          tekrar görünürler. Yeni kullanıcının tek birincil aksiyonu "Yeni Araç Ekle". */}
      <div className={`mt-4 grid grid-cols-2 gap-3 ${vehicles.length > 0 ? "sm:grid-cols-4" : ""}`}>
        <Link
          href="/dashboard/araclar/yeni"
          className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100 hover:ring-brand-300 sm:flex-row sm:text-left"
        >
          <IconBadge icon={<PlusIcon />} color="brand" size="md" />
          <span className="text-sm font-semibold text-slate-900">Yeni Araç Ekle</span>
        </Link>
        <QrScanner />
        {vehicles.length > 0 && (
          <>
            <Link
              href="/dashboard/araclar/toplu-ekle"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100 hover:ring-indigo-300 sm:flex-row sm:text-left"
            >
              <IconBadge icon={<UploadIcon />} color="indigo" size="md" />
              <span className="text-sm font-semibold text-slate-900">Toplu Ekle (CSV)</span>
            </Link>
            <a
              href="/api/shop/export"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100 hover:ring-green-300 sm:flex-row sm:text-left"
            >
              <IconBadge icon={<DownloadIcon />} color="green" size="md" />
              <span className="text-sm font-semibold text-slate-900">Verimi İndir (CSV)</span>
            </a>
          </>
        )}
      </div>

      <Link
        href="/dashboard/etiket-siparis"
        className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4 hover:bg-amber-50"
      >
        <div className="flex items-center gap-3">
          <IconBadge icon={<StickerIcon />} color="amber" size="md" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dayanıklı QR Etiket Sipariş Et</p>
            <p className="text-xs text-amber-700/80">
              Motor bölmesine dayanıklı, su geçirmez profesyonel etiket — kapınıza gelsin.
            </p>
          </div>
        </div>
        <span className="text-amber-600">→</span>
      </Link>

      {todaysAppointments.length > 0 && (
        <Link
          href="/dashboard/randevular"
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-brand-300"
        >
          <div className="flex items-center gap-3">
            <IconBadge icon={<CalendarIcon />} color="brand" size="md" />
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

        {dueSoon.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Yaklaşan Bakımlar</h2>
              <Link href="/dashboard/hatirlatmalar" className="text-xs font-medium text-brand-600 hover:underline">
                Tümünü gör →
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {dueSoon.map(({ vehicle, record, daysUntil, kmRemaining, reminderStatus }) => {
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
