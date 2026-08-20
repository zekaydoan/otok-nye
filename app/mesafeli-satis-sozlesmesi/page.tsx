import Link from "next/link";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi",
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Mesafeli Satış Sözleşmesi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Tek sözleşme, satın aldığınız ürün/hizmet türüne göre iki ek içerir: Ek-A
          (fiziksel QR etiket) ve Ek-B (dijital abonelik hizmeti).
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Bölüm I — Genel Hükümler</h2>

        <h3 className="mt-4 font-semibold text-slate-800">Madde 1 — Taraflar</h3>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Satıcı:</strong> Sarper Dijital Teknolojiler ve Kiralama A.Ş., Muradiye
          Mahallesi Zübeyde Hanım Cad. No:34/A Yunusemre/Manisa, Mesir Vergi Dairesi — VKN
          7511125219, Mersis No 0751112521900001, Ticaret Sicil No 24016, hello@otohafiza.com,
          +90 542 575 69 18 ("Satıcı").
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Alıcı:</strong> OtoHafıza panelinde oturum açmış, sipariş/satın alma
          formunda beyanda bulunan Kullanıcı ("Alıcı").
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">Madde 2 — Sözleşmenin Konusu</h3>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme, Alıcı'nın Platform üzerinden elektronik ortamda satın aldığı (a)
          fiziksel dayanıklı QR etiket ürünü veya (b) dijital abonelik hizmetine ilişkin
          tarafların 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamındaki hak
          ve yükümlülüklerini düzenler. Satın alınan ürün/hizmet türüne göre Bölüm II (Ek-A)
          veya Bölüm III (Ek-B) hükümleri uygulanır.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">Madde 3 — Ödeme</h3>
        <p className="mt-2 text-sm text-slate-600">
          Ödeme, iyzico ödeme altyapısı üzerinden, sipariş/satın alma onayı sırasında
          gösterilen ve kart ekstresine yansıyan tutar üzerinden tahsil edilir. Fiyatlara KDV
          dahildir. Kart bilgileri Satıcı sunucularında saklanmaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Satıcı, ödemenin bankası/kart kuruluşu tarafından geri alınması (chargeback),
          dolandırıcılık şüphesi veya ödeme kuruluşunun onay vermemesi hâllerinde, siparişi
          iptal etme ve/veya teslimatı durdurma hakkını saklı tutar; bu durum Alıcı'ya
          bildirilir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">
          Madde 4 — Mücbir Sebep ve Sorumluluk
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Doğal afet, yangın, grev, altyapı sağlayıcısı kesintisi gibi Satıcı'nın makul
          kontrolü dışındaki hâllerde ifa süresi uzayabilir; Satıcı bu durumu Alıcı'ya
          bildirir. Mücbir sebep hâlinin makul olmayan bir süre (Ek-A bakımından otuz (30)
          günü aşan) devam etmesi hâlinde Alıcı sözleşmeyi feshedebilir; bu durumda ödenen
          bedel, varsa ifa edilmemiş kısmıyla orantılı olarak Alıcı'ya iade edilir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">
          Madde 5 — Uyuşmazlıkların Çözümü
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme'den doğan uyuşmazlıklarda, mevzuatta öngörülen parasal sınırlar
          dahilinde Tüketici Hakem Heyetleri, bu sınırların üzerindeki uyuşmazlıklarda
          Manisa Tüketici Mahkemeleri/Ticaret Mahkemeleri yetkilidir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">Madde 6 — Ön Bilgilendirme</h3>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme'nin kurulmasından önce Alıcı'ya, satın alma ekranında; ürün/hizmetin
          temel nitelikleri, toplam bedeli, ödeme ve teslimat/ifa şekli, cayma hakkının
          süresi ve kullanım şartları (varsa istisnaları) hakkında Mesafeli Sözleşmeler
          Yönetmeliği m.5 uyarınca ön bilgilendirme yapılır ve Alıcı bu bilgilendirmeyi teyit
          ettikten sonra ödeme adımına geçebilir.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">Madde 7 — Yürürlük</h3>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı, ilgili satın alma ekranındaki onay kutusunu işaretleyip ödemeyi
          tamamladığında, satın aldığı ürün/hizmete uygulanan ek (Ek-A veya Ek-B) dahil işbu
          Sözleşme'nin tüm hükümlerini elektronik ortamda kabul etmiş sayılır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Bölüm II — Ek-A: Fiziksel Ürün Siparişi (Dayanıklı QR Etiket)
        </h2>

        <h3 className="mt-4 font-semibold text-slate-800">A.1 — Ürün ve Teslimat</h3>
        <p className="mt-2 text-sm text-slate-600">
          Ürün, motor bölmesi gibi zorlu koşullara dayanıklı (su geçirmez, UV korumalı)
          profesyonel basılmış QR etikettir. Ürün, Alıcı'nın beyan ettiği teslimat adresine,
          ödemenin onaylanmasını takip eden hedef olarak üç (3) iş günü içinde kargoya
          verilir; yasal azami teslim süresi otuz (30) gündür.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı'nın hatalı/eksik adres beyanı nedeniyle teslimatın gerçekleştirilememesi
          hâlinde yeniden gönderim masrafı Alıcı'ya aittir. Kargo firması kaynaklı kayıp/hasar
          hâllerinde Satıcı, makul süre içinde Ürün'ü yeniden gönderir veya bedeli iade eder.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">A.2 — Cayma Hakkı</h3>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı, Ürünü teslim aldığı tarihten itibaren on dört (14) gün içinde, gerekçe
          göstermeksizin cayma hakkına sahiptir. Cayma hakkının kullanılabilmesi için Ürün'ün
          kullanılmamış, araca yapıştırılmamış ve satışa engel olacak şekilde tahrip
          edilmemiş olması gerekir.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Cayma bildirimi hello@otohafiza.com adresine yazılı olarak iletilir. İade kargo
          bedeli Alıcı'ya aittir.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı'nın işletmesinin ticari/mesleki amaçla (servis/tamirhane işletmeciliği)
          sipariş vermesi nedeniyle 6502 sayılı Kanun anlamında "tüketici" sayılıp
          sayılmayacağı ayrı bir hukuki değerlendirme konusudur; 14 günlük cayma süresi bu
          belirsizlik ihtimaline karşı asgari tüketici koruma standardı esas alınarak,
          ihtiyaten tanınmıştır.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Satıcı, cayma bildirimini aldığı tarihten itibaren en geç on dört (14) gün içinde,
          varsa teslimat masrafı dahil, tahsil edilen bedelin tamamını Alıcı'ya iade eder.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">A.3 — Ayıplı Ürün</h3>
        <p className="mt-2 text-sm text-slate-600">
          Ürün'ün ayıplı (kusurlu) teslim edilmesi hâlinde Alıcı, 6502 sayılı Kanun'un 8-12.
          maddeleri uyarınca; satılanı geri vermeye hazır olduğunu bildirerek sözleşmeden
          dönme, satılanı alıkoyup ayıp oranında bedel indirimi isteme, aşırı masraf
          gerektirmediği takdirde ücretsiz onarım isteme veya imkân varsa ayıpsız bir
          misliyle değiştirilmesini isteme haklarından birini kullanabilir. Bu haklardan biri
          seçilerek Satıcı'ya bildirildiğinde, Satıcı bildirimden itibaren azami otuz (30)
          gün içinde gereğini yerine getirir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Bölüm III — Ek-B: Dijital Hizmet (Abonelik Planı) Satın Alımı
        </h2>

        <h3 className="mt-4 font-semibold text-slate-800">B.1 — Hizmetin İfası</h3>
        <p className="mt-2 text-sm text-slate-600">
          Abonelik hizmeti, ödemenin onaylanmasıyla birlikte derhal (elektronik ortamda
          anında) ifa edilmeye başlanır; Alıcı ilgili plan özelliklerine anında erişim
          kazanır.
        </p>

        <h3 className="mt-4 font-semibold text-slate-800">B.2 — Cayma Hakkı</h3>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Kural:</strong> Alıcı tüketici sıfatını haiz ise, satın alma tarihinden
          itibaren on dört (14) gün içinde cayma hakkına sahiptir; bu süre içinde Abonelik,
          Ödeme, Yenileme, İptal ve İade Politikası Madde 7-8 kapsamında iade edilir.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>İstisna (şu an tetiklenmemektedir):</strong> Mesafeli Sözleşmeler
          Yönetmeliği m.15/1-ğ uyarınca, elektronik ortamda anında ifa edilen hizmetlerde,
          Alıcı satın alma anında ayrı bir onay kutucuğuyla hizmetin derhal ifasını talep
          eder ve bu talebin cayma hakkını sona erdireceğini kabul ederse, cayma hakkı
          kullanılamaz hâle gelir. Satıcı bu istisnayı şu an tetiklememeyi ve düz 14 günlük
          cayma hakkını tanımayı tercih etmiştir.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Cayma hakkının kullanılması, o ana kadar fiilen kullanılmış hizmet süresi için
          orantısal bir mahsuplaşma gerektirmez; Abonelik, Ödeme, Yenileme, İptal ve İade
          Politikası Madde 8.2'deki kötüye kullanım istisnası saklıdır.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı'nın işletmesinin ticari/mesleki amaçla abonelik satın alması nedeniyle 6502
          sayılı Kanun anlamında "tüketici" sayılıp sayılmayacağı ayrı bir hukuki
          değerlendirme konusudur; yukarıdaki cayma hakkı, bu belirsizlik ihtimaline karşı
          ihtiyaten tanınmıştır.
        </p>
      </div>
    </main>
  );
}
