// Ödeme güven rozetleri — iyzico'nun resmi logo paketindeki dosyalar kullanılıyor
// (public/odeme/iyzico-logo-band.svg: iyzico + Mastercard + Visa + American Express +
// Troy şeridi; public/odeme/iyzico-ile-ode.svg: "iyzico ile Öde" rozeti). iyzico'nun
// kendi dokümantasyonu bu şeridin ödeme/checkout ekranlarında gösterilmesini önerir
// (bkz. docs.iyzico.com/en/add-ons/iyzico-logo-pack). Daha önce burada elle çizilmiş
// placeholder SVG'ler vardı; resmi paket eklendiği için kaldırıldı.
export default function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <img
        src="/odeme/iyzico-logo-band.svg"
        alt="iyzico, Mastercard, Visa, American Express ve Troy ile güvenli ödeme"
        className="h-6 w-auto"
      />
    </div>
  );
}
