import Link from "next/link";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          KVKK Aydınlatma Metni ve Gizlilik Esasları
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v2.0
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
          bilgilendirme amacıyla hazırlanmıştır. Yurt dışı veri aktarımına ilişkin bölüm
          (1.6), 7499 sayılı Kanun ile değişen KVKK m.9 ve Kurul'un güncel düzenlemeleri
          esas alınarak hazırlanmıştır; Netlify/Resend ile KVKK-uyumlu bir "standart
          sözleşme" imzalanana kadar bu alanın bir KVKK danışmanı tarafından periyodik
          olarak teyit edilmesi önerilir.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          1. Platform Kullanıcıları (Tamirci/Servis Hesapları) İçin Aydınlatma Metni
        </h2>

        <h3 className="mt-4 font-semibold text-slate-800">1.1 Veri Sorumlusu</h3>
        <p className="mt-2 text-sm text-slate-600">
          İşbu aydınlatma metni, Sarper Dijital Teknolojiler ve Kiralama A.Ş. ("OtoHafıza",
          "Platform") tarafından, KVKK'nın 10. maddesi uyarınca veri sorumlusu sıfatıyla
          hazırlanmıştır. İletişim: hello@otohafiza.com, Muradiye Mahallesi Zübeyde Hanım
          Cad. No:34/A Yunusemre/Manisa, +90 542 575 69 18.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.2 İşlenen Kişisel Veriler</h3>
        <p className="mt-2 text-sm text-slate-600">
          Hesap oluştururken paylaştığınız kimlik ve iletişim bilgileri (firma/yetkili adı,
          e-posta, telefon), şifrenizin şifrelenmiş (hash) hâli, kullandığınız plan/abonelik
          bilgisi, platform üzerinde oluşturduğunuz araç/bakım kayıtları, faturalandırma
          amacıyla paylaştığınız fatura bilgileri (bireysel fatura için T.C. Kimlik
          Numarası, kurumsal fatura için vergi dairesi/vergi numarası ve adres) ve platform
          güvenliği ile sözleşme ispatı amacıyla tutulan teknik veriler (IP adresi,
          oturum/işlem logları, sözleşme onay kayıtları — versiyon, tarih, onay yöntemi)
          işlenmektedir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.3 İşleme Amaçları</h3>
        <p className="mt-2 text-sm text-slate-600">
          Hesabınızın oluşturulması ve kimlik doğrulaması, hizmetin sunulması (araç/bakım
          kaydı, QR etiket üretimi), abonelik ve faturalandırma süreçlerinin (e-fatura/e-arşiv
          mevzuatına uyum dahil) yürütülmesi, müşteri desteği sağlanması, sözleşmesel
          onayların ispatlanabilmesi, yasal yükümlülüklerin yerine getirilmesi ve hizmet
          kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.4 Hukuki Sebep</h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz, KVKK m.5/2 kapsamında bir sözleşmenin kurulması veya ifasıyla doğrudan
          ilgili olması, hukuki yükümlülüğün yerine getirilmesi ve meşru menfaat hukuki
          sebeplerine dayanılarak işlenmektedir. Yurt dışına aktarım söz konusu olduğunda
          (bkz. 1.6), aktarım öncelikle KVKK m.9'daki uygun güvence mekanizmalarına, bunların
          tesis edilemediği ölçüde ise ayrıca alınan açık rızanıza dayanır.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.5 Saklama Süresi</h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz, kategorisine göre farklılaştırılmış sürelerle saklanır: hesap ve
          kullanım verileriniz, hesabınız kapatıldıktan sonra 6 (altı) ay içinde silinir, yok
          edilir veya anonim hâle getirilir; fatura ve muhasebe kayıtlarınız 213 sayılı Vergi
          Usul Kanunu ve 6102 sayılı Türk Ticaret Kanunu gereği kanunen öngörülen asgari süre
          boyunca saklanır; sözleşme onayına ilişkin teknik kayıtlar, olası uyuşmazlıklarda
          ispat amacıyla ilgili zamanaşımı süreleri boyunca saklanabilir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.6 Yurt Dışına Veri Aktarımı</h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz, teknik altyapı sağlayıcılarımız aracılığıyla yurt dışında (Amerika
          Birleşik Devletleri merkezli barındırma ve e-posta altyapısı sağlayıcıları —
          Netlify, Resend) işlenebilmektedir. 7499 sayılı Kanun ile değişen KVKK m.9 uyarınca
          bu aktarımlarda öncelik sırası: (a) Kurul'un "yeterli koruma" ilan ettiği bir
          ülkeye aktarım, (b) böyle bir karar yoksa Kurul'a bildirilen bir standart sözleşme
          veya taahhütname gibi uygun güvence mekanizmasının tesisi, (c) bunlardan hiçbiri
          mümkün olmadığında, aktarımın arızi (süreklilik arz etmeyen) nitelikte olması ve
          olası riskler hakkında bilgilendirilmeniz kaydıyla açık rızanızın alınmasıdır.
          Şirket, (b) bendindeki standart sözleşme mekanizmasını ilgili sağlayıcılarla tesis
          etme çalışmalarını sürdürmektedir; bu süreç tamamlanana kadar, kayıt sırasında ayrı
          bir onay kutucuğuyla alınan açık rızanız aktarımın hukuki dayanağı olarak
          kullanılır.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">
          1.7 Veri Aktarılan Üçüncü Kişiler
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz; barındırma ve teknik altyapı için Netlify, ödeme/abonelik işlemleri
          için iyzico, e-posta bildirimleri için Resend ve (aktif hâle geldiğinde) bildirim
          hizmeti için Meta (WhatsApp Business API) ile, yalnızca hizmetin ifası için gerekli
          ölçüde paylaşılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          2. Araç Sahipleri İçin Aydınlatma Metni
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Platformu kullanan servisler, araç sahiplerinin plaka, ad/soyad ve telefon
          numarası gibi bilgilerini sisteme kaydeder. Bu kayıt işleminde{" "}
          <strong>veri sorumlusu, ilgili bilgileri sisteme giren servistir</strong>;
          OtoHafıza bu veriler bakımından teknik altyapı sağlayıcısı (veri işleyen)
          konumundadır. Servislerin, araç sahiplerini aşağıdaki hususlarda bilgilendirmesi
          ve gerekli hâllerde açık rızasını alması gerekir:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Plaka, marka, model ve bakım geçmişi bilgilerinin dijital ortamda saklandığı,</li>
          <li>
            Araca yapıştırılan QR kod okutulduğunda bu bilgilerin görüntülenebildiği
            (plaka, marka, model ve bakım geçmişi görünür; araç sahibinin adı/telefonu QR
            sayfasında gösterilmez),
          </li>
          <li>
            Paylaşılan telefon numarasının, periyodik bakım hatırlatma amacıyla WhatsApp
            mesajı göndermek için kullanılabileceği,
          </li>
          <li>
            Aracın başka bir yetkili serviste bakım görmesi hâlinde, o servisin de aynı
            kayda yeni bakım girişi ekleyebileceği.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Araç ekleme formundaki onay kutusu, servisin bu bilgilendirmeyi yaptığını beyan
          etmesi içindir; nihai sorumluluk KVKK m.10 kapsamında veri sorumlusu sıfatıyla
          servise aittir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">3. İlgili Kişi Hakları</h2>
        <p className="mt-2 text-sm text-slate-600">
          KVKK'nın 11. maddesi uyarınca herkes; kişisel verisinin işlenip işlenmediğini
          öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt
          içinde/dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse
          düzeltilmesini isteme, silinmesini/yok edilmesini isteme, yapılan işlemlerin
          ilgili üçüncü kişilere bildirilmesini isteme, otomatik sistemlerle analiz nedeniyle
          aleyhe sonuç çıkmasına itiraz etme ve zararın giderilmesini talep etme haklarına
          sahiptir.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Talepleriniz hello@otohafiza.com adresine veya Muradiye Mahallesi Zübeyde Hanım Cad.
          No:34/A Yunusemre/Manisa adresine yazılı olarak iletilebilir; talebiniz KVKK m.13/2
          uyarınca en geç otuz (30) gün içinde ücretsiz olarak sonuçlandırılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Veri Güvenliği</h2>
        <p className="mt-2 text-sm text-slate-600">
          Şifreleriniz geri döndürülemez biçimde hashlenir, oturumlarınız şifreli (httpOnly)
          çerezlerle yönetilir, giriş denemeleri hız sınırlamasıyla (rate limiting) korunur
          ve tüm trafik SSL/TLS ile şifrelenir. Verileriniz bulut altyapısında (Netlify)
          barındırılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          5. Açık Rıza ve Onay Yönetimi
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Kayıt sırasında; (a) sözleşme kabulü, (b) işbu aydınlatma metninin okunduğunun
          teyidi, (c) yurt dışına veri aktarımına açık rıza ve (d) pazarlama izni (varsa)
          ayrı ayrı ve bağımsız onay kutucuklarıyla alınır; hiçbiri varsayılan olarak
          işaretli gelmez ve tek bir kutucuğa gömülmez.
        </p>
      </div>
    </main>
  );
}
