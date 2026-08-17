import PartnerChangePasswordForm from "@/components/PartnerChangePasswordForm";

// bkz. app/dashboard/ayarlar (bayi tarafındaki aynı desen) — partner artık
// kendi hesabını kendisi açtığı için (bkz. app/partner-basvuru) şifresini de
// admin'e yazmadan kendisi değiştirebilmeli.
export default function PartnerSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hesap Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">Giriş şifrenizi buradan güncelleyebilirsiniz.</p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Şifre Değiştir</h2>
        <div className="mt-4">
          <PartnerChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
