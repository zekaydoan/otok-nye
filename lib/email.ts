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

// notifyAdmins'e geçilen HTML şablonlarına kullanıcı/bayi girdisi (contactInfo,
// message, shop adı vb.) ham haliyle gömülüyordu — bir saldırgan bu alanlara
// HTML/script içeriği yazarak admin'in e-posta istemcisinde render edilmesini
// deneyebilirdi. Bu yardımcı, kullanıcı kaynaklı her metni e-postaya eklemeden
// önce escape etmek için kullanılır.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "OtoHafıza <bildirim@otohafiza.example>";

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

// Admin'e yeni bir etiket siparişi, öneri ya da KVKK veri talebi geldiğinde
// bildirim göndermek için — daha önce admin bu olayları yalnızca paneli elle
// kontrol ederek öğrenebiliyordu (bkz. app/api/etiket-siparis/route.ts,
// app/api/oneriler/route.ts, app/api/vehicles/[id]/veri-talebi/route.ts).
// ADMIN_EMAILS, lib/adminAuth.ts'teki ile aynı ortam değişkeni — burada ayrıca
// import edilmeden okunuyor (lib/adminAuth.ts oturum/Shop'a bağımlı, e-posta
// bildirimi için session gerekmez).
export async function notifyAdmins(subject: string, html: string): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  await Promise.all(adminEmails.map((email) => sendEmail(email, subject, html)));
}

export interface BulkEmailSummary {
  attempted: number;
  sent: number;
  failed: number;
}

// Bu dosyadaki ilk "birden çok alıcıya" gönderim senaryosu — notifyAdmins
// birkaç admin e-postası için throttle'sız Promise.all kullanıyor, ama admin
// sayısı elle sınırlı (ADMIN_EMAILS ortam değişkeni); bayi sayısı büyüdükçe
// (bkz. kapasite-analizi.md) tüm bayilere TEK Promise.all ile aynı anda
// gönderim Resend'in dakika/saniye başına istek sınırına takılabilir. Bu
// yüzden alıcılar küçük gruplar hâlinde, gruplar arasında kısa bir gecikmeyle
// gönderilir. Bir alıcının başarısız olması (geçersiz adres, geçici Resend
// hatası vb.) diğerlerini ETKİLEMEZ — sendEmail zaten hatayı kendi içinde
// yakalayıp {sent:false} döner, burada yalnızca sayılır.
const BULK_EMAIL_BATCH_SIZE = 15;
const BULK_EMAIL_BATCH_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Admin panelinden bir duyuru yayınlanırken (bkz.
// app/api/admin/duyurular/route.ts) hedef kitleye giren bayilere aynı
// duyurunun e-posta kopyasını göndermek için — panel içi gösterim
// (Announcement/listAnnouncementsForShop) bundan bağımsız çalışmaya devam
// eder, bu yalnızca EK bir bildirim kanalıdır.
export async function sendAnnouncementEmail(
  recipientEmails: string[],
  title: string,
  message: string
): Promise<BulkEmailSummary> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:12px;">${escapeHtml(title)}</p>
      <p style="white-space:pre-wrap;color:#334155;line-height:1.5;">${escapeHtml(message)}</p>
      <p style="margin-top:20px;">
        <a href="https://otohafiza.com/dashboard/duyurular" style="display:inline-block;background:#1d4ed8;color:#fff;
        padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
        Panelde Görüntüle</a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
        Bu e-posta, OtoHafıza hesabınıza kayıtlı adrese hesabınızla ilgili bir duyuruyu iletmek
        amacıyla gönderildi.
      </p>
    </div>
  `;

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipientEmails.length; i += BULK_EMAIL_BATCH_SIZE) {
    const batch = recipientEmails.slice(i, i + BULK_EMAIL_BATCH_SIZE);
    const results = await Promise.all(batch.map((to) => sendEmail(to, title, html)));
    for (const result of results) {
      if (result.sent) sent++;
      else failed++;
    }
    if (i + BULK_EMAIL_BATCH_SIZE < recipientEmails.length) {
      await delay(BULK_EMAIL_BATCH_DELAY_MS);
    }
  }

  return { attempted: recipientEmails.length, sent, failed };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<EmailResult> {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p>Merhaba,</p>
      <p>OtoHafıza hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki bağlantı
      1 saat boyunca geçerlidir:</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;
      padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
      Şifremi Sıfırla</a></p>
      <p>Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz, hesabınızda
      herhangi bir değişiklik yapılmayacaktır.</p>
    </div>
  `;
  return sendEmail(to, "OtoHafıza — Şifre Sıfırlama", html);
}
