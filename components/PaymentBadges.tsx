// Ödeme güven rozetleri (iyzico + Visa/Mastercard). iyzico'nun kendi dokümantasyonu
// da "iyzico ile Öde" ibaresinin Visa/Mastercard logolarıyla birlikte gösterilmesini
// önerir (bkz. docs.iyzico.com/en/add-ons/iyzico-logo-pack). Bu ortamda iyzico'nun
// resmi logo paketini indirmek mümkün olmadığından (dış dosya erişimi kısıtlı),
// Visa/Mastercard için yaygın kullanılan sade SVG temsilleri elle çizildi — canlıya
// almadan önce iyzico'nun resmi logo paketindeki dosyalarla değiştirmeniz önerilir
// (bkz. README "Ödeme Güven Rozetleri" bölümü).
export default function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-3.5 w-3.5 text-green-600"
        >
          <rect x="4" y="9" width="12" height="8" rx="1.5" />
          <path strokeLinecap="round" d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
        </svg>
        iyzico ile Güvenli Ödeme
      </span>

      <span className="flex h-7 items-center rounded border border-slate-200 bg-white px-2.5" title="Visa">
        <svg viewBox="0 0 48 16" className="h-3 w-auto" aria-label="Visa">
          <text
            x="0"
            y="13"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontWeight="700"
            fontSize="15"
            fill="#1434CB"
          >
            VISA
          </text>
        </svg>
      </span>

      <span className="flex h-7 items-center rounded border border-slate-200 bg-white px-2.5" title="Mastercard">
        <svg viewBox="0 0 24 14" className="h-3.5 w-auto" aria-label="Mastercard">
          <circle cx="8.5" cy="7" r="6.2" fill="#EB001B" />
          <circle cx="15.5" cy="7" r="6.2" fill="#F79E1B" fillOpacity="0.85" />
        </svg>
      </span>
    </div>
  );
}
