"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildReminderMessage,
  checkKmConsistency,
  computeMaintenanceScore,
} from "@/lib/maintenance";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { recordRecentVehicle } from "@/lib/recentVehicles";
import type { ReminderStatusDisplay } from "@/lib/whatsappReminder";
import AddOilRecordForm from "@/components/AddOilRecordForm";
import ShareReportButton from "@/components/ShareReportButton";
import ScoreBadge from "@/components/ScoreBadge";
import EmptyState from "@/components/EmptyState";
import VehicleKmUpdate from "@/components/VehicleKmUpdate";
import WhatsAppReminderButton from "@/components/WhatsAppReminderButton";
import IconBadge from "@/components/IconBadge";
import { CarIcon, CheckIcon, DocumentIcon, PencilIcon, QrIcon, WarningIcon } from "@/components/icons";
import type { FavoriteOil, OilRecord, Vehicle } from "@/lib/types";

export default function VehicleDetailView({
  vehicle,
  initialRecords,
  isOwnVehicle,
  creatorShopName,
  favoriteOils,
  plakaGuncellendi,
  reminderStatus,
  shopId,
}: {
  vehicle: Vehicle;
  initialRecords: OilRecord[];
  isOwnVehicle: boolean;
  creatorShopName?: string | null;
  favoriteOils: FavoriteOil[];
  plakaGuncellendi?: boolean;
  reminderStatus?: ReminderStatusDisplay | null;
  shopId: string | null;
}) {
  const [records, setRecords] = useState<OilRecord[]>(initialRecords);
  // "Güncel Km" widget'ının (bkz. VehicleKmUpdate) sunucuya yazdığı güncellemeyi
  // sayfa yenilenmeden burada da yansıtabilmek için (ör. "Sonraki Bakım" altındaki
  // "X km kaldı" etiketi) ayrı bir state olarak tutuyoruz.
  const [currentKm, setCurrentKm] = useState<number | undefined>(vehicle.lastKnownKm);
  // V2: Bu aracın İLK bakım kaydı başarıyla eklendiğinde bir kereye mahsus
  // gösterilen başarı bilgisi (Zeki'nin V2 talebi madde 12) — "sürekli popup"
  // değil, kayıt listesinin üzerinde sade bir banner; kullanıcı kapatabilir.
  const [firstRecordSuccess, setFirstRecordSuccess] = useState<OilRecord | null>(null);

  const latest = records[0];
  const kmRemaining =
    latest?.nextServiceKm && typeof currentKm === "number" ? latest.nextServiceKm - currentKm : null;
  const kmIssues = useMemo(() => checkKmConsistency(records), [records]);
  const score = useMemo(() => computeMaintenanceScore(records), [records]);
  const kmIssueRecordIds = useMemo(() => new Set(kmIssues.map((i) => i.recordId)), [kmIssues]);

  const whatsAppLink =
    vehicle.ownerPhone && latest?.nextServiceDate
      ? buildWhatsAppLink(vehicle.ownerPhone, buildReminderMessage(vehicle, latest))
      : null;

  // Dashboard'daki "Son görüntülediğiniz araçlar" şeridi için (bkz. lib/recentVehicles.ts) —
  // bu sayfa her açıldığında aracı tarayıcının localStorage'ındaki son-görüntülenen
  // listesinin başına taşır.
  useEffect(() => {
    recordRecentVehicle(shopId, {
      id: vehicle.id,
      plateDisplay: vehicle.plateDisplay,
      brand: vehicle.brand,
      model: vehicle.model,
    });
  }, [shopId, vehicle.id, vehicle.plateDisplay, vehicle.brand, vehicle.model]);

  function handleRecordCreated(record: OilRecord) {
    // V2 madde 12: Bu, aracın kayıt listesine eklenen İLK kayıtsa (records o an
    // boşsa) bir kereye mahsus başarı bandı gösteriyoruz. records state'i henüz
    // güncellenmeden önceki uzunluğuna bakmamız gerekiyor.
    const isFirstEver = records.length === 0;

    setRecords((prev) => {
      if (prev.some((r) => r.id === record.id)) return prev;
      return [record, ...prev];
    });

    if (isFirstEver) {
      setFirstRecordSuccess(record);
    }

    try {
      sessionStorage.setItem("otoHafizaYeniArac", JSON.stringify(vehicle));
    } catch {
    }
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-brand-600">
        ← Araçlarım
      </Link>

      {plakaGuncellendi && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border-l-4 border-brand-400 bg-brand-50 p-3 text-sm text-brand-800">
          <span className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" />
            Plaka güncellendi. Fiziksel etiket eski plakayı gösteriyor olabilir.
          </span>
          <Link
            href={`/dashboard/araclar/${vehicle.id}/etiket`}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            <QrIcon className="h-3.5 w-3.5" />
            Yeni Etiket Yazdır
          </Link>
        </div>
      )}

      {!isOwnVehicle && (
        <div className="mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-800">
          Bu araç sisteme <strong>{creatorShopName || "başka bir bayi"}</strong>{" "}
          tarafından eklenmiş. Bakım geçmişi paylaşımlıdır — siz de bu araca bakım
          kaydı ekleyebilirsiniz, kaydınız aracın kalıcı defterine işlenir.
        </div>
      )}

      {kmIssues.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border-l-4 border-red-400 bg-red-50 p-3 text-sm text-red-800">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>
            <strong>Kilometre tutarsızlığı tespit edildi:</strong>{" "}
            {kmIssues
              .map(
                (i) =>
                  `${i.previousDate} tarihinde ${i.previousKm} km iken, ${i.date} tarihinde ${i.km} km girilmiş`
              )
              .join("; ")}
            . Bu, olası bir kilometre düşürme göstergesi olabilir.
          </span>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex shrink-0 overflow-hidden rounded-lg border-2 border-slate-900">
            <div className="flex items-center bg-brand-700 px-1.5 py-2">
              <span className="text-[9px] font-bold leading-none text-white">TR</span>
            </div>
            <div className="bg-white px-3 py-1.5">
              <span className="text-xl font-extrabold tracking-wide text-slate-900 sm:text-2xl">
                {vehicle.plateDisplay}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold text-slate-900">
                {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}
              </p>
              {/* V2: "Yeterli Veri Yok" rozeti kaldırıldı — henüz yeterli bakım
                  geçmişi olmayan bir araçta hiçbir rozet göstermiyoruz (bkz.
                  lib/maintenance.ts computeMaintenanceScore "insufficient" tier).
                  Yerine yeni bir durum sistemi bilinçli olarak EKLENMEDİ. */}
              {score.tier !== "insufficient" && <ScoreBadge tier={score.tier} label={score.label} />}
            </div>
            {vehicle.ownerName && (
              <p className="mt-1 text-sm text-slate-400">
                Sahibi: {vehicle.ownerName} {vehicle.ownerPhone ? `· ${vehicle.ownerPhone}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-center sm:grid-cols-4 sm:text-left">
          <div>
            <p className="text-xs text-slate-400">Toplam Kayıt</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{records.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Son Bakım</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{latest?.date || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Sonraki Bakım</p>
            <p className="mt-0.5 text-lg font-bold text-brand-700">
              {latest?.nextServiceDate || "—"}
            </p>
            {kmRemaining !== null && (
              <p className="mt-0.5 text-xs text-slate-400">
                {kmRemaining >= 0
                  ? `${kmRemaining.toLocaleString("tr-TR")} km kaldı`
                  : `${Math.abs(kmRemaining).toLocaleString("tr-TR")} km geçti`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <VehicleKmUpdate
              vehicleId={vehicle.id}
              initialKm={vehicle.lastKnownKm}
              onUpdated={(v) => setCurrentKm(v.lastKnownKm)}
            />
          </div>
        </div>

        {/* Eylem butonları — dashboard ve admin panelindeki "isim + renkli IconBadge"
            görsel diliyle tutarlı (bkz. components/IconBadge). */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:flex sm:flex-wrap">
          <Link
            href={`/dashboard/araclar/${vehicle.id}/duzenle`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconBadge icon={<PencilIcon />} color="amber" size="sm" />
            Düzenle
          </Link>
          {/* V2 madde 14: "Satış Raporu Oluştur" bakım kaydı olmayan bir araçta
              anlamsız (rapor gösterecek verisi yok) — özellik silinmedi, sadece
              ilk kayıt eklenene kadar gizlendi. */}
          {records.length > 0 && <ShareReportButton vehicleId={vehicle.id} />}
          <Link
            href={`/dashboard/araclar/${vehicle.id}/etiket`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconBadge icon={<QrIcon />} color="brand" size="sm" />
            QR Etiketi Yazdır
          </Link>
          <Link
            href={`/arac/${vehicle.id}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconBadge icon={<CarIcon />} color="indigo" size="sm" />
            Genel Görünüm
          </Link>
        </div>
      </div>

      {vehicle.ownerPhone && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <span className="text-sm font-medium text-slate-700">Bakım Hatırlatması:</span>
          {whatsAppLink && <WhatsAppReminderButton vehicleId={vehicle.id} whatsAppLink={whatsAppLink} />}
          {reminderStatus && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${reminderStatus.className}`}
            >
              {reminderStatus.text}
            </span>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Bakım Geçmişi</h2>
          <AddOilRecordForm
            vehicleId={vehicle.id}
            hasOwnerPhone={!!vehicle.ownerPhone}
            favoriteOils={favoriteOils}
            onCreated={handleRecordCreated}
            isFirstRecord={records.length === 0}
          />
        </div>

        {/* V2 madde 12: İlk bakım kaydı eklendiğinde bir kereye mahsus gösterilen
            sade başarı bandı — sürekli popup değil, records.length arttığı anda
            (yani firstRecordSuccess set edildiğinde) burada belirir, kullanıcı
            kapatabilir. */}
        {firstRecordSuccess && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-lg border-l-4 border-green-400 bg-green-50 p-3 text-sm text-green-800">
            <span className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>
                <strong>İlk bakım kaydedildi.</strong> OtoHafıza bu aracın bir sonraki
                bakımını takip edecek.
                {(firstRecordSuccess.nextServiceDate || firstRecordSuccess.nextServiceKm) && (
                  <>
                    {" "}
                    Sonraki bakım: {firstRecordSuccess.nextServiceDate || ""}
                    {firstRecordSuccess.nextServiceKm
                      ? ` · ${firstRecordSuccess.nextServiceKm.toLocaleString("tr-TR")} km`
                      : ""}
                  </>
                )}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setFirstRecordSuccess(null)}
              className="shrink-0 text-xs font-medium text-green-700 hover:text-green-900"
            >
              Kapat
            </button>
          </div>
        )}

        {records.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<DocumentIcon className="h-6 w-6" />}
              title="Şimdi ilk bakım kaydını ekleyin."
              description="Bakım kaydından sonra OtoHafıza bir sonraki bakım zamanını takip etmeye başlayacak."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 md:hidden">
              {records.map((r, idx) => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex w-3 shrink-0 flex-col items-center">
                    <span
                      className={`mt-5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-50 ${
                        kmIssueRecordIds.has(r.id) ? "bg-red-500" : "bg-brand-500"
                      }`}
                    />
                    {idx < records.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div
                      className={`rounded-xl p-4 shadow-sm ring-1 ${
                        kmIssueRecordIds.has(r.id)
                          ? "bg-red-50 ring-red-100"
                          : "bg-white ring-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">
                          {r.date} · {r.time}
                        </p>
                        <p className="text-sm font-medium text-brand-700">{r.quantityKg} L</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">
                        {r.oilBrand} {r.oilModel}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        {r.km && (
                          <span>
                            {r.km} km
                            {kmIssueRecordIds.has(r.id) && (
                              <WarningIcon
                                className="ml-1 inline h-3.5 w-3.5 text-red-500"
                                title="Km tutarsızlığı"
                              />
                            )}
                          </span>
                        )}
                        <span>{r.shopName}</span>
                      </div>
                      {r.nextServiceDate && (
                        <p className="mt-1 text-xs text-brand-600">
                          Sonraki bakım: {r.nextServiceDate}
                          {r.nextServiceKm ? ` · ${r.nextServiceKm} km` : ""}
                        </p>
                      )}
                      {(r.hasBeforePhoto || r.hasAfterPhoto) && (
                        <div className="mt-2 flex gap-2">
                          {r.hasBeforePhoto && (
                            <img
                              src={`/api/photos/${r.id}/before`}
                              alt="Öncesi"
                              className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                          )}
                          {r.hasAfterPhoto && (
                            <img
                              src={`/api/photos/${r.id}/after`}
                              alt="Sonrası"
                              className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                          )}
                        </div>
                      )}
                      <a
                        href={`/api/vehicles/${vehicle.id}/records/${r.id}/pdf`}
                        target="_blank"
                        className="mt-2 inline-block text-xs font-medium text-brand-600 underline"
                      >
                        Servis fişini PDF olarak görüntüle
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tarih / Saat</th>
                    <th className="px-4 py-3 font-medium">Yağ</th>
                    <th className="px-4 py-3 font-medium">Miktar</th>
                    <th className="px-4 py-3 font-medium">Km</th>
                    <th className="px-4 py-3 font-medium">Sonraki Bakım</th>
                    <th className="px-4 py-3 font-medium">Fotoğraf</th>
                    <th className="px-4 py-3 font-medium">Servis</th>
                    <th className="px-4 py-3 font-medium">Fiş</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      className={`transition-colors hover:bg-slate-50 ${
                        kmIssueRecordIds.has(r.id) ? "bg-red-50 hover:bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {r.date} {r.time}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.oilBrand} {r.oilModel}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.quantityKg} L</td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.km ? `${r.km} km` : "-"}
                        {kmIssueRecordIds.has(r.id) && (
                          <WarningIcon className="ml-1 inline h-3.5 w-3.5 text-red-500" title="Km tutarsızlığı" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.nextServiceDate || "-"}
                        {r.nextServiceKm ? ` (${r.nextServiceKm} km)` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {r.hasBeforePhoto && (
                            <img
                              src={`/api/photos/${r.id}/before`}
                              alt="Öncesi"
                              className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                            />
                          )}
                          {r.hasAfterPhoto && (
                            <img
                              src={`/api/photos/${r.id}/after`}
                              alt="Sonrası"
                              className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                            />
                          )}
                          {!r.hasBeforePhoto && !r.hasAfterPhoto && (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.shopName}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/api/vehicles/${vehicle.id}/records/${r.id}/pdf`}
                          target="_blank"
                          className="text-xs font-medium text-brand-600 underline"
                        >
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
