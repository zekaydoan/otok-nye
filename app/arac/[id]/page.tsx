import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import { getVehicleById, listOilRecordsForVehicle } from "@/lib/blobStore";
import { checkKmConsistency, computeMaintenanceScore } from "@/lib/maintenance";
import ScoreBadge from "@/components/ScoreBadge";
import Logo from "@/components/Logo";
import { LockIcon, WarningIcon } from "@/components/icons";

export default async function PublicVehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();
  const records = await listOilRecordsForVehicle(vehicle.id);
  const last = records[0];
  const kmIssues = checkKmConsistency(records);
  const score = computeMaintenanceScore(records);

  const shopId = await getCurrentShopId();
  const isMember = !!shopId; // giriş yapmış herhangi bir bayi/usta

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Logo withText />

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Araç</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900">{vehicle.plateDisplay}</h1>
            <ScoreBadge tier={score.tier} label={score.label} />
          </div>
          <p className="mt-1 text-lg text-slate-600">
            {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}
          </p>

          {kmIssues.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>Bu araçta kilometre tutarsızlığı tespit edildi.
              {isMember && (
                <>
                  {" "}
                  {kmIssues
                    .map(
                      (i) =>
                        `${i.previousDate} tarihinde ${i.previousKm} km iken, ${i.date} tarihinde ${i.km} km girilmiş.`
                    )
                    .join(" ")}
                </>
              )}
              </span>
            </div>
          )}

          {last ? (
            isMember ? (
              <div className="mt-4 rounded-xl bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-700">Son Yağ Bakımı</p>
                <p className="mt-1 text-sm text-slate-700">
                  {last.date} {last.time} tarihinde <strong>{last.oilBrand} {last.oilModel}</strong>{" "}
                  yağından <strong>{last.quantityKg} kg</strong> konuldu.
                  {last.km ? ` (${last.km} km)` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">Servis: {last.shopName}</p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-700">Son Bakım Tarihi: {last.date}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Bu araç için toplam {records.length} bakım kaydı var.
                </p>
              </div>
            )
          ) : (
            <p className="mt-4 text-sm text-slate-500">Henüz kayıtlı bir yağ bakımı yok.</p>
          )}
        </div>

        {isMember ? (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-900">Yağ Bakım Geçmişi</h2>
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
                    {r.nextServiceDate && (
                      <p className="mt-1 text-xs text-brand-600">
                        Sonraki bakım önerisi: {r.nextServiceDate}
                        {r.nextServiceKm ? ` · ${r.nextServiceKm} km` : ""}
                      </p>
                    )}
                    {(r.hasBeforePhoto || r.hasAfterPhoto) && (
                      <div className="mt-2 flex gap-2">
                        {r.hasBeforePhoto && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/photos/${r.id}/before`}
                            alt="Öncesi"
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        )}
                        {r.hasAfterPhoto && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/photos/${r.id}/after`}
                            alt="Sonrası"
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        )}
                      </div>
                    )}
                    {r.note && <p className="mt-2 text-xs text-slate-400">Not: {r.note}</p>}
                    <a
                      href={`/api/vehicles/${vehicle.id}/records/${r.id}/pdf`}
                      target="_blank"
                      className="mt-2 inline-block text-xs font-medium text-brand-600 underline"
                    >
                      Servis fişini PDF olarak görüntüle
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          records.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <LockIcon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Tüm bakım geçmişi üyelere özeldir
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Yağ markası/modeli, kilometre, servis notları, fotoğraflar ve servis fişleri
                dahil {records.length} kaydın tamamını görmek için Oto Künye'ye giriş
                yapmanız gerekir.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/giris"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Ücretsiz Üye Ol
                </Link>
              </div>
            </div>
          )
        )}

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
          <p className="text-sm text-slate-600">Bu aracın bakımını mı yaptınız?</p>
          <Link href="/giris" className="mt-2 inline-block font-semibold text-brand-600">
            Yetkili girişi yapıp yeni kayıt ekleyin →
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Bu sayfa <Link href="/" className="underline">Oto Künye</Link> ile otomatik oluşturulmuştur.
        </p>
      </div>
    </main>
  );
}
