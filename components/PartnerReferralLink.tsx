"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

// Partnerin sahada paylaşacağı kayıt linkini gösterir — bkz. app/kayit/page.tsx
// (?ref=KOD okuyup app/api/auth/signup'a iletiyor). Site adresini sabit bir
// ortam değişkenine bağlamak yerine bilinçli olarak `window.location.origin`
// kullanılır: hem prod (otohafiza.com) hem Netlify preview/deploy önizleme
// URL'lerinde doğru linki üretir, ayrı bir ortam değişkeni bakımı gerekmez.
export default function PartnerReferralLink({ code }: { code: string }) {
  const { showToast } = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/kayit?ref=${code}`);
  }, [code]);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // panoya erişilemezse sorun değil, link zaten ekranda görünür
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
        {url || `…/kayit?ref=${code}`}
      </code>
      <button
        onClick={handleCopy}
        disabled={!url}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {copied ? "Kopyalandı ✓" : "Linki Kopyala"}
      </button>
    </div>
  );
}
