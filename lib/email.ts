// Resend HTTP API üzerinden basit e-posta gönderimi (SDK yerine doğrudan REST
// çağrısı — iyzico entegrasyonundaki yaklaşımla tutarlı, ekstra bağımlılık eklemez).
// RESEND_API_KEY tanımlı değilse gönderim sessizce atlanır ve geliştirme ortamında
// bağlantı konsola yazılır — bu sayede şifre sıfırlama akışı e-posta sağlayıcısı
// bağlanmadan da uçtan uca test edilebilir. Farklı bir sağlayıcı (SendGrid, Postmark
// vb.) kullanmak isterseniz yalnızca bu dosyadaki sendEmail fonksiyonunu güncelleyin.

export interface EmailResult {
  sent: boolean;
  reason?: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Oto Künye <bildirim@oto-kunye.example>";

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY tanımlı değil, e-posta gönderimi atlandı. (Alıcı: ${to}, Konu: ${subject})`
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[email] Resend gönderim hatası:", res.status, text);
      return { sent: false, reason: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Resend isteği başarısız:", err);
    return { sent: false, reason: "network_error" };
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<EmailResult> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p>Merhaba,</p>
      <p>Oto Künye hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki bağlantı
      1 saat boyunca geçerlidir:</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;
      padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
      Şifremi Sıfırla</a></p>
      <p>Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz, hesabınızda
      herhangi bir değişiklik yapılmayacaktır.</p>
    </div>
  `;
  return sendEmail(to, "Oto Künye — Şifre Sıfırlama", html);
}
