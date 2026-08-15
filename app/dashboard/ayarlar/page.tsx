import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import { PLAN_LIMITS } from "@/lib/types";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import StaffSection from "@/components/StaffSection";

export default async function SettingsPage() {
  const session = await getCurrentSession();
  const shop = session ? await getShopById(session.shopId) : null;
  if (!shop || !session) return null;

  const isOwner = session.role === "sahibi";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hesap Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Firma bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
      </p>

      {!isOwner && (
        <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Çalışan hesabıyla giriş yaptınız. Firma bilgileri, şifre ve ekip yönetimi
          yalnızca hesap sahibi tarafından değiştirilebilir.
        </div>
      )}

      {isOwner && (
        <>
          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Firma Bilgileri</h2>
            <div className="mt-1 text-xs text-slate-400">
              E-posta: {shop.email} — e-posta değişikliği için destek ile iletişime geçin.
            </div>
            <div className="mt-4">
              <ProfileForm defaultName={shop.name} defaultPhone={shop.phone} defaultCity={shop.city} />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Fatura Bilgileri</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isBillingInfoComplete(shop.billingInfo)
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {isBillingInfoComplete(shop.billingInfo) ? "Tamamlandı" : "Eksik"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Plan ve etiket satın alımlarınız için kestiğimiz e-fatura/e-arşiv
              faturalarında kullanılır.
            </p>
            <Link
              href="/dashboard/fatura-bilgileri"
              className="mt-4 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {isBillingInfoComplete(shop.billingInfo) ? "Fatura Bilgilerini Düzenle" : "Fatura Bilgilerini Doldur"}
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Şifre Değiştir</h2>
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Ekip / Çalışanlar</h2>
            <p className="mt-1 text-xs text-slate-400">
              Dükkanınızda çalışan diğer ustalara kendi giriş bilgileriyle panele erişim
              verin — araç, kayıt, randevu gibi tüm günlük işlemleri yapabilirler.
            </p>
            <div className="mt-4">
              <StaffSection maxStaff={PLAN_LIMITS[shop.plan].maxStaff} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
