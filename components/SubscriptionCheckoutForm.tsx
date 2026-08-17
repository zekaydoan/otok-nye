"use client";

import { useEffect, useRef } from "react";

// iyzico'nun Abonelik Checkout Form'u bir HTML+<script> parçası olarak döner
// (checkoutFormContent, bkz. lib/iyzicoSubscription.ts) — bu script çalıştığında
// sayfada id="iyzipay-checkout-form" olan bir konteyner bulup içine ödeme
// arayüzünü (iframe) enjekte eder. React'ın dangerouslySetInnerHTML'i <script>
// etiketlerini GÜVENLİK GEREĞİ çalıştırmaz — bu yüzden script içeriğini elle
// yeni bir <script> DOM node'una kopyalayıp ekliyoruz, tarayıcı yalnızca bu
// şekilde gerçekten çalıştırıyor (iyzico'nun resmi JS embed entegrasyonlarında
// kullanılan standart teknik).
//
// DÜRÜSTLÜK NOTU: Bu bileşen gerçek bir sandbox anahtarıyla UÇTAN UCA TEST
// EDİLMEDİ (bkz. lib/iyzicoSubscription.ts dosya başındaki aynı not) — Zeki
// /dashboard/plan/odeme akışını PAID_PLANS_ENABLED'ı geçici olarak açıp bir
// test kartıyla deneyene kadar, formun gerçekten görünüp görünmediği
// doğrulanamadı.
export default function SubscriptionCheckoutForm({
  checkoutFormContent,
}: {
  checkoutFormContent: string;
}) {
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scriptContainerRef.current;
    if (!container) return;
    container.innerHTML = ""; // yeniden mount'ta script iki kez eklenmesin

    const wrapper = document.createElement("div");
    wrapper.innerHTML = checkoutFormContent;
    const scripts = Array.from(wrapper.querySelectorAll("script"));

    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      container.appendChild(newScript);
    });
  }, [checkoutFormContent]);

  return (
    <div>
      {/* iyzico'nun script'i bu id'yi arayıp içini dolduruyor — sabit kalmalı. */}
      <div id="iyzipay-checkout-form" className="responsive" />
      <div ref={scriptContainerRef} />
      <p className="mt-3 text-center text-xs text-slate-400">
        Ödeme formu yüklenmiyorsa sayfayı yenileyip tekrar deneyin.
      </p>
    </div>
  );
}
