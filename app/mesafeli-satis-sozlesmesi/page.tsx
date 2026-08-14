import Link from "next/link";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | OtoHafıza",
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/dashboard/etiket-siparis" className="text-sm text-brand-600">
          ← Etiket siparişine dön
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Mesafeli Satış Sözleşmesi (Dayanıklı QR Etiket Siparişi)
        </h1>
        <p className="mt-2 text-sm text-slate-500">Son güncelleme: Ağustos 2026</p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Bu metin, fiziksel QR etiket siparişleri için hazırlanmış bir{" "}
          <strong>taslak sözleşme şablonudur</strong>, hukuki tavsiye niteliği taşımaz.
          Köşeli parantez içindeki alanları ([ ]) kendi işletme bilgilerinizle
          doldurmanız ve yayına almadan önce mutlaka bir hukuk danışmanına
          onaylatmanız gerekir. Ayrıca, alıcılarınız bu ürünü{" "}
          <strong>ticari/mesleki amaçla</strong> (servis/tamirhane işletmeciliği)
          satın aldığından, 6502 sayılı Tüketicinin Korunması Hakkında Kanun
          anlamında "tüketici" sayılıp sayılmayacakları ve dolayısıyla aşağıdaki
          cayma hakkı hükümlerinin yasal olarak zorunlu mu yoksa gönüllü bir
          ticari politika mı olacağı, danışmanınızla netleştirilmesi gereken ayrı
          bir husustur.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">1. Taraflar</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Satıcı:</strong> [Firma Unvanı], [Adres], [Vergi Dairesi/No veya
          MERSİS No], [E-posta], [Telefon] ("Satıcı").
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Alıcı:</strong> OtoHafıza panelinde oturum açmış, sipariş formunda
          teslimat bilgilerini beyan eden bayi/işletme ("Alıcı"). Alıcı, siparişi
          işletmesinin ticari faaliyeti kapsamında verdiğini kabul eder.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">2. Sözleşmenin Konusu</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu sözleşmenin konusu, Alıcı'nın OtoHafıza panelinden elektronik
          ortamda sipariş verdiği, motor bölmesi gibi zorlu koşullara dayanıklı
          (su geçirmez, UV korumalı) profesyonel basılmış QR etiketin (“Ürün”)
          satışı ve teslimine ilişkin tarafların hak ve yükümlülüklerinin
          belirlenmesidir. Ürün adedi, birim fiyatı ve toplam bedel, sipariş
          onayı sırasında Alıcı'ya gösterilen ve ödeme anında kart ekstresine
          yansıyan tutarla aynıdır; fiyatlara KDV [dahildir/dahil değildir].
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">3. Ödeme ve Teslimat</h2>
        <p className="mt-2 text-sm text-slate-600">
          Ödeme, iyzico ödeme altyapısı üzerinden kredi/banka kartıyla, sipariş
          anında tek seferde tahsil edilir. Kart bilgileri Satıcı'nın
          sunucularında saklanmaz. Ürün, Alıcı'nın beyan ettiği teslimat
          adresine, siparişin onaylanmasını (ödemenin başarıyla tamamlanmasını)
          takip eden [X] iş günü içinde kargoya verilir. Kargo takip bilgisi
          panelde "Siparişlerim" bölümünden görüntülenebilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">4. Cayma Hakkı</h2>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı, Ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde
          herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin
          sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılabilmesi
          için Ürünün kullanılmamış, aracın üzerine yapıştırılmamış ve satışa
          engel olacak şekilde tahrip edilmemiş olması gerekir. Cayma bildirimi
          [e-posta adresi] adresine yazılı olarak iletilmelidir. İade kargo
          bedeli [Alıcı/Satıcı] tarafından karşılanır.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Yukarıdaki 14 günlük süre, Mesafeli Sözleşmeler Yönetmeliği'nin asgari
          tüketici koruma standardı esas alınarak belirlenmiştir; Alıcı'nın
          işbu Bölüm 1'de belirtilen nedenle "tüketici" sayılmadığı hukuki
          danışmanlıkla teyit edilirse, Satıcı bu süreyi kendi ticari
          politikasına göre değiştirebilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">5. Mücbir Sebep ve Sorumluluk</h2>
        <p className="mt-2 text-sm text-slate-600">
          Doğal afet, yangın, grev, ulaşım engelleri gibi Satıcı'nın makul
          kontrolü dışındaki hâllerde teslimat süresi uzayabilir; Satıcı bu
          durumu Alıcı'ya bildirir. Satıcı'nın Ürün bedeli dışında herhangi bir
          dolaylı zarardan sorumlu tutulamayacağına ilişkin sınırlamalar,
          yürürlükteki mevzuatın izin verdiği ölçüde geçerlidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">6. Uyuşmazlıkların Çözümü</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu sözleşmeden doğan uyuşmazlıklarda, mevzuatta öngörülen parasal
          sınırlar dahilinde Tüketici Hakem Heyetleri ile [Şehir] Tüketici
          Mahkemeleri/Ticaret Mahkemeleri yetkilidir; bu yetki dağılımı,
          Alıcı'nın tüketici veya tacir sıfatına göre değişebileceğinden hukuk
          danışmanınızca teyit edilmelidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">7. Yürürlük</h2>
        <p className="mt-2 text-sm text-slate-600">
          Alıcı, sipariş formundaki onay kutusunu işaretleyip ödemeyi
          tamamladığında işbu sözleşmenin tüm hükümlerini elektronik ortamda
          kabul etmiş sayılır.
        </p>
      </div>
    </main>
  );
}
