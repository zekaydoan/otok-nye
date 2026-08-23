import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import { getVehicleById, listOilRecordsForVehicle } from "@/lib/blobStore";
import { checkKmConsistency, computeMaintenanceScore } from "@/lib/maintenance";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import ScoreBadge from "@/components/ScoreBadge";
import Logo from "@/components/Logo";
import { WarningIcon } from "@/components/icons";
import WhatsappOptOutToggle from "@/components/WhatsappOptOutToggle";
import DataRequestForm from "@/components/DataRequestForm";

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
            {/* V2 Paket 3 madde 1: "Yeterli Veri Yok" rozeti kaldırıldı, yerine
                yeni bir durum sistemi eklenmedi — bakım kaydı olsun olmasın bu
                ifadeye ihtiyaç yok. */}
            {score.tier !== "insufficient" && <ScoreBadge tier={score.tier} label={score.label} />}
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

          {/* V2 Paket 3: QR'ı okutan araç sahibi giriş yapmadan da bakım
              geçmişini görebilsin diye "üyelere özel" kilidi bu görünümden
              kaldırıldı (bkz. kullanıcı talimatı). Ad/telefon/e-posta/adres gibi
              kişisel veriler zaten burada hiç gösterilmiyordu (araç sahibi
              bilgisi bu sayfada yer almaz) — yalnızca aracın kendi bakım
              verileri ve servisin (işletmenin) kendi iş bilgisi açılıyor. */}
          {last ? (
            <div className="mt-4 rounded-xl bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-700">Son Bakım</p>
              <p className="mt-1 text-sm text-slate-700">
                {last.date} {last.time} tarihinde <strong>{last.oilBrand} {last.oilModel}</strong>{" "}
                yağından <strong>{last.quantityKg} L</strong> konuldu.
                {last.km ? ` (${last.km} km)` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Bakımı yapan servis</p>
                  <p className="text-sm font-semibold text-slate-800">{last.shopName}</p>
                </div>
                {/* V2 Paket 3 madde 5: WhatsApp butonu yalnızca bu bakım kaydını
                    OLUŞTURAN servisin kendi kayıtlı işletme telefonuna
                    (last.shopPhone — kayıt oluşturulurken shop.phone'dan
                    kopyalanır, bkz. app/api/vehicles/[id]/records/route.ts)
                    yönlenir. Araç sahibi telefonu veya genel sistem numarası
                    KULLANILMAZ. Telefon yoksa/eşleşmiyorsa buton hiç gösterilmez. */}
                {(() => {
                  const shopWhatsAppLink = last.shopPhone
                    ? buildWhatsAppLink(
                        last.shopPhone,
                        `Merhaba, ${vehicle.plateDisplay} plakalı aracım hakkında bilgi almak istiyorum.`
                      )
                    : null;
                  return shopWhatsAppLink ? (
                    <a
                      href={shopWhatsAppLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                    >
                      WhatsApp'tan Ulaş
                    </a>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Henüz kayıtlı bir bakım kaydı yok.</p>
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
                    <p className="text-sm font-medium text-brand-700">{r.quantityKg} L</p>
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

        {/* V2 Paket 3 madde 6: Servis girişi artık büyük bir blok değil, sayfa
            akışını bozmayan sade ikincil bir bağlantı — ana içerik araç
            sahibi/müşteri için olan bakım bilgisi. Fonksiyon kaldırılmadı. */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Servis misiniz?{" "}
          <Link href="/giris" className="font-semibold text-brand-600">
            Yetkili giriş →
          </Link>
        </p>

        {vehicle.ownerPhone && (
          <WhatsappOptOutToggle vehicleId={vehicle.id} initialOptOut={!!vehicle.whatsappOptOut} />
        )}
        <DataRequestForm vehicleId={vehicle.id} />

        <p className="mt-8 text-center text-xs text-slate-400">
          Bu sayfa <Link href="/" className="underline">OtoHafıza</Link> ile otomatik oluşturulmuştur.
        </p>
      </div>
    </main>
  );
}
