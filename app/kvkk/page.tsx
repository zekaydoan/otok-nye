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
          Son güncelleme: Ağustos 2026
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
          bilgilendirme amacıyla hazırlanmıştır. Firma unvanı ve e-posta bilgileri
          doldurulmuştur; yalnızca açık adres ve telefon bilgileri (aşağıda vurgulu
          alanlarda) eklenmeyi bekliyor. Yayına tam olarak hazır hâle getirmeden önce metni
          bir hukuk danışmanına onaylatmanız önerilir. Bu içerik hukuki tavsiye niteliği
          taşımaz.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          1. Platform Kullanıcıları (Tamirci/Servis Hesapları) İçin Aydınlatma Metni
        </h2>

        <h3 className="mt-4 font-semibold text-slate-800">1.1 Veri Sorumlusu</h3>
        <p className="mt-2 text-sm text-slate-600">
          İşbu aydınlatma metni, SARPER DİJİTAL TEKNOLOJİLER VE KİRALAMA A.Ş. ("OtoHafıza",
          "Platform") tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK")
          10. maddesi uyarınca veri sorumlusu sıfatıyla hazırlanmıştır. İletişim:
          hello@otohafiza.com{" "}
          <span className="rounded bg-amber-100 px-1 text-amber-700">[Adres bekleniyor]</span>,{" "}
          <span className="rounded bg-amber-100 px-1 text-amber-700">[Telefon bekleniyor]</span>.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.2 İşlenen Kişisel Veriler</h3>
        <p className="mt-2 text-sm text-slate-600">
          Hesap oluştururken paylaştığınız kimlik ve iletişim bilgileri (firma/yetkili adı,
          e-posta, telefon), şifrenizin şifrelenmiş (hash) hâli, kullandığınız plan/abonelik
          bilgisi ve platform üzerinde oluşturduğunuz araç/bakım kayıtları işlenmektedir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.3 İşleme Amaçları</h3>
        <p className="mt-2 text-sm text-slate-600">
          Hesabınızın oluşturulması ve kimlik doğrulaması, hizmetin sunulması (araç/bakım
          kaydı, QR etiket üretimi), abonelik ve faturalandırma süreçlerinin yürütülmesi,
          müşteri desteği sağlanması, yasal yükümlülüklerin yerine getirilmesi ve hizmet
          kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.4 Hukuki Sebep</h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz, KVKK m.5/2 kapsamında bir sözleşmenin kurulması veya ifasıyla doğrudan
          ilgili olması, hukuki yükümlülüğün yerine getirilmesi ve meşru menfaat hukuki
          sebeplerine dayanılarak işlenmektedir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">1.5 Saklama Süresi</h3>
        <p className="mt-2 text-sm text-slate-600">
          Verileriniz, hesabınız aktif olduğu sürece ve hesap kapatıldıktan sonra ilgili
          mevzuatta öngörülen zamanaşımı süreleri boyunca (genel olarak azami 10 yıl)
          saklanır, süre sonunda silinir, yok edilir veya anonim hâle getirilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          2. Araç Sahipleri İçin Aydınlatma Metni
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Platformu kullanan servisler, araç sahiplerinin plaka, ad/soyad ve telefon
          numarası gibi bilgilerini sisteme kaydeder. Bu kayıt işleminde{" "}
          <strong>veri sorumlusu, ilgili bilgileri sisteme giren servistir</strong>; Yağ
          Bakım Defteri bu veriler bakımından teknik altyapı sağlayıcısı (veri işleyen)
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
          öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına
          uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/dışında aktarıldığı üçüncü
          kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, KVKK'da öngörülen
          şartlarda silinmesini/yok edilmesini isteme, yapılan işlemlerin ilgili üçüncü
          kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi
          nedeniyle aleyhe bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı
          işlenme sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme
          haklarına sahiptir.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Taleplerinizi hello@otohafiza.com adresine veya{" "}
          <span className="rounded bg-amber-100 px-1 text-amber-700">[Adres bekleniyor]</span>{" "}
          adresine yazılı olarak iletebilirsiniz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Veri Güvenliği</h2>
        <p className="mt-2 text-sm text-slate-600">
          Şifreleriniz geri döndürülemez biçimde hashlenir, oturumlarınız şifreli
          (httpOnly) çerezlerle yönetilir ve tüm trafik SSL/TLS ile korunur. Verileriniz
          bulut altyapısında (Netlify) barındırılır.
        </p>
      </div>
    </main>
  );
}
