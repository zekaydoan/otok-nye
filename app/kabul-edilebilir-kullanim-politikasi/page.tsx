import Link from "next/link";

export const metadata = {
  title: "Kabul Edilebilir Kullanım Politikası",
};

export default function AupPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Kabul Edilebilir Kullanım Politikası
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>
        <p className="mt-2 text-sm text-slate-500">
          SaaS Kullanım ve Lisans Sözleşmesi'nin eki olup burada tanımlanmayan terimler o
          sözleşmedeki anlamlarını taşır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 1 — Amaç ve Kapsam</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Politika, Platform'un güvenli, adil ve amacına uygun kullanımını sağlamak
          amacıyla yasaklı kullanımları somutlaştırır ve Kullanıcı (ve varsa Personel
          Hesapları) için bağlayıcıdır. İşbu Politika'nın ihlali, hesabın askıya alınması
          veya feshi sonucunu doğurabilir; ihlalin ağırlığına göre bildirimsiz ve derhal
          uygulanabilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 2 — Teknik Güvenliğe Yönelik Yasaklar
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, Şirket'in önceden yazılı izni olmaksızın aşağıdaki faaliyetlerde
          bulunamaz:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Platform'un kaynak kodunu, nesne kodunu veya iç mimarisini elde etmek amacıyla
            tersine mühendislik (reverse engineering), decompile veya disassemble işlemi
            yapmak;
          </li>
          <li>
            Platform'a veya altyapısına yönelik yetkisiz sızma testi (penetration testing),
            güvenlik açığı taraması (vulnerability scanning) veya benzeri güvenlik
            araştırması yapmak;
          </li>
          <li>
            Kaba kuvvet (brute force) saldırısı, hizmet reddi (DDoS) saldırısı düzenlemek
            veya bu tür saldırılara katkı sağlayacak araç/altyapı kullanmak;
          </li>
          <li>
            Platform'un kimlik doğrulama, hız sınırlama (rate limiting) veya diğer güvenlik
            mekanizmalarını aşmaya veya etkisiz kılmaya çalışmak;
          </li>
          <li>
            Otomatikleştirilmiş araçlar (bot, scraper, crawler, script) kullanarak
            Platform'dan toplu veri çekmek (scraping/crawling) veya Platform'un normal
            kullanım desenlerinin dışında otomatik istek göndermek;
          </li>
          <li>
            Platform'un API'lerine, Şirket tarafından açıkça yetkilendirilmediği şekil veya
            kapsamda erişmek.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          <strong>Güvenlik Açığı Bildirimi.</strong> Platform'da bir güvenlik açığı tespit
          eden kişi, açığı istismar etmek veya üçüncü kişilerle paylaşmak yerine
          hello@otohafiza.com adresi üzerinden Şirket'e bildirmelidir. İşbu madde, Şirket'e
          herhangi bir ödül (bug bounty) yükümlülüğü getirmez; yalnızca sorumlu bildirim
          davranışını teşvik eder ve iyi niyetli, yalnızca bildirim amaçlı sınırlı
          incelemeleri (yetkisiz veri erişimi/değişikliği içermeyen) yukarıdaki sızma testi
          yasağının istisnası sayar.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 3 — Hesap Kullanım Kuralları
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Kimlik Bilgisi Paylaşımı Yasağı.</strong> Kullanıcı, kendisine veya
          Personel Hesabına ait kullanıcı adı/şifreyi üçüncü kişilerle paylaşamaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Hesap/Şube Sınırı.</strong> Tek bir hesap; Abonelik Planı'nda tanımlı
          araç/personel limitini aşacak şekilde birden fazla bağımsız işletme veya fiziki
          şube tarafından ortak kullanılamaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Yetkisiz Kullandırma.</strong> Kullanıcı, Platform erişimini, Personel
          Hesabı mekanizması dışında, bedelli veya bedelsiz şekilde üçüncü kişilere
          kullandıramaz, kiralayamaz veya devredemez.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 4 — İçerik ve Hukuka Uygunluk Kuralları
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Kullanıcı, Platform'a yalnızca hukuka uygun şekilde elde ettiği ve girme hakkına
          sahip olduğu verileri girebilir; Araç Sahibi verilerini girerken KVKK Aydınlatma
          Metni'ndeki bilgilendirme/açık rıza yükümlülüğüne uyacağını kabul eder. Platform,
          üçüncü kişilerin fikri mülkiyet haklarını ihlal eden, hukuka aykırı, yanıltıcı veya
          kötü niyetli içerik yüklemek amacıyla kullanılamaz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 5 — İhlal Hâlinde Uygulanacak Prosedür
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Şirket, işbu Politika'nın ihlal edildiğine dair makul şüphe duyması hâlinde,
          ihlalin ağırlığına göre Kullanıcı'yı uyarabilir, hesabı geçici olarak askıya
          alabilir veya feshedebilir. Şirket'in sistemlerine, verilerine veya üçüncü
          kişilere somut zarar veren ağır ihlallerde, önceden bildirimde bulunulmaksızın
          derhal askıya alma yoluna gidilebilir; Kullanıcı'ya durum makul süre içinde
          bildirilir. İşbu Politika'nın ihlali, Şirket'in uğradığı zararın tazminini talep
          etme hakkını ortadan kaldırmaz.
        </p>
      </div>
    </main>
  );
}
