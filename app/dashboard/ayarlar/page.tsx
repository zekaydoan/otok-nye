import { getCurrentShopId } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function SettingsPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  if (!shop) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hesap Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Firma bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
      </p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Firma Bilgileri</h2>
        <div className="mt-1 text-xs text-slate-400">
          E-posta: {shop.email} — e-posta değişikliği için destek ile iletişime geçin.
        </div>
        <div className="mt-4">
          <ProfileForm defaultName={shop.name} defaultPhone={shop.phone} />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Şifre Değiştir</h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
