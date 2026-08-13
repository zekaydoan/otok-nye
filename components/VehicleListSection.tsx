"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { CarIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/types";

const PENDING_VEHICLE_KEY = "otoKunyeYeniArac";

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

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_VEHICLE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_VEHICLE_KEY);
      const pending = JSON.parse(raw) as Vehicle;
      setVehicles((prev) => (prev.some((v) => v.id === pending.id) ? prev : [pending, ...prev]));
    } catch {
    }
  }, []);

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
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-7" />
              </svg>
            }
          />
        )}
      </div>

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
    </>
  );
}
