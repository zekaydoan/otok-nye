"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/Toast";
import { WhatsAppIcon } from "@/components/icons";

// Partnerin sahada paylaşacağı kayıt linkini gösterir — bkz. app/kayit/page.tsx
// (?ref=KOD okuyup app/api/auth/signup'a iletiyor) ve app/p/[code]/page.tsx
// (kısa link -> /kayit?ref=KOD yönlendirmesi). Site adresini sabit bir ortam
// değişkenine bağlamak yerine bilinçli olarak `window.location.origin`
// kullanılır: hem prod (otohafiza.com) hem Netlify preview/deploy önizleme
// URL'lerinde doğru linki üretir, ayrı bir ortam değişkeni bakımı gerekmez.
//
// Önceden sadece gri bir <code> kutusu + "Linki Kopyala" butonuydu; kullanıcı
// (Zeki) bunun hem partner hem bayi tarafında daha "kurumsal" görünmesini
// istedi. Üç değişiklik: (1) uzun /kayit?ref=KOD yerine kısa/marka linki
// (/p/KOD) gösteriliyor, (2) saha koşullarında telefon ekranından direkt
// okutulabilecek bir QR kod eklendi, (3) partnerin ustayı ikna etmesine gerek
// kalmadan tek tıkla hazır bir tanıtım mesajıyla WhatsApp'ta paylaşabileceği
// bir buton eklendi.
export default function PartnerReferralLink({ code, name }: { code: string; name?: string }) {
  const { showToast } = useToast();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShortUrl(`${window.location.origin}/p/${code}`);
  }, [code]);

  async function handleCopy() {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      showToast("Link kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // panoya erişilemezse sorun değil, link zaten ekranda görünür
    }
  }

  const shareMessage = `Merhaba, ben OtoHafıza Saha Partneri${
    name ? ` ${name}` : ""
  }. OtoHafıza ile araçların yağ/bakım geçmişini QR kodla dijital takip edebilirsiniz, kuruluma gerek yok, 15 araca kadar ücretsiz. İncelemek için: ${
    shortUrl || ""
  }`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-2">
        {shortUrl ? (
          <QRCodeSVG value={shortUrl} size={92} level="M" />
        ) : (
          <div className="h-[92px] w-[92px] animate-pulse rounded bg-slate-100" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm font-medium text-brand-700">
          {shortUrl ? shortUrl.replace(/^https?:\/\//, "") : `…/p/${code}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            disabled={!shortUrl}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {copied ? "Kopyalandı ✓" : "Linki Kopyala"}
          </button>
          <a
            href={shortUrl ? whatsappShareUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!shortUrl}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition ${
              shortUrl ? "bg-emerald-600 hover:bg-emerald-700" : "pointer-events-none bg-emerald-300"
            }`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp&apos;ta Paylaş
          </a>
        </div>
      </div>
    </div>
  );
}
