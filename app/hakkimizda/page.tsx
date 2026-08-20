import Link from "next/link";

export const metadata = {
  title: "Hakkımızda",
  description:
    "OtoHafıza, araç bakım geçmişini QR kod ile dijitalleştiren bir SaaS ürünüdür. Sarper Dijital Teknolojiler ve Kiralama A.Ş. tarafından geliştirilir.",
};

export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Hakkımızda</h1>

        <h2 className="mt-8 text-lg font-bold text-slate-900">OtoHafıza nedir?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          OtoHafıza, araca yapıştırılan tek bir QR etiketle her aracın yağ bakım geçmişini
          dijital ortamda tutan bir panel hizmetidir. Oto tamircileri, yetkili servisler ve
          galeriler; müşterisinin aracını sisteme kaydeder, her bakımda QR'ı okutup yeni kaydı
          saniyeler içinde ekler. Araç sahibinin adı/telefonu QR sayfasında gösterilmez; yalnızca
          plaka, marka/model ve bakım geçmişi görünür hâle gelir. Araç başka bir servise giderse
          bile geçmiş kaybolmaz — kağıt bakım defterinin dijital, kaybolmayan hâlidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Neden çıktık?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Türkiye'de bugün hâlâ birçok oto tamirci ve servis, müşteri araçlarının bakım
          geçmişini kağıt defterlerde ya da elle tutulan notlarda saklıyor. Defter kaybolur,
          yıpranır, aranan bir kayda ulaşmak dakikalar alır; araç başka bir servise gittiğinde
          geçmiş bilgisi tamamen kaybolur. OtoHafıza, bu süreci tek bir QR etiketle
          dijitalleştirerek hem servis sahiplerinin günlük işini kolaylaştırmayı hem de araç
          sahiplerine düzenli bakım geçmişiyle gelen güveni sunmayı hedefler.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Kim işletiyor?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          OtoHafıza,{" "}
          <a
            href="https://www.sarperdijital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline"
          >
            Sarper Dijital
          </a>{" "}
          markası altında, SARPER DİJİTAL TEKNOLOJİLER VE KİRALAMA A.Ş. tarafından tasarlanmış
          ve işletilmektedir.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Ticaret Unvanı: Sarper Dijital Teknolojiler ve Kiralama A.Ş.</li>
          <li>Vergi Dairesi / No: Mesir Vergi Dairesi, 7511125219</li>
          <li>Mersis No: 0751112521900001</li>
          <li>Ticaret Sicil No: 24016</li>
          <li>Adres: Muradiye Mahallesi Zübeyde Hanım Cad. No:34/A Yunusemre/Manisa</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-slate-900">İletişim</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Sorularınız, önerileriniz veya iş birliği talepleriniz için bize ulaşabilirsiniz:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            E-posta:{" "}
            <a href="mailto:hello@otohafiza.com" className="text-brand-600 underline">
              hello@otohafiza.com
            </a>
          </li>
          <li>
            Telefon / WhatsApp:{" "}
            <a
              href="https://wa.me/905425756918"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline"
            >
              +90 542 575 69 18
            </a>
          </li>
          <li>
            Instagram:{" "}
            <a
              href="https://www.instagram.com/hafizaoto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline"
            >
              @hafizaoto
            </a>
          </li>
        </ul>

        <p className="mt-8 text-sm text-slate-500">
          Kurumsal, hukuki ve gizlilikle ilgili tüm belgelere{" "}
          <Link href="/kvkk" className="text-brand-600 underline">
            KVKK Aydınlatma Metni
          </Link>
          ,{" "}
          <Link href="/gizlilik-sozlesmesi" className="text-brand-600 underline">
            Gizlilik Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link href="/kullanim-sartlari" className="text-brand-600 underline">
            Kullanım Şartları
          </Link>{" "}
          sayfalarından ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
