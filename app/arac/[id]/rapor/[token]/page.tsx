import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleById, listOilRecordsForVehicle } from "@/lib/blobStore";
import { checkKmConsistency, computeMaintenanceScore } from "@/lib/maintenance";
import ScoreBadge from "@/components/ScoreBadge";
import Logo from "@/components/Logo";
import { WarningIcon } from "@/components/icons";

export const metadata = {
  title: "Araç Satış Raporu",
};

// Bayinin panelden bilinçli olarak oluşturup paylaştığı, girişsiz erişilebilen tam
// detaylı satış/güven raporu. Fiziksel QR etiketinin (/arac/[id]) aksine bu sayfa
// yalnızca doğru token'e sahip kişilerle paylaşılır — arama motorlarında indekslenmez.
export default async function VehicleReportPage({
  params,
}: {
  params: { id: string; token: string };
}) {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle || !vehicle.reportToken || vehicle.reportToken !== params.token) notFound();

  const records = await listOilRecordsForVehicle(vehicle.id);
  const kmIssues = checkKmConsistency(records);
  const score = computeMaintenanceScore(records);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10 print:bg-white">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 text-brand-700">
          <Logo size="sm" />
          <span className="text-sm font-semibold">Araç Satış Raporu</span>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900">{vehicle.plateDisplay}</h1>
            <ScoreBadge tier={score.tier} label={score.label} />
          </div>
          <p className="mt-1 text-lg text-slate-600">
            {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-400">Toplam Bakım Kaydı</p>
              <p className="font-semibold text-slate-900">{records.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Zamanında Bakım Oranı</p>
              <p className="font-semibold text-slate-900">
                {score.onTimeRatio !== null ? `%${Math.round(score.onTimeRatio * 100)}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Km Tutarlılığı</p>
              <p className={`font-semibold ${kmIssues.length > 0 ? "text-red-600" : "text-green-600"}`}>
                {kmIssues.length > 0 ? `${kmIssues.length} uyarı` : "Sorun yok"}
              </p>
            </div>
          </div>

          {kmIssues.length > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              {kmIssues
                .map(
                  (i) =>
                    `${i.previousDate} tarihinde ${i.previousKm} km iken, ${i.date} tarihinde ${i.km} km girilmiş.`
                )
                .join(" ")}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">Bakım Geçmişi</h2>
          {records.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Kayıt bulunmuyor.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {records.map((r) => (
                <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {r.date} · {r.time}
                    </p>
                    <p className="text-sm font-medium text-brand-700">{r.quantityKg} kg</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {r.oilBrand} {r.oilModel}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                    {r.km && <span>{r.km} km</span>}
                    {r.filterChanged && <span>Yağ filtresi değişti</span>}
                    <span>{r.shopName}</span>
                  </div>
                  {r.note && <p className="mt-2 text-xs text-slate-400">Not: {r.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 print:hidden">
          Bu, aracın sahibi/yetkili servisi tarafından oluşturulmuş özel bir paylaşım
          bağlantısıdır.{" "}
          <Link href="/" className="underline">
            OtoHafıza
          </Link>{" "}
          ile otomatik oluşturulmuştur.
        </p>
      </div>
    </main>
  );
}
