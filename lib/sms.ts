// Netgsm HTTP API üzerinden SMS gönderimi.
// Ortam değişkenleri tanımlanmadıysa gönderim atlanır (uygulama hata vermez) —
// gerçek gönderim için Netgsm hesabınızın kullanıcı adı/şifre/mesaj başlığı bilgilerini
// Netlify ortam değişkenlerine ekleyin: NETGSM_USERNAME, NETGSM_PASSWORD, NETGSM_HEADER.
// Farklı bir sağlayıcı (İletiMerkezi, Vatan SMS vb.) kullanmak isterseniz bu dosyadaki
// sendSms fonksiyonunu ilgili sağlayıcının API'sine göre güncellemeniz yeterlidir.

export interface SmsResult {
  sent: boolean;
  reason?: string;
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("90")) return digits;
  return null;
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const username = process.env.NETGSM_USERNAME;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER;

  if (!username || !password || !header) {
    console.warn(
      "[sms] NETGSM_USERNAME / NETGSM_PASSWORD / NETGSM_HEADER tanımlı değil, SMS gönderimi atlandı."
    );
    return { sent: false, reason: "not_configured" };
  }

  const normalized = normalizePhone(phone);
  if (!normalized) {
    return { sent: false, reason: "invalid_phone" };
  }

  const params = new URLSearchParams({
    usercode: username,
    password,
    gsmno: normalized,
    message,
    msgheader: header,
    dil: "TR",
  });

  try {
    const res = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`, {
      method: "GET",
    });
    const text = await res.text();
    // Netgsm başarı kodları "00" veya "01" ile başlar.
    const ok = text.trim().startsWith("00") || text.trim().startsWith("01");
    if (!ok) {
      console.warn("[sms] Netgsm gönderim hatası:", text);
      return { sent: false, reason: text.trim() };
    }
    return { sent: true };
  } catch (err) {
    console.error("[sms] Netgsm isteği başarısız:", err);
    return { sent: false, reason: "network_error" };
  }
}
