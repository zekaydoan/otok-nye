import Link from "next/link";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import Logo from "@/components/Logo";
import { CheckCircleIcon, WarningIcon } from "@/components/icons";

// iyzico Abonelik Checkout Form tamamlandıktan sonra app/api/shop/plan/callback'in
// yönlendirdiği sonuç sayfası — bkz. app/dashboard/etiket-siparis/sonuc ile
// aynı görsel desen (bu sitede zaten kanıtlanmış bir "ödeme sonucu" kalıbı).
export default function PlanCheckoutResultPage({
  searchParams,
}: {
  searchParams: { plan?: string; durum?: string };
}) {
  const plan =
    searchParams.plan && searchParams.plan in PLAN_LIMITS ? (searchParams.plan as Plan) : null;
  const success = searchParams.durum === "basarili" && plan;
  const failed = searchParams.durum === "hata";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="flex justify-center">
        <Logo withText />
      </div>
      {success && (
        <div className="mt-6 rounded-xl bg-green-50 p-8 ring-1 ring-green-100">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Aboneliğiniz başladı</h1>
          <p className="mt-2 text-sm text-slate-600">
            {PLAN_LIMITS[plan].label} planına geçtiniz — yeni limitleriniz hemen aktif oldu.
          </p>
        </div>
      )}
      {failed && (
        <div className="mt-6 rounded-xl bg-red-50 p-8 ring-1 ring-red-100">
          <WarningIcon className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Abonelik başlatılamadı</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kartınızdan çekim yapılmadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin, sorun
            devam ederse bizimle iletişime geçin.
          </p>
        </div>
      )}
      {!success && !failed && (
        <div className="mt-6 rounded-xl bg-slate-50 p-8 ring-1 ring-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Sonuç bulunamadı</h1>
          <p className="mt-2 text-sm text-slate-600">Bağlantı süresi dolmuş olabilir.</p>
        </div>
      )}
      <Link
        href="/dashboard/plan"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        Plan Sayfasına Dön
      </Link>
    </div>
  );
}
