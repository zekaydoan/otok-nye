import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import { listUpcomingServicesForShop } from "@/lib/blobStore";
import { buildReminderMessage } from "@/lib/maintenance";
import { buildWhatsAppLink } from "@/lib/whatsapp";

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

// Dashboard'daki "Yaklaşan Bakımlar" widget'ı yalnızca en yakın 14 gün / 500 km
// içindekileri gösterir (özet amaçlı). Bu sayfa toplu hatırlatma göndermek için
// çok daha geniş bir pencere (30 gün / 1500 km) kullanır — ustanın telefonu olan
// tüm müşterilerine tek tek WhatsApp linkiyle ulaşabilmesi için.
export default async function RemindersPage() {
  const shopId = await getCurrentShopId();
  const upcoming = shopId ? await listUpcomingServicesForShop(shopId, 30, 1500) : [];

  const withPhone = upcoming.filter((u) => u.vehicle.ownerPhone);
  const withoutPhone = upcoming.filter((u) => !u.vehicle.ownerPhone);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-brand-600">
        ← Araçlarım
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Toplu Hatırlatmalar</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bakım tarihi veya kilometresi yaklaşan tüm araçlar (30 gün / 1500 km içinde).
        Her biri için ayrı ayrı WhatsApp mesajı gönderebilirsiniz.
      </p>

      {upcoming.length === 0 ? (
        <div className="mt-10 rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Yaklaşan bakımı olan araç bulunmuyor.</p>
        </div>
      ) : (
        <>
          {withPhone.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-700">
                Telefonu Kayıtlı ({withPhone.length})
              </h2>
              <div className="mt-2 space-y-2">
                {withPhone.map(({ vehicle, record, daysUntil, kmRemaining }) => {
                  const whatsAppLink = buildWhatsAppLink(
                    vehicle.ownerPhone!,
                    buildReminderMessage(vehicle, record)
                  );
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
                            {vehicle.ownerName ? ` · ${vehicle.ownerName}` : ""}
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

          {withoutPhone.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-700">
                Telefonu Kayıtlı Değil ({withoutPhone.length})
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Bu araçlara WhatsApp gönderilemiyor — sahibinin telefonunu araç
                sayfasından ekleyebilirsiniz.
              </p>
              <div className="mt-2 space-y-2">
                {withoutPhone.map(({ vehicle, daysUntil, kmRemaining }) => (
                  <div
                    key={vehicle.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border-l-4 border-slate-300 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                  >
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
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
