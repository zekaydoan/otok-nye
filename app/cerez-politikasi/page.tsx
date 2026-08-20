import Link from "next/link";

export const metadata = {
  title: "Çerez Politikası",
};

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Çerez Politikası</h1>
        <p className="mt-2 text-sm text-slate-500">
          Yürürlük tarihi: 20 Ağustos 2026 · Versiyon: v1.0
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 1 — Amaç ve Kapsam</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Politika, otohafiza.com sitesinde ("Site") kullanılan çerezleri ve bunların
          yönetimini açıklar.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 2 — Çerez Nedir</h2>
        <p className="mt-2 text-sm text-slate-600">
          Çerez, Site'yi ziyaret ettiğinizde tarayıcınıza kaydedilen, oturumunuzu yönetmeye
          veya Site kullanımınızı analiz etmeye yarayan küçük metin dosyalarıdır.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 3 — Kullanılan Çerez Türleri
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Zorunlu/Oturum Çerezleri.</strong> Oturum açmanızı ve hesabınıza güvenli
          erişiminizi sağlayan <code>ok_session</code> çerezi, hizmetin ifası için
          zorunludur ve KVKK m.5/2 kapsamında ayrı bir rıza gerektirmez; bu çerezler devre
          dışı bırakılamaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Performans/Analitik Çerezler.</strong> Site trafiğini ölçmek amacıyla
          (aktif edildiğinde) Google Analytics 4 çerezleri kullanılabilir.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Pazarlama/Reklam Çerezleri.</strong> Reklam performansını ölçmek amacıyla
          (aktif edildiğinde) Meta (Facebook) Pixel çerezleri kullanılabilir; bu çerezler
          kişiye özel reklam gösterimi amacıyla üçüncü taraf (Meta) ile veri paylaşımı
          içerebilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 4 — Onay</h2>
        <p className="mt-2 text-sm text-slate-600">
          Zorunlu çerezler dışındaki (analitik, pazarlama) çerezler, Site'ye ilk girişinizde
          sunulan onay banner'ı üzerinden vereceğiniz rızaya bağlı olarak yüklenir; onay
          vermemeniz hâlinde bu çerezler devreye alınmaz.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Onayınızı, tarayıcı ayarlarınızdan çerezleri silerek veya banner üzerindeki
          tercihlerinizi güncelleyerek dilediğiniz zaman geri alabilirsiniz.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          Madde 5 — Çerezlerin Tarayıcıdan Yönetimi
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Çoğu tarayıcı, çerezleri engelleme veya silme seçeneği sunar; bu ayarlar
          tarayıcının "Ayarlar" veya "Gizlilik" bölümünden yapılabilir. Zorunlu çerezlerin
          engellenmesi, Site'nin bazı işlevlerinin (ör. oturum açma) çalışmamasına yol
          açabilir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-slate-900">Madde 6 — İletişim</h2>
        <p className="mt-2 text-sm text-slate-600">
          İşbu Politika hakkında sorularınız için hello@otohafiza.com adresine
          ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}
