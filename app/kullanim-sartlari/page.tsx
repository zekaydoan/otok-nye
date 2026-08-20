import Link from "next/link";

export const metadata = {
  title: "Kullanım Şartları",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Kullanım Şartları</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          İşbu Kullanım Koşulları, otohafiza.com sitesini ziyaret eden herkes için geçerli
          genel şartları düzenler. Platform'a kayıt olup hesap açan kullanıcılar için ayrıca{" "}
          <Link href="/dashboard" className="underline">
            SaaS Kullanım ve Lisans Sözleşmesi
          </Link>{" "}
          ve ekleri uygulanır; iki belge arasında çelişki olması hâlinde, hesap sahipleri
          bakımından SaaS Kullanım ve Lisans Sözleşmesi esas alınır.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">1. Amaç ve Kapsam</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Kullanım Koşulları, Sarper Dijital Teknolojiler ve Kiralama A.Ş. ("Şirket")
          tarafından işletilen otohafiza.com internet sitesinin ("Site") genel kullanım
          şartlarını düzenler ve Site'yi ziyaret eden herkes ("Ziyaretçi") için bağlayıcıdır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">2. Sitenin Kullanımı</h2>
        <p className="mt-2 text-sm text-slate-600">
          Ziyaretçi, Site'yi yalnızca hukuka uygun amaçlarla kullanabilir; Site'nin
          işleyişini bozacak, aşırı yük bindirecek veya güvenliğini tehdit edecek şekilde
          kullanamaz. Site'de otomatikleştirilmiş araçlarla (bot, scraper, crawler) toplu
          veri çekilmesi, arama motoru indeksleme robotları için kamuya açık şekilde izin
          verilenler hariç, yasaktır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">3. Fikri Mülkiyet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Site'deki tüm içerik (metin, blog yazıları, görsel, logo, "OtoHafıza" markası,
          arayüz tasarımı) Şirket'in veya lisans verenlerinin fikri mülkiyetindedir ve 5846
          sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu
          kapsamında korunmaktadır. Ziyaretçi, Site içeriğini Şirket'in önceden yazılı izni
          olmaksızın çoğaltamaz, dağıtamaz veya ticari amaçla kullanamaz; kaynak gösterilerek
          yapılan makul alıntılar bu yasağın kapsamı dışındadır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Kullanıcı Hesapları</h2>
        <p className="mt-2 text-sm text-slate-600">
          Site üzerinden Platform'a kayıt olan Ziyaretçiler, kayıt anından itibaren SaaS
          Kullanım ve Lisans Sözleşmesi ve eklerine tabi olur; işbu Kullanım Koşulları, hesap
          açmamış Ziyaretçiler bakımından geçerliliğini korur.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">5. Üçüncü Taraf Bağlantılar</h2>
        <p className="mt-2 text-sm text-slate-600">
          Site, üçüncü kişilere ait internet sitelerine bağlantılar (link) içerebilir.
          Şirket, bu sitelerin içeriğinden veya gizlilik uygulamalarından sorumlu değildir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          6. Sorumluluğun Sınırlandırılması
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Şirket, Site'de yer alan bilgilerin (blog içerikleri dahil) güncelliği, doğruluğu
          veya eksiksizliği konusunda azami özeni gösterir; ancak bu içerikler genel
          bilgilendirme amaçlıdır ve profesyonel (hukuki, mali, teknik) tavsiye niteliği
          taşımaz. Şirket'in işbu madde kapsamındaki sorumluluğu, kasıt/ağır ihmal istisnası
          saklı kalmak kaydıyla sınırlıdır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">7. Değişiklikler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Şirket, işbu Kullanım Koşulları'nı önceden makul süre bildirimde bulunarak
          güncelleyebilir; güncel metin Site üzerinde yayınlandığı andan itibaren geçerli
          olur.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          8. Uygulanacak Hukuk ve Yetki
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Kullanım Koşulları Türkiye Cumhuriyeti hukukuna tabidir; uyuşmazlıklarda
          Manisa Mahkemeleri ve İcra Daireleri yetkilidir, tüketici sıfatını haiz kişilerin
          kanundan doğan seçimlik hakları saklıdır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">9. İletişim</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Kullanım Koşulları'na ilişkin sorular hello@otohafiza.com adresine
          iletilebilir.
        </p>
      </div>
    </main>
  );
}
