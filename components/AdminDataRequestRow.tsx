"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DATA_REQUEST_STATUS_LABELS,
  DATA_REQUEST_TYPE_LABELS,
  type DataRequest,
  type DataRequestStatus,
} from "@/lib/types";
import { useToast } from "@/components/Toast";

// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): "Tamamlandı" artık terminal
// (bitmiş) bir durum — önceden buradan "Yeni"ye tek tıkla ve onaysız geri
// dönülebiliyordu, bu da tamamlanmış bir KVKK talebinin yanlışlıkla yeniden
// açılmasına yol açabilirdi. tamamlandi artık bu eşlemede yok; aşağıdaki
// render kısmı NEXT_STATUS[request.status] tanımsızsa butonu hiç göstermez.
// Geri alma ihtiyacı olursa bu ayrıca (bilinçli bir onay adımıyla)
// değerlendirilecek — bkz. lib/blobStore.ts updateDataRequestStatus'taki
// sunucu tarafı guard.
const NEXT_STATUS: Partial<Record<DataRequestStatus, DataRequestStatus>> = {
  yeni: "islemde",
  islemde: "tamamlandi",
};

const STATUS_TONE: Record<DataRequestStatus, string> = {
  yeni: "bg-red-50 text-red-700",
  islemde: "bg-amber-50 text-amber-700",
  tamamlandi: "bg-green-50 text-green-700",
};

export default function AdminDataRequestRow({ request }: { request: DataRequest }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function advanceStatus() {
    const next = NEXT_STATUS[request.status];
    if (!next) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/veri-talepleri/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        showToast("Güncellenemedi, tekrar deneyin.", "error");
        return;
      }
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, tekrar deneyin.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{DATA_REQUEST_TYPE_LABELS[request.type]}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            <Link href={`/dashboard/araclar/${request.vehicleId}`} className="underline">
              {request.plateDisplay}
            </Link>{" "}
            · {new Date(request.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[request.status]}`}>
          {DATA_REQUEST_STATUS_LABELS[request.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">İletişim: {request.contactInfo}</p>
      {request.message && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{request.message}</p>}
      {NEXT_STATUS[request.status] && (
        <button
          onClick={advanceStatus}
          disabled={saving}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {request.status === "yeni" && "İşleme al"}
          {request.status === "islemde" && "Tamamlandı olarak işaretle"}
        </button>
      )}
    </div>
  );
}
