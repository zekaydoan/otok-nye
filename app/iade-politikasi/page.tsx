import Link from "next/link";
import { buildBusinessWhatsAppLink } from "@/lib/whatsappBusiness";

export const metadata = {
  title: "İade Politikası",
};

export default function IadePolitikasiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">İade Politikası</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Bu sayfa, OtoHafıza'dan satın aldığınız fiziksel QR etiketin ve ücretli abonelik
          planının iade/cayma koşullarını sade bir dille özetler. Tam hukuki metinler için{" "}
          <Link href="/mesafeli-satis-sozlesmesi" className="text-brand-600 underline">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link href="/abonelik-politikasi" className="text-brand-600 underline">
            Abonelik, Ödeme, Yenileme, İptal ve İade Politikası
          </Link>{" "}
          belgelerine bakabilirsiniz; bu iki belge ile bu sayfa arasında çelişki olması hâlinde
          ilgili tam metin esas alınır.

        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          1. Fiziksel QR Etiket Siparişleri
        </h2>
        <h3 className="mt-4 font-semibold text-slate-800">14 gün içinde cayma hakkı</h3>
        <p className="mt-2 text-sm text-slate-600">
          Etiketi teslim aldığınız tarihten itibaren on dört (14) gün içinde, herhangi bir
          gerekçe göstermeksizin siparişten cayabilirsiniz. Cayma hakkının kullanılabilmesi için
          etiketin kullanılmamış, araca yapıştırılmamış ve satışa engel olacak şekilde tahrip
          edilmemiş olması gerekir.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Cayma bildiriminizi{" "}
            <a href="mailto:hello@otohafiza.com" className="text-brand-600 underline">
              hello@otohafiza.com
            </a>{" "}
            adresine yazılı olarak iletin.
          </li>
          <li>İade kargo bedeli tarafınıza aittir.</li>
          <li>
            Bildiriminiz ulaştıktan sonra en geç on dört (14) gün içinde, varsa teslimat masrafı
            dahil, ödediğiniz tutarın tamamı ödeme yönteminize iade edilir.
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-slate-800">Ayıplı (kusurlu) ürün</h3>
        <p className="mt-2 text-sm text-slate-600">
          Etiket ayıplı/kusurlu teslim edildiyse; 6502 sayılı Kanun uyarınca sözleşmeden dönme,
          ayıp oranında bedel indirimi isteme, ücretsiz onarım isteme veya imkân varsa ayıpsız bir
          misliyle değiştirilmesini isteme haklarından birini kullanabilirsiniz. Talebinizi bize
          ilettiğinizde azami otuz (30) gün içinde gereğini yerine getiririz.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">Yanlış/hasarlı teslimat</h3>
        <p className="mt-2 text-sm text-slate-600">
          Kargo sırasında oluşan kayıp veya hasarlarda, makul süre içinde ürünü yeniden gönderir
          veya bedelini iade ederiz. Adres bilgisinin hatalı/eksik girilmesinden kaynaklanan
          yeniden gönderim masrafı ise tarafınıza aittir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">2. Ücretli Abonelik Planları</h2>
        <h3 className="mt-4 font-semibold text-slate-800">
          14 günlük memnuniyet garantisi
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          İlk kez ücretli bir plana geçtiyseniz, satın alma tarihinden itibaren on dört (14) gün
          içinde talep etmeniz hâlinde ödediğiniz bedeli iade ederiz — bu, yasal cayma hakkından
          bağımsız, gönüllü olarak sunduğumuz bir taahhüttür. İade, ödeme yönteminize azami on
          (10) iş günü içinde yapılır.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Bu taahhüt, planın sağladığı limitlerin tamamı kullanılıp ardından iade talep edilmesi
          veya tekrarlayan iade talepleri gibi kötüye kullanım hâllerinde makul gerekçeyle
          reddedilebilir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">İptal</h3>
        <p className="mt-2 text-sm text-slate-600">
          Otomatik yenilemeyi panelden veya hello@otohafiza.com üzerinden dilediğiniz zaman iptal
          edebilirsiniz. İptal, o anki faturalandırma döneminin sonuna kadar erişiminizi
          etkilemez; dönem sonunda hesabınız otomatik olarak Ücretsiz Plan'a döner. Cari dönem
          için önceden ödenmiş bedel, memnuniyet garantisi kapsamı dışında iade edilmez.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">3. İletişim</h2>
        <p className="mt-2 text-sm text-slate-600">
          İade veya cayma talepleriniz için{" "}
          <a href="mailto:hello@otohafiza.com" className="text-brand-600 underline">
            hello@otohafiza.com
          </a>{" "}
          adresine ya da{" "}
          <a
            href={buildBusinessWhatsAppLink("Merhaba, bir iade/cayma talebim var:")}
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 underline"
          >
            WhatsApp
          </a>{" "}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
