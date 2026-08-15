import Link from "next/link";
import { UsersIcon, GiftIcon } from "@/components/icons";

export const metadata = {
  title: "Referans Programı",
  description:
    "Bir tamirci arkadaşınızı OtoHafıza'ya getirin, ödül kazanın — referans programımız çok yakında.",
};

// Şimdilik yalnızca bir "yakında" tanıtım sayfası — kullanıcının isteğiyle
// programın mekaniği (ödül tutarı/şekli, elle mi otomatik mi uygulanacağı vb.)
// henüz tasarlanmadı; iş büyüdükçe aktife alınacak. Bu sayede fikir sitede
// duyurulmuş oluyor ama gerçekleşmeyecek bir vaatte bulunulmuyor.
export default function ReferansPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <Link href="/" className="text-sm text-brand-600">
          ← Ana sayfa
        </Link>

        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <GiftIcon className="h-7 w-7" />
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Referans Programı</h1>
        <span className="mt-2 inline-block rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600">
          Çok Yakında
        </span>

        <p className="mt-4 text-slate-600">
          Bir tamirci arkadaşınızı OtoHafıza'ya getirdiğinizde ikiniz de kazanacak — bu
          programı hazırlıyoruz. Detaylar (ödül tutarı, nasıl işleyeceği) yakında burada
          olacak.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <UsersIcon className="h-4 w-4" />
          Haberdar olmak için ekibinizle birlikte OtoHafıza kullanmaya devam edin.
        </div>

        <Link
          href="/kayit"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ücretsiz Hesap Aç
        </Link>
      </div>
    </main>
  );
}
