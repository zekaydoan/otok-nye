import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getIyzicoPricingPlanCode, getIyzicoSubscriptionProductCode } from "@/lib/blobStore";
import { getBaseUrl } from "@/lib/iyzico";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import IyzicoAbonelikKurulumButton from "@/components/IyzicoAbonelikKurulumButton";
import { CheckCircleIcon, XCircleIcon } from "@/components/icons";

const PAID_PLANS: Plan[] = ["pro", "business", "business_yillik"];

// Bir kez çalıştırılması gereken kurulum ekranı — iyzico'da OtoHafıza için
// "Abonelik" ürününü ve Pro/İşletme/İşletme Yıllık'a karşılık gelen 3 ödeme
// planını oluşturur (bkz. app/api/admin/iyzico-abonelik-kurulum). Ana admin
// nav'ına EKLENMEDİ — sık kullanılacak bir ekran değil, tek seferlik bir araç.
// Sandbox anahtarları aktive edildikten sonra buradan bir kez "Oluştur"
// tıklanması yeterli (bkz. SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md madde 1/5).
export default async function IyzicoAbonelikPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  // Sandbox ve gerçek/canlı hesaplarda ürün/plan kodları birbirinden bağımsız
  // saklanıyor (bkz. lib/blobStore.ts'teki iyzicoEnvSuffix yorumu) — burada
  // hangi ortamda olunduğunu açıkça göstermek, IYZICO_BASE_URL değiştikten
  // sonra "zaten oluşturulmuş" sanıp bu ekranı atlamayı önlüyor.
  const isSandbox = getBaseUrl().includes("sandbox");
  const productReferenceCode = await getIyzicoSubscriptionProductCode();
  const plans = await Promise.all(
    PAID_PLANS.map(async (plan) => ({
      plan,
      label: PLAN_LIMITS[plan].label,
      priceDisplay: `${PLAN_LIMITS[plan].price}${PLAN_LIMITS[plan].period}`,
      referenceCode: await getIyzicoPricingPlanCode(plan),
    }))
  );

  return (
    <div>
      <Link href="/admin/bekleyen-isler" className="text-sm font-medium text-brand-600 hover:underline">
        ← Bekleyen İşler
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">iyzico Abonelik Kurulumu</h1>
      <span
        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
          isSandbox ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
        }`}
      >
        {isSandbox ? "Şu an SANDBOX (test) ortamındasın" : "Şu an GERÇEK/CANLI ortamdasın"}
      </span>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Bu ekran, iyzico hesabında OtoHafıza için tek bir "Abonelik" ürünü ve Pro/İşletme/İşletme
        Yıllık planlarına karşılık gelen 3 "ödeme planı" oluşturur. Bir kez çalıştırılması yeterli
        — tekrar tıklamak, zaten oluşturulmuş kodları yeniden oluşturmaz (aşağıda görünürler).
        Sandbox ve gerçek hesap kodları birbirinden bağımsız saklanır — Netlify'daki
        IYZICO_BASE_URL sandbox'tan gerçeğe geçtiğinde bu ekran otomatik olarak
        "Henüz oluşturulmadı" gösterir ve butona tekrar basman gerekir.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          {productReferenceCode ? (
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <XCircleIcon className="h-5 w-5 shrink-0 text-slate-300" />
          )}
          <p className="text-sm font-medium text-slate-900">
            Ürün: {productReferenceCode || "Henüz oluşturulmadı"}
          </p>
        </div>

        <ul className="mt-4 space-y-2">
          {plans.map((p) => (
            <li key={p.plan} className="flex items-center gap-2 text-sm">
              {p.referenceCode ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span className="font-medium text-slate-900">
                {p.label} ({p.priceDisplay})
              </span>
              <span className="text-slate-500">{p.referenceCode || "Henüz oluşturulmadı"}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <IyzicoAbonelikKurulumButton />
        </div>
      </div>
    </div>
  );
}
