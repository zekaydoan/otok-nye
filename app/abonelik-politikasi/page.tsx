import Link from "next/link";

export const metadata = {
  title: "Abonelik, Ödeme, Yenileme, İptal ve İade Politikası",
};

export default function AbonelikPolitikasiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Abonelik, Ödeme, Yenileme, İptal ve İade Politikası
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 24 Ağustos 2026 · Versiyon: v1.1
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <Link href="/saas-sozlesmesi" className="text-brand-600 underline">
            SaaS Kullanım ve Lisans Sözleşmesi
          </Link>
          'nin ekidir. Etiket satın alımı gibi fiziksel ürünlerin iade/cayma esasları için{" "}
          <Link href="/iade-politikasi" className="text-brand-600 underline">
            İade Politikası
          </Link>
          'na bakınız.
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          "14 gün içinde iade" talebi iki ayrı temelde ele alınmıştır: Mesafeli Sözleşmeler
          Yönetmeliği'nde dijital hizmetlerde tüketicinin anında ifayı onaylaması hâlinde yasal
          cayma hakkının düşebileceği bir istisna bulunduğundan, bu yasal haktan bağımsız,
          gönüllü bir "memnuniyet garantisi" ayrıca sunulur (bkz. Madde 8).
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 1 — Amaç ve Kapsam</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Politika, Platform'un ücretli Abonelik Planları'na ilişkin ücretlendirme, ödeme,
          otomatik yenileme, iptal ve iade esaslarını düzenler.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 2 — Abonelik Planları</h2>
        <p className="mt-2 text-sm text-slate-600">
          Platform'un güncel Abonelik Planları, kapsadıkları araç/personel limitleri ve fiyatları{" "}
          <Link href="/#fiyatlandirma" className="text-brand-600 underline">
            fiyatlandırma sayfasında
          </Link>{" "}
          ilan edilir ve bağlayıcıdır. Abonelik Planları aylık veya yıllık faturalandırma
          döngüsünde sunulabilir; yıllık planlardaki kampanya/indirim koşulları ilgili plan
          sayfasında ayrıca belirtilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 3 — Ücretlendirme ve Fiyat Değişikliği
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Fiyat değişiklikleri cari dönemde uygulanmaz, yalnızca bir sonraki yenileme döneminden
          itibaren geçerli olur ve önceden bildirilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 4 — Ödeme Yöntemi ve Tahsilat
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Ödemeler, Şirket'in yetkilendirdiği ödeme kuruluşu (iyzico) altyapısı üzerinden tahsil
          edilir. Kredi/banka kartı bilgileri Şirket sunucularında saklanmaz; işlem doğrudan
          ödeme kuruluşunun PCI-DSS uyumlu altyapısında gerçekleşir. Kullanıcı, fatura
          kesilebilmesi için gerekli fatura bilgilerini (bireysel için T.C. Kimlik No, kurumsal
          için unvan/vergi dairesi/vergi numarası) eksiksiz ve doğru şekilde sağlamakla
          yükümlüdür.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 5 — Otomatik Yenileme</h2>
        <p className="mt-2 text-sm text-slate-600">
          Ücretli Abonelik Planları, aksi Kullanıcı tarafından iptal edilmedikçe, dönem sonunda
          seçilen faturalandırma döngüsüne (aylık/yıllık) göre otomatik olarak yenilenir ve
          kayıtlı ödeme yöntemi üzerinden tahsilat yapılır. Otomatik yenileme, Kullanıcı'nın
          ücretli plana ilk kez geçtiği anda, ilgili onay adımında ayrıca ve açıkça
          bilgilendirilerek kabul ettirilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 6 — İptal</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, otomatik yenilemeyi dilediği zaman, cari dönem sona ermeden önce, panel
          üzerinden veya hello@otohafiza.com üzerinden iptal edebilir. İptal, cari faturalandırma
          döneminin sonuna kadar hizmet erişimini etkilemez; dönem sonunda hesap otomatik olarak
          Ücretsiz Plan'a döner.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 7 — Cayma Hakkı</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı tüketici sıfatını haiz bir gerçek kişi ise, Mesafeli Sözleşmeler Yönetmeliği
          uyarınca on dört (14) gün içinde gerekçe göstermeksizin cayma hakkına sahiptir. Ancak,
          Platform'a erişimin satın alma anında derhal başlaması ve Kullanıcı'nın satın alma
          sırasında hizmetin anında ifasına açıkça onay vererek cayma hakkının bu ifayla birlikte
          sona ereceğini kabul etmesi hâlinde, ilgili mevzuat uyarınca cayma hakkı kullanılamaz
          hâle gelebilir; bu onay ödeme adımında ayrıca ve açıkça alınır. Cayma hakkının
          uygulanabilirliği ve istisnaları, satın alma anında sunulan{" "}
          <Link href="/mesafeli-satis-sozlesmesi" className="text-brand-600 underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          'nde somut olarak düzenlenir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 8 — Gönüllü İade Taahhüdü (Memnuniyet Garantisi)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Madde 7'deki yasal cayma hakkından bağımsız olarak Şirket, ilk kez ücretli plana geçen
          Kullanıcı'ya, satın alma tarihinden itibaren on dört (14) gün içinde talep etmesi
          hâlinde bedeli iade etme taahhüdünü ticari bir taahhüt olarak verir. Bu taahhüt,
          hizmetin kötüye kullanılması (ör. planın sağladığı limitlerin tamamının kullanılıp
          ardından iade talep edilmesi, tekrarlayan iade talepleri) hâlinde Şirket tarafından
          makul gerekçeyle reddedilebilir; bu husus Şirket'in takdirindedir ve Madde 7'deki yasal
          cayma hakkını etkilemez. İade, ödemenin yapıldığı yönteme, tahsilat tarihinden itibaren
          azami on (10) iş günü içinde yapılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 9 — Gecikmiş veya Başarısız Ödeme
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Otomatik yenileme sırasında tahsilatın başarısız olması hâlinde Şirket, Kullanıcı'yı
          bilgilendirir ve ödemenin tamamlanması için makul bir süre (asgari üç (3) gün) tanır.
          Bu süre içinde ödeme tamamlanmazsa hesap askıya alınır; Kullanıcı'nın İçeriği silinmez,
          yalnızca ücretli plan özelliklerine erişim durdurulur. Askıya alma durumunun kesintisiz
          otuz (30) günü aşması hâlinde Şirket, hesabı Ücretsiz Plan limitlerine göre otomatik
          olarak yeniden düzenleme hakkını saklı tutar.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 10 — Plan Değişikliği</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, planını yükseltebilir veya düşürebilir. Plan düşürme, cari dönem sonunda
          uygulanır; cari dönem için önceden ödenmiş bedel bu değişiklikten etkilenmez.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 11 — Muhtelif</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Politika, SaaS Kullanım ve Lisans Sözleşmesi'nin ekidir; işbu Politika ile Ana
          Sözleşme arasında çelişki bulunması hâlinde, ödeme/abonelik konularında işbu Politika,
          diğer tüm konularda Ana Sözleşme esas alınır.
        </p>
      </div>
    </main>
  );
}
