// iyzico'nun resmi "iyzico ile Öde" güven rozeti (public/odeme/iyzico-ile-ode.svg).
// iyzico'nun logo paketi dokümantasyonu bu rozetin, kartla ödeme alınan asıl
// buton/adımın hemen yanında/altında gösterilmesini önerir — PaymentBadges'teki
// genel logo şeridinden farklı olarak, doğrudan ödemeye geçilen ekranlarda kullanılır
// (bkz. docs.iyzico.com/en/add-ons/iyzico-logo-pack).
export default function IyzicoOdeBadge({ className = "" }: { className?: string }) {
  return (
    <img
      src="/odeme/iyzico-ile-ode.svg"
      alt="iyzico ile Öde — güvenli ödeme"
      className={`h-8 w-auto ${className}`}
    />
  );
}
