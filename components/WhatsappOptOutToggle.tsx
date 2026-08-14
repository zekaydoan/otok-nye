"use client";

import { useState } from "react";

// Araç sahibinin kendi başına, bayiye/desteğe yazmadan otomatik WhatsApp bakım
// hatırlatmalarından çıkabilmesi için — bkz. lib/whatsappReminder.ts
// vehicleHasReminderConsent, app/api/vehicles/[id]/whatsapp-optout. Bilinçli
// olarak küçük ve göze batmayan tutuldu — çoğu araç sahibi hatırlatmayı zaten
// istiyor, bu bir "gizli/karanlık desen" değil, sadece isteyenin bulabileceği
// bir tercih.
export default function WhatsappOptOutToggle({
  vehicleId,
  initialOptOut,
}: {
  vehicleId: string;
  initialOptOut: boolean;
}) {
  const [optOut, setOptOut] = useState(initialOptOut);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextOptOut: boolean) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/whatsapp-optout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optOut: nextOptOut }),
      });
      if (!res.ok) {
        setError("Kaydedilemedi, lütfen tekrar deneyin.");
        return;
      }
      setOptOut(nextOptOut);
      setConfirming(false);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (optOut) {
    return (
      <p className="mt-6 text-center text-xs text-slate-400">
        Bu araç için otomatik bakım hatırlatması kapalı.{" "}
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={saving}
          className="font-medium text-brand-600 underline disabled:opacity-50"
        >
          Tekrar aç
        </button>
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
        <p>Bu aracın bakım zamanı geldiğinde WhatsApp hatırlatması gönderilmesin mi?</p>
        <div className="mt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={saving}
            className="font-semibold text-red-600 underline disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Evet, kapat"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-slate-400 underline">
            Vazgeç
          </button>
        </div>
        {error && <p className="mt-1 text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <p className="mt-6 text-center text-xs text-slate-400">
      <button type="button" onClick={() => setConfirming(true)} className="underline hover:text-slate-600">
        Bu araç için bakım hatırlatması almak istemiyorum
      </button>
    </p>
  );
}
