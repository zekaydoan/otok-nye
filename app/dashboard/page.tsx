import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, listUpcomingServicesForShop, listVehiclesByShop } from "@/lib/blobStore";
import { buildReminderMessage } from "@/lib/maintenance";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getTimeGreeting } from "@/lib/greeting";
import { PLAN_LIMITS } from "@/lib/types";
import PlateSearch from "@/components/PlateSearch";
import QrScanner from "@/components/QrScanner";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { CarIcon } from "@/components/icons";

function dueBadge(daysUntil: number): { text: string; className: string } {
  if (daysUntil < 0) {
    return { text: `${Math.abs(daysUntil)} gün gecikti`, className: "bg-red-100 text-red-700" };
  }
  if (daysUntil === 0) {
    return { text: "Bugün", className: "bg-amber-100 text-amber-700" };
  }
  return { text: `${daysUntil} gün kaldı`, className: "bg-brand-50 text-brand-700" };
}

export default async function DashboardPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  const vehicles = shopId ? await listVehiclesByShop(shopId) : [];
  const upcoming = shopId ? await listUpcomingServicesForShop(shopId, 14) : [];
  const limit = shop ? PLAN_LIMITS[shop.plan] : null;

  const greeting = getTimeGreeting();

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

      {/* Tüm listeleri taramadan önce hızlı bir genel bakış */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Toplam Araç"
          value={vehicles.length}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13M5 13h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
              />
              <circle cx="7.5" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="16.5" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          }
        />
        <StatCard
          label="Yaklaşan Bakım"
          value={upcoming.length}
          tone={upcoming.length > 0 ? "warning" : "default"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        {limit && (
          <StatCard
            label={`${limit.label} Plan Kullanımı`}
            value={limit.maxVehicles === Infinity ? "Sınırsız" : `${vehicles.length}/${limit.maxVehicles}`}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-7" />
              </svg>
            }
          />
        )}
      </div>

      {shopId && (
        <div className="mt-6">
          <PlateSearch currentShopId={shopId} />
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">Yaklaşan Bakımlar</h2>
          <div className="mt-3 space-y-2">
            {upcoming.map(({ vehicle, record, daysUntil }) => {
              const badge = dueBadge(daysUntil);
              const whatsAppLink = vehicle.ownerPhone
                ? buildWhatsAppLink(vehicle.ownerPhone, buildReminderMessage(vehicle, record))
                : null;
              return (
                <div
                  key={vehicle.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 border-amber-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.text}
                    </span>
                    <div>
                      <Link
                        href={`/dashboard/araclar/${vehicle.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-700"
                      >
                        {vehicle.plateDisplay}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {vehicle.brand} {vehicle.model} · önerilen: {record.nextServiceDate}
                      </p>
                    </div>
                  </div>
                  {whatsAppLink && (
                    <a
                      href={whatsAppLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      WhatsApp'tan Hatırlat
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<CarIcon className="h-6 w-6" />}
            title="Henüz araç eklemediniz"
            description="İlk aracınızı ekleyin, QR etiketini yazdırın ve bakım geçmişini otomatik tutmaya başlayın."
            actionHref="/dashboard/araclar/yeni"
            actionLabel="İlk aracınızı ekleyin"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/dashboard/araclar/${v.id}`}
              className="hover-lift rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-brand-300"
            >
              <div className="flex items-start justify-between">
                <p className="text-lg font-bold text-slate-900">{v.plateDisplay}</p>
                {v.createdByShopId !== shopId && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    başka bayi ekledi
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {v.brand} {v.model} {v.year ? `(${v.year})` : ""}
              </p>
              {v.ownerName && <p className="mt-2 text-xs text-slate-400">Sahibi: {v.ownerName}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
