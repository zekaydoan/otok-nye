"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import IconBadge from "@/components/IconBadge";
import { CheckIcon, DocumentIcon } from "@/components/icons";

export default function ShareReportButton({ vehicleId }: { vehicleId: string }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (url) {
      // İkinci tık: linki panoya kopyala
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // panoya erişilemezse sorun değil, link zaten ekranda görünür
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/rapor`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUrl(data.url);
        showToast("Satış raporu bağlantısı oluşturuldu.");
      } else {
        showToast(data.error || "Rapor oluşturulamadı, lütfen tekrar deneyin.", "error");
      }
    } catch {
      showToast("Bağlantı hatası, lütfen tekrar deneyin.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-start">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? (
          "Oluşturuluyor..."
        ) : url ? (
          copied ? (
            <>
              <IconBadge icon={<CheckIcon />} color="green" size="sm" />
              Kopyalandı
            </>
          ) : (
            <>
              <IconBadge icon={<DocumentIcon />} color="blue" size="sm" />
              Linki Kopyala
            </>
          )
        ) : (
          <>
            <IconBadge icon={<DocumentIcon />} color="blue" size="sm" />
            Satış Raporu Oluştur
          </>
        )}
      </button>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="max-w-xs truncate text-xs text-brand-600 underline"
        >
          {url}
        </a>
      )}
    </div>
  );
}
