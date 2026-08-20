import Link from "next/link";

export const metadata = {
  title: "Saha Partner Sözleşmesi",
};

export default function SahaPartnerSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Saha Partner Sözleşmesi</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Bu sözleşme, Partner'ı bağımsız yüklenici (serbest meslek erbabı) olarak
          nitelendirir; Türk iş hukukunda bu nitelendirme sözleşme metniyle değil fiili
          uygulamayla test edilir. Partnere yapılacak ödemelerin vergi muamelesi partnerin
          somut vergi statüsüne göre değişir; bu konuda mali müşavir görüşü almanız önerilir.
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 1 — Taraflar</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Saha Partner Sözleşmesi ("Sözleşme"), Sarper Dijital Teknolojiler ve Kiralama
          A.Ş. ("OtoHafıza") ile Platform'a saha partneri olarak başvuran ve OtoHafıza
          tarafından onaylanan gerçek kişi ("Partner") arasında, Partner'ın kaydı/başvurusu
          onaylandığı anda elektronik ortamda akdedilmiştir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 2 — Tanımlar</h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>"Referans":</strong> Partner'a ait kişisel referans linki/kodu üzerinden
          Platform'a kaydolan bayi. <strong>"Aktivasyon Primi":</strong> Bir Referans'ın
          kaydolduktan sonra 14 gün içinde en az bir gerçek bakım kaydı girmesi hâlinde
          tahakkuk eden tek seferlik ödül. <strong>"Dönüşüm Bonusu":</strong> Bir
          Referans'ın Ücretsiz plandan ilk kez ücretli bir plana geçmesi hâlinde tahakkuk
          eden tek seferlik ödül. <strong>"Aylık Komisyon":</strong> Bir Referans'ın
          ödemeye devam ettiği sürece tekrarlayan komisyon. <strong>"Seviye":</strong>{" "}
          Partner'ın aktif Referans sayısına göre belirlenen statü; Seviye, komisyon oranını
          değiştirmez. Güncel oranlar ve eşikler Partner panelinde ilan edilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 3 — Sözleşmenin Konusu</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme, Partner'ın OtoHafıza'yı potansiyel bayilere tanıtması ve kendi
          referans linki/kodu üzerinden yeni bayi kazandırması karşılığında Madde 5'te
          düzenlenen komisyonu hak etmesine ilişkin esasları düzenler.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 4 — Partnerin Bağımsız Yüklenici Statüsü
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Taraflar, işbu Sözleşme'nin bir iş sözleşmesi olmadığını, Partner'ın OtoHafıza'nın
          işçisi, temsilcisi veya acentesi olmadığını, aralarında bir istihdam ilişkisi
          kurulmadığını kabul eder. Partner; çalışma saatlerini, yöntemini ve yoğunluğunu
          kendisi belirler; OtoHafıza, Partner'a günlük/haftalık çalışma saati, rota veya iş
          yeri dayatmaz. Partner, işbu Sözleşme kapsamındaki faaliyeti münhasır olmayan bir
          esasla yürütür; dilerse başka firmaların ürün/hizmetlerini de tanıtabilir, başka
          bir iş yapabilir. Partner, kendi vergi, sosyal güvenlik (varsa Bağ-Kur/isteğe
          bağlı SGK) ve benzeri yükümlülüklerinden bizzat sorumludur; OtoHafıza bu
          yükümlülükler bakımından işveren sıfatını taşımaz. OtoHafıza, Partner'a yalnızca
          Referans kazandırma sonucuna göre ödeme yapar; Partner'ın günlük faaliyetini
          denetlemez, talimat vermez veya performans karnesi tutmaz (Seviye sistemi hariç,
          bu yalnızca istatistiksel bir statüdür).
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 5 — Komisyon Modeli ve Ödeme
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Partner, işbu Sözleşme'nin ekinde/Platform içinde ilan edilen güncel oranlarla
          Aktivasyon Primi, Dönüşüm Bonusu ve Aylık Komisyon kazanır. Tahakkuk eden
          komisyonlar, Partner'ın kendi panelinden bildirdiği IBAN'a, ayda bir kez, OtoHafıza
          tarafından belirlenen ödeme gününde ödenir. Partner, aldığı ödemeler için, tabi
          olduğu vergi mevzuatı gereği gerekli belgeyi (serbest meslek makbuzu veya ilgili
          diğer belge) düzenlemekle yükümlüdür; bu konudaki nihai sorumluluk Partner'a
          aittir. Aktivasyon Primi'nin tahakkuku, yalnızca kayıt değil, gerçek kullanım
          koşuluna bağlıdır — bu, sahte/usulsüz kayıt yoluyla komisyon kazanılmasını önlemek
          içindir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 6 — Kurucu Servis Programı Bilgilendirmesi
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Partner'ın kazandırdığı Referans, OtoHafıza'nın "Kurucu Servis" kampanyası
          kapsamındaysa (ilk 100 kayıt), bu Referans ömür boyu indirim hakkından faydalanır;
          bu durum Partner'ın komisyon tutarını etkilemez (komisyon, indirimli bedel üzerinden
          değil, standart hesaplama esasına göre işler).
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 7 — Marka Kullanımı ve Tanıtım
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Partner, "OtoHafıza" markasını yalnızca OtoHafıza'nın sağladığı veya onayladığı
          tanıtım materyalleriyle, doğru ve yanıltıcı olmayan bir şekilde kullanabilir.
          Partner, OtoHafıza adına bağlayıcı hiçbir taahhütte (fiyat, özellik, hizmet
          garantisi vb.) bulunamaz; yalnızca Platform'da yayınlanan güncel bilgileri
          aktarabilir. Partner'ın verdiği, Platform'da yer almayan sözlü beyanlar OtoHafıza'yı
          bağlamaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 8 — Gizlilik</h2>
        <p className="mt-2 text-sm text-slate-600">
          Partner, faaliyeti sırasında öğrendiği bayi/Referans bilgilerini ve OtoHafıza'nın
          ticari sırrı niteliğindeki bilgilerini yalnızca işbu Sözleşme amacıyla kullanır,
          üçüncü kişilerle paylaşmaz. Bu yükümlülük Sözleşme sona erdikten sonra da devam
          eder.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 9 — Fesih</h2>
        <p className="mt-2 text-sm text-slate-600">
          Taraflardan her biri, işbu Sözleşme'yi dilediği zaman, diğer tarafa bildirimde
          bulunarak feshedebilir. OtoHafıza, Partner'ın yanıltıcı tanıtım yapması, sahte
          Referans kazandırmaya çalışması veya işbu Sözleşme'yi esaslı şekilde ihlal etmesi
          hâlinde Sözleşme'yi derhal feshedebilir. Fesih tarihine kadar tahakkuk etmiş ancak
          henüz ödenmemiş komisyonlar, ödeme takvimine göre Partner'a ödenmeye devam eder;
          fesih, tahakkuk etmiş hakları geriye dönük olarak ortadan kaldırmaz. İstisna:
          sahte/usulsüz işlemden kaynaklanan tahakkuklar bu korumadan yararlanmaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 10 — Sorumluluğun Sınırlandırılması
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          OtoHafıza'nın işbu Sözleşme'den doğan sorumluluğu, SaaS Kullanım ve Lisans
          Sözleşmesi'ndeki sorumluluk sınırlandırma esaslarına kıyasen tabidir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 11 — Uygulanacak Hukuk ve Uyuşmazlık
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda önce zorunlu
          arabuluculuğa başvurulur; Manisa Mahkemeleri ve İcra Daireleri yetkilidir. Partner,
          işbu Sözleşme ilişkisinin bir iş sözleşmesi olarak nitelendirilmesi gerektiğini
          iddia ederse, bu iddianın değerlendirilmesinde işbu Sözleşme'nin lafzı değil,
          tarafların fiili ilişkisi esas alınır; bu madde, Partner'ın kanundan doğan
          haklarını (varsa) ortadan kaldırmaz.
        </p>
      </div>
    </main>
  );
}
