import Link from "next/link";

export const metadata = {
  title: "SaaS Kullanım ve Lisans Sözleşmesi",
};

export default function SaasSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          SaaS Kullanım ve Lisans Sözleşmesi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Platform'a kayıt olan tüm Kullanıcılar (Bayiler) için ana sözleşme. Ekleri:{" "}
          <Link href="/kabul-edilebilir-kullanim-politikasi" className="text-brand-600 underline">
            Kabul Edilebilir Kullanım Politikası
          </Link>
          ,{" "}
          <Link href="/abonelik-politikasi" className="text-brand-600 underline">
            Abonelik, Ödeme, Yenileme, İptal ve İade Politikası
          </Link>
          ,{" "}
          <Link href="/kvkk" className="text-brand-600 underline">
            KVKK Aydınlatma Metni
          </Link>{" "}
          ve (fiziksel etiket veya ücretli plan satın alan tüketiciler için)
          <Link href="/mesafeli-satis-sozlesmesi" className="text-brand-600 underline">
            {" "}
            Mesafeli Satış Sözleşmesi
          </Link>
          .
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 1 — Taraflar</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu SaaS Kullanım ve Lisans Sözleşmesi ("Sözleşme"), bir tarafta merkezi Muradiye
          Mahallesi Zübeyde Hanım Cad. No:34/A Yunusemre/Manisa adresinde bulunan, 0751112521900001
          MERSİS numaralı, 24016 Ticaret Sicil numaralı, Mesir Vergi Dairesi'nin 7511125219 numaralı
          mükellefi Sarper Dijital Teknolojiler ve Kiralama A.Ş. ("OtoHafıza" veya "Şirket") ile diğer
          tarafta OtoHafıza platformuna ("Platform") kayıt olan gerçek veya tüzel kişi ("Kullanıcı" veya
          "Bayi") arasında, Kullanıcı'nın Platform'a kayıt olduğu veya Platform'u kullanmaya başladığı
          anda elektronik ortamda akdedilmiştir. Kullanıcı, işbu Sözleşme'yi kayıt sırasında elektronik
          ortamda onaylayarak, Sözleşme'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini
          beyan eder. Onayın teknik kaydı (tarih, saat, IP, sözleşme versiyonu ve içerik özeti/hash)
          Şirket tarafından ispat amacıyla saklanır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 2 — Tanımlar</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>"Platform":</strong> OtoHafıza markası altında otohafiza.com alan adında ve ileride
          yayınlanabilecek mobil uygulamalarda sunulan, araç bakım kaydı, QR etiket üretimi ve
          ilişkili hizmetleri kapsayan yazılım-hizmet (SaaS) ürünü.{" "}
          <strong>"Kullanıcı"/"Bayi":</strong> Platform'a kayıt olan oto servis/tamirci işletmesi veya
          yetkilisi. <strong>"Personel Hesabı":</strong> Bayi tarafından kendi hesabı altında
          oluşturulan alt kullanıcı hesabı. <strong>"Araç Sahibi":</strong> Bayi'nin Platform'a
          kaydını girdiği, Platform ile doğrudan sözleşme ilişkisi bulunmayan üçüncü kişi araç
          sahibi. <strong>"İçerik":</strong> Kullanıcı tarafından Platform'a girilen her türlü veri,
          kayıt, metin, fotoğraf ve dosya. <strong>"Fikri Varlıklar":</strong> Platform'un kaynak
          kodu, algoritmaları, veri tabanı mimarisi, API'leri, arayüz tasarımları, dokümantasyonu ve
          OtoHafıza markası. <strong>"Abonelik Planı":</strong> Ücretsiz, Pro, İşletme (aylık/yıllık)
          ve ileride sunulabilecek diğer plan seçenekleri. <strong>"Gizli Bilgi":</strong> Fikri
          Varlıklar dahil, Şirket'in bu Sözleşme kapsamında Kullanıcı'ya erişim sağladığı veya
          Kullanıcı'nın Platform kullanımı sırasında öğrendiği, kamuya açık olmayan her türlü ticari,
          teknik ve mali bilgi.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 3 — Sözleşmenin Konusu ve Kapsamı
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme, Şirket'in Platform üzerinden Kullanıcı'ya sunduğu hizmetlerin kullanım
          şartlarını, tarafların hak ve yükümlülüklerini, fikri mülkiyet ve lisans esaslarını,
          gizlilik ve veri koruma ilkelerini, sorumluluk sınırlarını ve sözleşmenin sona ermesine
          ilişkin hükümleri düzenler. Kabul Edilebilir Kullanım Politikası, Abonelik/Ödeme/İade
          Politikası, KVKK Aydınlatma Metni ve (satın alma anında ayrıca sunulan) Mesafeli Satış
          Sözleşmesi işbu Sözleşme'nin eki ve ayrılmaz parçasıdır. Ekler ile Sözleşme'nin ana gövdesi
          arasında çelişki bulunması hâlinde, konuya özgü hüküm içeren ek belge esas alınır; genel
          hükümlerde ise Sözleşme'nin ana gövdesi esas alınır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 4 — Hesap Oluşturma ve Kullanıcı Yükümlülükleri
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform'a kayıt olabilmek için Kullanıcı'nın fiil ehliyetine sahip, onsekiz yaşını
          doldurmuş gerçek kişi olması veya tüzel kişiyi temsile yetkili olması gerekir. Kullanıcı,
          kayıt sırasında verdiği bilgilerin doğru, güncel ve eksiksiz olduğunu taahhüt eder.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Hesap ve Şube Sınırlaması.</strong> Her Abonelik Planı, Şirket tarafından belirlenen
          azami araç ve personel sayısı ile sınırlıdır. Kullanıcı, tek bir hesabı, plan limitlerini
          aşacak şekilde birden fazla fiziki şube veya bağımsız işletme tarafından ortak kullanamaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Hesap Güvenliği.</strong> Kullanıcı, hesap bilgilerinin gizliliğinden ve hesabı
          altında gerçekleştirilen tüm işlemlerden sorumludur.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Personel Hesapları.</strong> Kullanıcı, kendi hesabı altında oluşturduğu Personel
          Hesaplarının Platform üzerindeki tüm eylemlerinden, bu eylemler kendi talimatı dışında
          gerçekleşmiş olsa dahi, Şirket'e karşı bizzat sorumludur.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Araç Sahibi Verileri.</strong> Kullanıcı, Platform'a bir Araç Sahibi'ne ait kişisel
          veri girmeden önce, ilgili Araç Sahibi'ni KVKK Aydınlatma Metni'nde belirtilen hususlarda
          bilgilendirmekle ve gerektiğinde açık rızasını almakla yükümlüdür; bu veriler bakımından
          veri sorumlusu sıfatı Kullanıcı'ya aittir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 5 — Fikri Mülkiyet ve Lisans
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform'a ilişkin tüm Fikri Varlıklar Şirket'in münhasır malıdır; Sözleşme, Fikri Varlıklar
          üzerinde Kullanıcı lehine hiçbir mülkiyet, ortak mülkiyet veya devir hakkı doğurmaz. Şirket,
          Kullanıcı'ya, Sözleşme süresince ve yalnızca satın alınan Abonelik Planı kapsamında,
          Platform'u kendi işletmesinin iç işleyişinde kullanmak üzere münhasır olmayan, devredilemez,
          alt lisans verilemez, geri alınabilir bir kullanım hakkı tanır. Kullanıcı'nın Platform'a
          girdiği İçerik'in mülkiyeti Kullanıcı'da (veya ilgili Araç Sahibi'nde) kalır; Kullanıcı,
          Şirket'e İçerik'i yalnızca hizmetin ifası, yedekleme, teknik destek ve hizmetin iyileştirilmesi
          amacıyla işleme hakkı tanır. Şirket, İçerik'ten türetilen anonim/toplulaştırılmış istatistiksel
          verileri, herhangi bir gerçek kişiyi tanımlamaksızın, ürün geliştirme ve iş analitiği
          amaçlarıyla serbestçe kullanabilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 6 — Yasaklı Kullanımlar</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı; Platform'un kaynak kodunu elde etmeye çalışmak veya tersine mühendislik yapmak,
          Platform'u kopyalamak veya türev ürün geliştirmek, API'lere yetkisiz erişim sağlamak veya
          otomatikleştirilmiş araçlarla toplu veri çekmek, güvenlik sistemlerini aşmaya çalışmak veya
          DDoS saldırısı düzenlemek, hesap bilgilerini üçüncü kişilerle paylaşmak (Personel Hesapları
          hariç) veya Platform'u hukuka aykırı kullanmak gibi eylemlerde bulunamaz; bu maddenin ihlali
          Madde 12 kapsamında derhal fesih sebebidir. Ayrıntılı kurallar{" "}
          <Link href="/kabul-edilebilir-kullanim-politikasi" className="text-brand-600 underline">
            Kabul Edilebilir Kullanım Politikası
          </Link>
          'nda düzenlenir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 7 — Abonelik, Ücretlendirme ve Ödeme
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Abonelik ücretleri, ödeme yöntemleri, otomatik yenileme, iptal ve iade esasları ayrı bir{" "}
          <Link href="/abonelik-politikasi" className="text-brand-600 underline">
            Abonelik, Ödeme, Yenileme, İptal ve İade Politikası
          </Link>
          'nda düzenlenir. Şirket, Abonelik Planı fiyatlarını değiştirme hakkını saklı tutar; fiyat
          değişiklikleri mevcut abonelik döneminde uygulanmaz, yalnızca bir sonraki yenileme
          döneminden itibaren geçerli olur ve Kullanıcı'ya önceden bildirilir. Ödemenin gecikmesi
          hâlinde Şirket, Kullanıcı'nın hesabını askıya alma hakkına sahiptir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 8 — Yapay Zekâ Özellikleri (Şarta Bağlı Hüküm)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme'nin yürürlüğe girdiği tarih itibarıyla Platform, herhangi bir üçüncü taraf
          yapay zekâ servisini kullanıcıya yönelik bir hizmet unsuru olarak sunmamaktadır. Şirket'in
          ileride Platform'a yapay zekâ destekli bir özellik eklemesi hâlinde, bu özelliğin kullanımı
          ayrı bir "Yapay Zekâ Kullanım Koşulları" ekinde düzenlenecek ve Kullanıcı'nın bu ek şartları
          ayrıca kabul etmesine bağlı olacaktır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 9 — Gizlilik ve Ticari Sır</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, Platform kullanımı sırasında erişim sağladığı Gizli Bilgi'yi yalnızca Platform'u
          kullanmak amacıyla kullanacağını, üçüncü kişilerle paylaşmayacağını kabul eder. Bu yükümlülük,
          Sözleşme sona erse dahi makul bir süre boyunca (ticari sır niteliğindeki bilgiler için
          süresiz) devam eder. Kullanıcı, Sözleşme süresince ve sona ermesinden itibaren bir (1) yıl
          boyunca, Platform kullanımı sırasında edindiği Gizli Bilgi'yi kullanarak doğrudan rakip bir
          ürün veya hizmet geliştiremez.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 10 — Kişisel Verilerin Korunması
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Taraflar, kişisel verilerin işlenmesi bakımından 6698 sayılı Kanun'a uygun hareket
          edeceklerini kabul eder. Kullanıcı'nın işlettiği hesap ve iletişim bilgileri bakımından veri
          sorumlusu Şirket'tir. Kullanıcı'nın Platform'a kaydettiği Araç Sahibi verileri bakımından
          veri sorumlusu Kullanıcı, Şirket ise teknik altyapı sağlayıcısı sıfatıyla veri işleyendir.
          Ayrıntılar{" "}
          <Link href="/kvkk" className="text-brand-600 underline">
            KVKK Aydınlatma Metni
          </Link>
          'nde düzenlenmiştir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 11 — Hizmet Seviyesi ve Sorumluluğun Sınırlandırılması
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Şirket, Platform'un kesintisiz ve hatasız çalışması için gerekli özeni gösterecek olup
          (best-effort), resmî bir kullanılabilirlik (uptime) taahhüdü vermemektedir. Platform,
          "olduğu gibi" ve "mevcut olduğu şekliyle" sunulur; Şirket, açıkça belirtilenler dışında,
          Platform'un belirli bir amaca uygunluğuna veya kesintisizliğine ilişkin zımni herhangi bir
          garanti vermez. Şirket'in işbu Sözleşme'den doğan toplam sorumluluğu, her hâlükârda, zararın
          doğduğu olay tarihinden geriye dönük son oniki (12) ay içinde Kullanıcı tarafından fiilen
          ödenmiş abonelik bedeli toplamı ile sınırlıdır. Bu sınırlama, Şirket'in kastından veya ağır
          ihmalinden kaynaklanan zararlar ile Türk Borçlar Kanunu m.115 uyarınca sınırlandırılması
          mümkün olmayan sorumluluk hâllerine uygulanmaz. Şirket, hiçbir hâlde dolaylı zararlardan
          (kâr kaybı, iş fırsatı kaybı gibi) sorumlu tutulamaz; bu istisna da kasıt/ağır ihmal
          hâllerini kapsamaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Tazminat (İndemnifikasyon).</strong> Kullanıcı; İçeriği (özellikle Araç Sahibi
          verilerini) hukuka aykırı şekilde Platform'a girmesinden, Madde 6'daki yasaklı
          kullanımlardan, Araç Sahibi'ni bilgilendirme/açık rıza alma yükümlülüğünü yerine
          getirmemesinden veya işbu Sözleşme'yi ihlalinden doğan ve üçüncü kişilerce Şirket'e
          yöneltilen her türlü talep, dava, idari para cezası ve masrafa karşı Şirket'i tazmin eder.
          Bu yükümlülük, Şirket'in kendi kastından veya ağır ihmalinden doğan sorumluluğu kapsamaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 12 — Sözleşmenin Süresi ve Sona Ermesi
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme, Kullanıcı'nın hesap oluşturduğu tarihte yürürlüğe girer. Kullanıcı, hesabını
          dilediği zaman kapatabilir. Şirket; ödeme yükümlülüğünün yerine getirilmemesi, yasaklı
          kullanımlardan biri, hesap/şube sınırlamasının ihlali veya Sözleşme'nin esaslı şekilde ihlali
          hâllerinde hesabı askıya alabilir veya feshedebilir. Sözleşme'nin sona ermesini takip eden
          otuz (30) gün içinde Kullanıcı İçeriğini dışa aktarabilir; bu sürenin sonunda Şirket verileri
          KVKK Aydınlatma Metni'ndeki esaslara göre siler veya anonim hâle getirir. Şirket, Platform'u
          tamamen durdurma kararı alması hâlinde, bu durumu Kullanıcılara en az doksan (90) gün önceden
          bildirir; cari dönem için önceden ödenmiş ancak henüz ifa edilmemiş abonelik bedelleri
          Kullanıcı'ya iade edilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 13 — Muhtelif Hükümler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, Sözleşme'den doğan hak ve yükümlülüklerini Şirket'in yazılı onayı olmaksızın
          üçüncü kişilere devredemez. Şirket, Sözleşme ve eklerini önceden makul bir süre bildirimde
          bulunarak güncelleme hakkını saklı tutar; güncellenmiş şartların yürürlüğe girmesinden sonra
          Platform'un kullanılmaya devam edilmesi kabul anlamına gelir. Sözleşme'nin herhangi bir
          hükmünün geçersiz sayılması, geri kalan hükümlerin geçerliliğini etkilemez. İşbu Sözleşme ve
          ekleri, taraflar arasındaki anlaşmanın tamamını oluşturur; Platform'un satışı veya tanıtımı
          sırasında (Saha Partner dahil) yetkisiz kişilerce yapılan, Sözleşme'de yer almayan sözlü
          beyanlar Şirket'i bağlamaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 14 — Uygulanacak Hukuk ve Uyuşmazlıkların Çözümü
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda dava açılmadan önce
          zorunlu arabuluculuğa başvurulması esastır. Uyuşmazlıkların çözümünde Manisa Mahkemeleri ve
          İcra Daireleri yetkilidir; ancak Kullanıcı'nın 6502 sayılı Kanun anlamında tüketici sıfatını
          haiz olması hâlinde, Kullanıcı dilerse kendi yerleşim yeri Tüketici Hakem Heyeti'ne veya
          Tüketici Mahkemesi'ne de başvurabilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 15 — Yürürlük</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme, Kullanıcı'nın Platform'a kayıt olurken ilgili onay kutucuğunu işaretlemesi
          ile birlikte elektronik ortamda akdedilmiş ve yürürlüğe girmiştir.
        </p>
      </div>
    </main>
  );
}
