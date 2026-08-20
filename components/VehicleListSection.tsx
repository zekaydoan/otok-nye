"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import RecentlyViewedVehicles from "@/components/RecentlyViewedVehicles";
import { CarIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/types";

type SortOption = "son" | "plaka" | "marka";

const PENDING_VEHICLE_KEY = "otoHafizaYeniArac";
// Toplu araç içe aktarma (bkz. app/dashboard/araclar/toplu-ekle) sonrasında eklenen
// araçların tümünü bu ayrı anahtar altında bir dizi olarak yazar — tekil ekleme akışı
// (PENDING_VEHICLE_KEY) tek bir nesne bekliyor, iki deseni karıştırmamak için ayrı
// tutuldu.
const PENDING_BULK_VEHICLES_KEY = "otoHafizaTopluArac";

export default function VehicleListSection({
  shopId,
  initialVehicles,
  upcomingCount,
  planLabel,
  maxVehicles,
  children,
}: {
  shopId: string | null;
  initialVehicles: Vehicle[];
  upcomingCount: number;
  planLabel: string | null;
  maxVehicles: number | null;
  children?: ReactNode;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("son");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_VEHICLE_KEY);
      if (raw) {
        sessionStorage.removeItem(PENDING_VEHICLE_KEY);
        const pending = JSON.parse(raw) as Vehicle;
        setVehicles((prev) => (prev.some((v) => v.id === pending.id) ? prev : [pending, ...prev]));
      }
    } catch {
    }
    try {
      const rawBulk = sessionStorage.getItem(PENDING_BULK_VEHICLES_KEY);
      if (rawBulk) {
        sessionStorage.removeItem(PENDING_BULK_VEHICLES_KEY);
        const pendingBulk = JSON.parse(rawBulk) as Vehicle[];
        setVehicles((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const newOnes = pendingBulk.filter((v) => !existingIds.has(v.id));
          return [...newOnes, ...prev];
        });
      }
    } catch {
    }
  }, []);

  // Çok araçlı bayiler için plaka/marka/model/sahip adına göre serbest metin
  // arama + sıralama — sunucudan gelen liste zaten son etkileşime göre sıralı,
  // bu yalnızca istemci tarafında ek bir görünüm tercihi.
  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr-TR");
    let list = vehicles;
    if (term) {
      list = list.filter((v) =>
        [v.plateDisplay, v.plate, v.brand, v.model, v.ownerName ?? ""]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(term)
      );
    }
    if (sortBy === "plaka") {
      list = [...list].sort((a, b) => a.plateDisplay.localeCompare(b.plateDisplay, "tr-TR"));
    } else if (sortBy === "marka") {
      list = [...list].sort((a, b) => a.brand.localeCompare(b.brand, "tr-TR"));
    }
    return list;
  }, [vehicles, search, sortBy]);

  return (
    <>
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
          value={upcomingCount}
          tone={upcomingCount > 0 ? "warning" : "default"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        {planLabel && maxVehicles !== null && (
          <StatCard
            label={`${planLabel} Plan Kullanımı`}
            value={maxVehicles === Infinity ? "Sınırsız" : `${vehicles.length}/${maxVehicles}`}
            tone={
              maxVehicles !== Infinity && maxVehicles > 0 && vehicles.length / maxVehicles >= 0.8
                ? "warning"
                : "default"
            }
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-7" />
              </svg>
            }
          />
        )}
      </div>

      {/* Plan limiti yaklaşınca (>= %80) ya da dolunca proaktif bir yükseltme
          çağrısı — eskiden yalnızca limit dolduğunda araç ekleme formunda düz bir
          hata metni çıkıyordu, gelir fırsatını kaçıran sessiz bir an oluşturuyordu. */}
      {maxVehicles !== null && maxVehicles !== Infinity && maxVehicles > 0 && vehicles.length / maxVehicles >= 0.8 && (
        <Link
          href="/dashboard/plan"
          className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm ring-1 ring-amber-100 hover:bg-amber-100"
        >
          <span className="font-medium text-amber-800">
            {vehicles.length >= maxVehicles
              ? `${planLabel} plan limitinize ulaştınız (${vehicles.length}/${maxVehicles}).`
              : `${planLabel} plan limitinize yaklaşıyorsunuz (${vehicles.length}/${maxVehicles}).`}
          </span>
          <span className="font-semibold text-amber-700">Planı Yükselt →</span>
        </Link>
      )}

      <RecentlyViewedVehicles shopId={shopId} />

      {children}

      {vehicles.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<CarIcon className="h-6 w-6" />}
            title="Henüz araç eklemediniz"
            description="İlk araçınızı ekleyin, QR etiketini yazdırın ve bakım geçmişini otomatik tutmaya başlayın."
            actionHref="/dashboard/araclar/yeni"
            actionLabel="İlk araçınızı ekleyin"
          />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Plaka, marka, model veya sahip adıyla ara..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:max-w-xs"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:w-auto"
            >
              <option value="son">Son eklenen/işlem gören</option>
              <option value="plaka">Plakaya göre (A-Z)</option>
              <option value="marka">Markaya göre (A-Z)</option>
            </select>
          </div>

          {filteredVehicles.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              &quot;{search}&quot; ile eşleşen araç bulunamadı.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((v) => (
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
        </>
      )}
    </>
  );
}
