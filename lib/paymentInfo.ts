// Partner ödeme/IBAN bilgisi doğrulaması — hem PartnerPaymentInfoForm (istemci,
// gönderim öncesi anlık hata göstermek için) hem de
// app/api/partner/odeme-bilgileri (sunucu, gerçek kaynak-doğrusu kontrolü
// için) tarafından aynı kurallarla kullanılır. Desen, lib/billing.ts'teki
// validateBillingInfo ile birebir aynı — iki ayrı kural seti birbirinden
// sapmasın diye tek yerde tutulur.

export interface PartnerPaymentInfoInput {
  fullName?: string;
  iban?: string;
  bankName?: string;
}

function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// Standart ISO 7064 MOD 97-10 IBAN checksum kontrolü. Yalnızca biçim
// (TR + 24 rakam) yeterli değil — partner ödeme gününden çok önce, hesap
// açarken bir haneyi yanlış girip fark etmeyebilir; checksum bunu daha
// formda yakalar, transfer günü elle düzeltme/gecikme yaşanmasın diye.
function isValidIbanChecksum(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let expanded = "";
  for (const ch of rearranged) {
    if (ch >= "0" && ch <= "9") {
      expanded += ch;
    } else if (ch >= "A" && ch <= "Z") {
      expanded += (ch.charCodeAt(0) - 55).toString();
    } else {
      return false;
    }
  }
  try {
    return BigInt(expanded) % BigInt(97) === BigInt(1);
  } catch {
    return false;
  }
}

// Boş/hatalı alan varsa insan tarafından okunabilir ilk hatayı, hepsi
// geçerliyse null döner — hem form hem API aynı mesajı gösterebilsin diye.
export function validatePartnerPaymentInfo(input: PartnerPaymentInfoInput): string | null {
  if (!(input.fullName || "").trim()) return "Hesap sahibinin Ad Soyadı zorunlu.";

  const iban = normalizeIban(input.iban || "");
  if (!iban) return "IBAN zorunlu.";
  if (!/^TR\d{24}$/.test(iban)) {
    return "IBAN, TR ile başlayıp toplam 26 karakter (TR + 24 rakam) olmalı.";
  }
  if (!isValidIbanChecksum(iban)) {
    return "IBAN geçersiz görünüyor, lütfen numarayı kontrol edip tekrar deneyin.";
  }

  if (!(input.bankName || "").trim()) return "Banka adı zorunlu.";

  return null;
}

// Gösterimde IBAN'ı 4'erli gruplar hâlinde ayırır (TR12 3456 7890 ...) —
// depolamada boşluksuz tutulur, yalnızca ekranda okunaklı olsun diye.
export function formatIban(iban: string): string {
  const clean = normalizeIban(iban);
  return (clean.match(/.{1,4}/g) || [clean]).join(" ");
}
