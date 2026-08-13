import type { Config } from "@netlify/functions";

// Gerçek Scheduled Function budur — Netlify'da Scheduled Functions sert bir 30
// saniyelik süre sınırına tabidir (bkz. docs.netlify.com/build/functions/scheduled-functions,
// "Limitations"). Araç sayısı büyüdükçe tüm filoyu tek çalıştırmada taramak bu süreyi
// kolayca aşar ve fonksiyon sessizce yarıda kesilir — bu durumda bazı araç sahipleri
// o gün hiç hatırlatma almaz ve hata da fark edilmeden geçer.
//
// Bunu önlemek için burada ağır işi YAPMIYORUZ: sadece asıl işi yapan, 15 dakikaya
// kadar çalışabilen bakim-hatirlatma-worker-background fonksiyonunu HTTP üzerinden
// tetikliyoruz. Bu dosya birkaç saniyede biter, 30 saniyelik sınırla hiçbir zaman
// yarışmaz.
export default async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!siteUrl) {
    console.error(
      "[bakim-hatirlatma] Site URL'i bulunamadı (URL/DEPLOY_URL ortam değişkeni yok), worker tetiklenemedi."
    );
    return;
  }
  try {
    const res = await fetch(`${siteUrl}/.netlify/functions/bakim-hatirlatma-worker-background`, {
      method: "POST",
    });
    console.log(`[bakim-hatirlatma] Worker tetiklendi, yanıt durumu: ${res.status}`);
  } catch (err) {
    console.error("[bakim-hatirlatma] Worker tetiklenemedi:", err);
  }
};

export const config: Config = {
  schedule: "0 8 * * *", // her gün 08:00 UTC
};
