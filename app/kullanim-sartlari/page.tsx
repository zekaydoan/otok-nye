import Link from "next/link";

export const metadata = {
  title: "Kullanım Şartları | OtoHafıza",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Kullanım Şartları</h1>
        <p className="mt-2 text-sm text-slate-500">Son güncelleme: Ağustos 2026</p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Bu metin, OtoHafıza hizmetinin kullanım koşullarını genel hatlarıyla açıklayan
          bir <strong>şablondur</strong>. Yayına almadan önce köşeli parantez içindeki
          alanları ([ ]) kendi işletme bilgilerinizle doldurmanız ve metni bir hukuk
          danışmanına onaylatmanız önerilir. Bu içerik hukuki tavsiye niteliği taşımaz.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">1. Hizmetin Tanımı</h2>
        <p className="mt-2 text-sm text-slate-600">
          OtoHafıza ("Platform"), [Firma Unvanınız] tarafından işletilen; araçlara
          yapıştırılan QR etiketleri aracılığıyla yağ bakım geçmişinin dijital olarak
          kaydedilmesini ve görüntülenmesini sağlayan bir SaaS (hizmet olarak yazılım)
          uygulamasıdır. Platform, oto tamircileri ve servisler ("Bayi") tarafından
          kullanılmak üzere tasarlanmıştır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">2. Hesap Açma ve Sorumluluklar</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hesap oluşturarak verdiğiniz bilgilerin doğru ve güncel olduğunu kabul edersiniz.
          Hesap kimlik bilgilerinizin (e-posta/şifre) gizliliğinden ve hesabınız üzerinden
          gerçekleştirilen tüm işlemlerden siz sorumlusunuz. Şüpheli bir erişim fark
          ederseniz şifrenizi derhal değiştirmeniz ve bizimle iletişime geçmeniz gerekir.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Araç sahiplerinin kişisel verilerini sisteme girerken KVKK Aydınlatma Metni'nde
          belirtilen bilgilendirme yükümlülüklerini yerine getirmek Bayi'nin sorumluluğundadır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">3. Abonelik ve Ödeme</h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform, farklı kullanım limitlerine sahip ücretsiz ve ücretli planlar sunar.
          Ücretli planlara ilişkin bedeller, seçtiğiniz plan sayfasında belirtilir ve
          vergiler dahildir/hariçtir [seçiniz]. Abonelik dönemi içinde plan değişikliği
          yapabilir veya aboneliğinizi panelden iptal edebilirsiniz; iptal, o an geçerli
          fatura döneminin sonunda yürürlüğe girer.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Etiket Mağazası Siparişleri</h2>
        <p className="mt-2 text-sm text-slate-600">
          Fiziksel QR etiket siparişleri, ödeme onayı sonrası üretime alınır ve panelden
          durumu takip edilebilir. Sipariş, ödeme ve iade koşullarının ayrıntıları için{" "}
          <Link href="/mesafeli-satis-sozlesmesi" className="text-brand-600 underline">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          geçerlidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">5. Fikri Mülkiyet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform'un yazılımı, tasarımı, logosu ve marka unsurları [Firma Unvanınız]'a
          aittir. Sisteme girdiğiniz araç ve bakım kayıtlarının mülkiyeti size/müşterilerinize
          aittir; Platform bu verileri yalnızca hizmetin sunulması amacıyla işler.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">6. Hizmetin Kullanılabilirliği</h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform'u makul bir çalışma süresiyle (uptime) sunmak için özen gösteririz,
          ancak bakım, üçüncü taraf altyapı sağlayıcı kesintileri veya mücbir sebepler
          nedeniyle zaman zaman erişim kesintileri yaşanabilir. Bu kesintilerden doğan
          dolaylı zararlardan sorumlu tutulamayız.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">7. Sorumluluğun Sınırlandırılması</h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform, mevcut haliyle ("as is") sunulur. Yasaların izin verdiği azami ölçüde,
          hizmetin kullanımından doğabilecek dolaylı, arızi veya sonuç niteliğindeki
          zararlardan sorumlu değiliz. Sorumluluğumuz, varsa, ilgili fatura döneminde
          ödediğiniz abonelik bedeli ile sınırlıdır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">8. Fesih</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hesabınızı dilediğiniz zaman panelden kapatabilirsiniz. Bu şartların ihlali
          hâlinde hesabınızı askıya alma veya sonlandırma hakkımız saklıdır. Fesih
          sonrasında verilerinizin saklanma/silinme süreci KVKK Aydınlatma Metni'nde
          açıklanan sürelere tabidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">9. Değişiklikler</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bu şartları zaman zaman güncelleyebiliriz; önemli değişikliklerde sizi panel
          üzerinden veya e-posta ile bilgilendiririz. Güncellenmiş şartları kullanmaya
          devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">10. Uygulanacak Hukuk</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda [Şehir]
          Mahkemeleri ve İcra Daireleri yetkilidir. Sorularınız için [E-posta] adresinden
          bize ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
