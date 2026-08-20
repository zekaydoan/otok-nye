import Link from "next/link";

export const metadata = {
  title: "Gizlilik Sözleşmesi",
};

// Bu sayfa, KVKK Aydınlatma Metni'nin (bkz. app/kvkk) hukuki, madde madde
// aydınlatma metnine ek olarak — ödeme sağlayıcımız iyzico'nun başvuru
// kriterlerinde ayrıca aradığı, "Gizlilik Sözleşmesi" başlıklı, sade dille
// yazılmış bağımsız bir özet sayfasıdır. İki belge arasında bir çelişki
// olması hâlinde KVKK Aydınlatma Metni esas alınır (bkz. aşağıdaki not) —
// İade Politikası'nın Mesafeli Satış Sözleşmesi'ne göre konumlandığı desenle
// aynı yaklaşım.
export default function GizlilikSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Gizlilik Sözleşmesi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Bu sayfa, OtoHafıza'yı kullanırken bilgilerinizin nasıl toplandığını ve
          kullanıldığını sade bir dille özetler. Kişisel verilerinizin işlenmesine ilişkin tam
          hukuki metin için{" "}
          <Link href="/kvkk" className="text-brand-600 underline">
            KVKK Aydınlatma Metni
          </Link>
          , çerez kullanımımız için{" "}
          <Link href="/cerez-politikasi" className="text-brand-600 underline">
            Çerez Politikası
          </Link>{" "}
          sayfalarına bakabilirsiniz; bu belgeler ile bu sayfa arasında çelişki olması hâlinde
          ilgili tam metin esas alınır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">1. Topladığımız Bilgiler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hesap açarken paylaştığınız firma/yetkili adı, e-posta ve telefon bilgileri;
          panelde oluşturduğunuz araç ve bakım kayıtları; ücretli bir plana geçtiğinizde
          faturalandırma için gereken bilgiler; platform güvenliği için tutulan IP adresi ve
          oturum kayıtları. Kart numaranız gibi hassas ödeme bilgileri bizim
          sunucularımıza hiç ulaşmaz (bkz. Bölüm 3).
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">2. Bilgileri Nasıl Kullanıyoruz</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bilgileriniz yalnızca hesabınızın çalışması (giriş, araç/bakım kaydı, QR etiket
          üretimi), faturalandırma, müşteri desteği, yasal yükümlülüklerin yerine getirilmesi
          ve hizmet kalitesinin iyileştirilmesi için kullanılır. Bilgileriniz hiçbir şekilde
          üçüncü taraflara pazarlama amacıyla satılmaz veya kiralanmaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          3. Ödeme Bilgilerinizin Güvenliği
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Etiket siparişi ve abonelik ödemeleriniz, PCI DSS uyumlu bir ödeme kuruluşu olan{" "}
          <strong>iyzico</strong> altyapısı üzerinden alınır. Kart numaranız, son kullanma
          tarihiniz ve CVC kodunuz doğrudan iyzico'nun güvenli sunucularına iletilir; bu
          bilgiler OtoHafıza sunucularında hiçbir zaman saklanmaz veya işlenmez. Bizim
          tarafımızda yalnızca ödemenin sonucu (başarılı/başarısız) ve iyzico'nun ürettiği
          işlem referans kodu tutulur.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Çerezler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sitemiz, oturumunuzu açık tutmak ve temel site istatistiklerini ölçmek için sınırlı
          sayıda çerez kullanır. Çerez türleri, süreleri ve tercihlerinizi nasıl
          yönetebileceğiniz{" "}
          <Link href="/cerez-politikasi" className="text-brand-600 underline">
            Çerez Politikası
          </Link>{" "}
          sayfasında ayrıntılı olarak anlatılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">5. Bilgi Paylaşımı</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bilgileriniz, hizmetin çalışması için gerekli ölçüde şu hizmet sağlayıcılarla
          paylaşılır: barındırma için Netlify, ödeme işlemleri için iyzico, e-posta bildirimleri
          için Resend ve (aktif olduğunda) bakım hatırlatmaları için Meta (WhatsApp Business
          API). Bu sağlayıcıların her biri kendi güvenlik ve gizlilik standartlarına tabidir;
          ayrıntılar için KVKK Aydınlatma Metni Bölüm 1.7'ye bakabilirsiniz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">6. Veri Güvenliği</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sitemizin tüm trafiği SSL/TLS ile şifrelenir. Şifreleriniz geri döndürülemez biçimde
          hashlenir, oturumlarınız şifreli (httpOnly) çerezlerle yönetilir ve giriş denemeleri
          hız sınırlamasıyla korunur. Bir hesap yalnızca kendi verilerine erişebilir; bu,
          arayüzde gizlemekten ibaret değil, sunucu tarafında her istekte doğrulanan bir
          kontroldür.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">7. Haklarınız</h2>
        <p className="mt-2 text-sm text-slate-600">
          6698 sayılı KVKK kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi
          talep etme, düzeltilmesini veya silinmesini isteme gibi haklara sahipsiniz. Bu
          hakların tam listesi ve nasıl kullanılacağı{" "}
          <Link href="/kvkk" className="text-brand-600 underline">
            KVKK Aydınlatma Metni
          </Link>{" "}
          Bölüm 3'te yer alır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">8. Değişiklikler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bu sayfada yapılacak önemli değişiklikler, sayfanın en üstündeki yürürlük
          tarihi/versiyon bilgisi güncellenerek yayınlanır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">9. İletişim</h2>
        <p className="mt-2 text-sm text-slate-600">
          Gizlilikle ilgili sorularınız için{" "}
          <a href="mailto:hello@otohafiza.com" className="text-brand-600 underline">
            hello@otohafiza.com
          </a>{" "}
          adresine yazabilirsiniz.
        </p>
      </div>
    </main>
  );
}
