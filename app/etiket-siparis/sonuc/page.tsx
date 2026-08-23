import Link from "next/link";
import Logo from "@/components/Logo";
import { CheckCircleIcon, WarningIcon } from "@/components/icons";
import PurchaseConversionPing from "@/components/PurchaseConversionPing";

// iyzico'nun ödeme sayfasından geri dönüş yönlendirmesi (bkz.
// app/api/etiket-siparis/callback/route.ts) BİLEREK app/dashboard/ altında
// DEĞİL — dashboard'daki oturum kontrolü bu sayfaya asla güvenilir şekilde
// ulaşamıyordu: iyzico.com'dan başlayan bir yönlendirme zinciri tarayıcı
// tarafından "siteler arası" sayılıyor, oturum çerezi (sameSite=lax olsa
// bile) bu zincirdeki hiçbir istekte gönderilmiyor — kullanıcı hâlâ giriş
// yapmışken "Giriş Yap" ekranına düşüyordu (23 Ağustos 2026, canlıda
// gözlemlendi). Çözüm: bu sonuç sayfası hiçbir oturuma/veritabanı
// sorgusuna ihtiyaç duymuyor — tüm bilgiyi (durum, sipariş no, miktar)
// callback route zaten hesaplayıp URL'ye koyuyor (bkz. plan/sonuc'taki
// aynı, önceden kanıtlanmış desen). Sipariş ID'si (rastgele UUID) zaten
// tahmin edilemez olduğundan ekstra bir yetki kontrolüne gerek yok — hiçbir
// kişisel veri (isim/telefon/adres) bu sayfada gösterilmiyor.
export default function StickerOrderResultPage({
  searchParams,
}: {
  searchParams: { siparis?: string; durum?: string; miktar?: string };
}) {
  const success = searchParams.durum === "basarili";
  const failed = searchParams.durum === "hata";
  const quantity = searchParams.miktar ? Number(searchParams.miktar) : null;

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="flex justify-center">
        <Logo withText />
      </div>
      {success && (
        <div className="mt-6 rounded-xl bg-green-50 p-8 ring-1 ring-green-100">
          {searchParams.siparis && <PurchaseConversionPing orderId={searchParams.siparis} />}
          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Ödemeniz alındı</h1>
          <p className="mt-2 text-sm text-slate-600">
            {quantity ? `${quantity} adetlik ` : ""}Etiket siparişiniz onaylandı. Sipariş
            durumunu "Siparişlerim" listesinden takip edebilirsiniz.
          </p>
        </div>
      )}
      {failed && (
        <div className="mt-6 rounded-xl bg-red-50 p-8 ring-1 ring-red-100">
          <WarningIcon className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Ödeme tamamlanamadı</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kartınızdan çekim yapılmadı. Lütfen bilgilerinizi kontrol edip tekrar
            deneyin, sorun devam ederse bankanızla iletişime geçin.
          </p>
        </div>
      )}
      {!success && !failed && (
        <div className="mt-6 rounded-xl bg-slate-50 p-8 ring-1 ring-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Sipariş durumu bulunamadı</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bağlantı süresi dolmuş olabilir. Siparişlerinizi aşağıdan kontrol edin.
          </p>
        </div>
      )}
      <Link
        href="/dashboard/etiket-siparis"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        Etiket Siparişlerime Dön
      </Link>
    </div>
  );
}
