"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { CalendarIcon, CheckIcon } from "@/components/icons";
import EmptyState from "@/components/EmptyState";
import AppointmentForm from "@/components/AppointmentForm";
import { APPOINTMENT_STATUS_LABELS, type Appointment, type AppointmentStatus, type Vehicle } from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusBadgeClass(status: AppointmentStatus): string {
  if (status === "geldi") return "bg-green-100 text-green-700";
  if (status === "iptal") return "bg-slate-100 text-slate-500";
  return "bg-amber-100 text-amber-700";
}

// /dashboard/randevular sayfasının tamamını yöneten tek istemci bileşeni: hem
// randevu ekleme formunu hem de listeyi aynı state üzerinde tutar, böylece yeni
// eklenen bir randevu sunucudan yeniden okumayı beklemeden anında listede görünür
// (bkz. VehicleListSection'daki aynı optimistic update deseni).
export default function AppointmentsSection({
  initialAppointments,
  vehicles,
}: {
  initialAppointments: Appointment[];
  // V2 Paket 2: Randevu formundaki plaka eşleştirme önerisi için (bkz.
  // AppointmentForm). Sayfa boş dizi geçerse (ör. giriş yapılmamışsa) form
  // yalnızca mevcut manuel giriş moduyla çalışmaya devam eder.
  vehicles: Vehicle[];
}) {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [busyId, setBusyId] = useState<string | null>(null);

  const today = todayISO();
  const grouped = useMemo(() => {
    const upcoming = [...appointments]
      .filter((a) => a.date >= today && a.status !== "iptal")
      .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
    const past = [...appointments]
      .filter((a) => a.date < today || a.status === "iptal")
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
    return { upcoming, past };
  }, [appointments, today]);

  function addAppointment(appointment: Appointment) {
    setAppointments((prev) => (prev.some((a) => a.id === appointment.id) ? prev : [appointment, ...prev]));
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setBusyId(id);
    const previous = appointments;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/randevular/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setAppointments(previous);
        showToast("Randevu güncellenemedi, tekrar deneyin.", "error");
        return;
      }
      showToast(status === "geldi" ? "Randevu tamamlandı olarak işaretlendi." : "Randevu iptal edildi.");
    } catch {
      setAppointments(previous);
      showToast("Bağlantı hatası, tekrar deneyin.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    const previous = appointments;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/randevular/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setAppointments(previous);
        showToast("Randevu silinemedi, tekrar deneyin.", "error");
        return;
      }
      showToast("Randevu silindi.");
    } catch {
      setAppointments(previous);
      showToast("Bağlantı hatası, tekrar deneyin.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function renderRow(a: Appointment) {
    const whatsAppLink = a.customerPhone
      ? buildWhatsAppLink(
          a.customerPhone,
          `Merhaba${a.customerName ? " " + a.customerName : ""}, ${a.date} ${a.time} için randevunuzu hatırlatmak isteriz.${
            a.plateDisplay ? ` Araç: ${a.plateDisplay}.` : ""
          }`
        )
      : null;
    const isToday = a.date === today;
    const isBusy = busyId === a.id;

    return (
      <div
        key={a.id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
      >
        <div className="flex items-start gap-3">
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(a.status)}`}>
            {APPOINTMENT_STATUS_LABELS[a.status]}
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              {isToday ? "Bugün" : a.date}
              {a.time ? ` · ${a.time}` : ""}
              {a.plateDisplay ? ` · ${a.plateDisplay}` : ""}
              {a.source === "whatsapp_onay" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  WhatsApp'tan onaylandı
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {[a.customerName, a.customerPhone].filter(Boolean).join(" · ") || "Müşteri bilgisi girilmedi"}
            </p>
            {a.note && <p className="mt-1 text-xs text-slate-400">{a.note}</p>}
            {/* V2 Paket 2 madde 6-8: Randevu kayıtlı bir OtoHafıza aracına
                bağlıysa (a.vehicleId), "Geldi" sonrası sade bir Bakım Kaydı Ekle
                kısayolu gösterilir — otomatik kayıt OLUŞTURULMAZ, yalnızca
                doğru aracın sayfasına tek tıkla gidilir (kullanıcı tekrar plaka
                aramaz/müşteri seçmez). Kayıtlı araç yoksa bu alan hiç render
                edilmez (bkz. Senaryo B). */}
            {a.status === "geldi" && a.vehicleId && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 px-2.5 py-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-green-800">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
                  Müşteri geldi. Bakım kaydı eklemek ister misiniz?
                </span>
                <Link
                  href={`/dashboard/araclar/${a.vehicleId}`}
                  className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Bakım Kaydı Ekle
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {whatsAppLink && a.status === "bekliyor" && (
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              WhatsApp
            </a>
          )}
          {a.status === "bekliyor" && (
            <>
              <button
                onClick={() => updateStatus(a.id, "geldi")}
                disabled={isBusy}
                className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
              >
                Geldi
              </button>
              <button
                onClick={() => updateStatus(a.id, "iptal")}
                disabled={isBusy}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                İptal
              </button>
            </>
          )}
          <button
            onClick={() => remove(a.id)}
            disabled={isBusy}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            aria-label="Randevuyu sil"
          >
            Sil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <AppointmentForm vehicles={vehicles} onCreated={addAppointment} />

      <div>
        <h2 className="text-lg font-bold text-slate-900">Yaklaşan Randevular</h2>
        {grouped.upcoming.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<CalendarIcon className="h-6 w-6" />}
              title="Yaklaşan randevu yok"
              description="Yukarıdaki butondan yeni bir randevu ekleyin."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">{grouped.upcoming.map(renderRow)}</div>
        )}
      </div>

      {grouped.past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900">Geçmiş / İptal Edilen</h2>
          <div className="mt-3 space-y-2 opacity-70">{grouped.past.map(renderRow)}</div>
        </div>
      )}
    </div>
  );
}
