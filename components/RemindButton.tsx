"use client";

import { useState } from "react";

export default function RemindButton({ vehicleId }: { vehicleId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("sending");
    setMessage(null);
    const res = await fetch(`/api/vehicles/${vehicleId}/remind`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.sent) {
      setStatus("sent");
      setMessage("Hatırlatma SMS'i gönderildi.");
    } else {
      setStatus("error");
      setMessage(
        data.reason === "not_configured"
          ? "SMS sağlayıcısı tanımlı değil (Netlify ortam değişkenlerini kontrol edin)."
          : data.error || "Gönderilemedi."
      );
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleClick}
        disabled={status === "sending"}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {status === "sending" ? "Gönderiliyor..." : "SMS Hatırlatma Gönder"}
      </button>
      {message && (
        <span className={`mt-1 text-[11px] ${status === "sent" ? "text-green-600" : "text-red-500"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
