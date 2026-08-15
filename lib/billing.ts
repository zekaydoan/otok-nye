import type { BillingInfo } from "./types";

// Fatura bilgisi doğrulaması — hem BillingInfoForm (istemci, gönderim öncesi
// anlık hata göstermek için) hem de app/api/shop/billing-info,
// app/api/shop/plan, app/api/etiket-siparis (sunucu, gerçek kaynak-doğrusu
// kontrolü için) tarafından aynı kurallarla kullanılır — iki ayrı kural seti
// birbirinden sapıp biri "geçti" derken diğeri reddetmesin diye tek yerde tutulur.

export interface BillingInfoInput {
  type?: string;
  fullName?: string;
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  eInvoiceType?: string;
  email?: string;
}

// Kurumsal VKN 10 hane, bireysel T.C. Kimlik No 11 hane — ikisi de yalnızca
// rakam. Gerçek bir MERNİS/GİB doğrulaması yapılmıyor (dış servis gerektirir),
// yalnızca biçim kontrolü.
function isValidTaxNumber(type: string, value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  return type === "kurumsal" ? value.length === 10 : value.length === 11;
}

// Boş alan yoksa null, doluysa insan tarafından okunabilir ilk hatayı döner —
// hem form hem API aynı mesajı gösterebilsin diye.
export function validateBillingInfo(input: BillingInfoInput): string | null {
  const type = input.type;
  if (type !== "bireysel" && type !== "kurumsal") {
    return "Fatura tipi (Bireysel/Kurumsal) seçmelisiniz.";
  }

  if (type === "bireysel") {
    if (!(input.fullName || "").trim()) return "Ad Soyad zorunlu.";
  } else {
    if (!(input.companyName || "").trim()) return "Firma unvanı zorunlu.";
  }

  if (!(input.taxOffice || "").trim()) return "Vergi Dairesi zorunlu.";

  const taxNumber = (input.taxNumber || "").trim();
  if (!taxNumber) {
    return type === "bireysel" ? "T.C. Kimlik No zorunlu." : "Vergi Numarası zorunlu.";
  }
  if (!isValidTaxNumber(type, taxNumber)) {
    return type === "bireysel"
      ? "T.C. Kimlik No 11 haneli rakamlardan oluşmalı."
      : "Vergi Numarası 10 haneli rakamlardan oluşmalı.";
  }

  if (!(input.address || "").trim()) return "Adres zorunlu.";
  if (!(input.phone || "").trim()) return "Telefon zorunlu.";

  if (input.eInvoiceType !== "e-fatura" && input.eInvoiceType !== "e-arsiv") {
    return "E-Fatura veya E-Arşiv mükellefiyet durumunuzu seçmelisiniz.";
  }

  return null;
}

// Bir bayinin kayıtlı BillingInfo'sunun (varsa) hâlâ eksiksiz olduğunu
// doğrular — plan/etiket satın alma uç noktaları bunu ödeme başlatmadan önce
// çağırır (bkz. app/api/shop/plan, app/api/etiket-siparis).
export function isBillingInfoComplete(info?: BillingInfo | null): boolean {
  if (!info) return false;
  return (
    validateBillingInfo({
      type: info.type,
      fullName: info.fullName,
      companyName: info.companyName,
      taxOffice: info.taxOffice,
      taxNumber: info.taxNumber,
      address: info.address,
      phone: info.phone,
      eInvoiceType: info.eInvoiceType,
    }) === null
  );
}
