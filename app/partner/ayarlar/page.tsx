import { redirect } from "next/navigation";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import { getPartnerById } from "@/lib/blobStore";
import PartnerChangePasswordForm from "@/components/PartnerChangePasswordForm";
import PartnerPaymentInfoForm from "@/components/PartnerPaymentInfoForm";

// bkz. app/dashboard/ayarlar (bayi tarafındaki aynı desen) — partner artık
// kendi hesabını kendisi açtığı için (bkz. app/partner-basvuru) şifresini de
// admin'e yazmadan kendisi değiştirebilmeli. Ödeme Bilgileri kartı, partnerin
// IBAN'ını bir kez kaydedip ayda 1 kez ödeme günü ayrıca sorulmasını önlemek
// için eklendi (bkz. lib/types.ts Partner.paymentInfo).
export default async function PartnerSettingsPage() {
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) redirect("/partner-girisi");
  const partner = await getPartnerById(partnerId);
  if (!partner) redirect("/partner-girisi");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hesap Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Giriş şifrenizi ve hakediş ödemelerinizin yapılacağı IBAN'ı buradan güncelleyebilirsiniz.
      </p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Ödeme Bilgileri</h2>
        <div className="mt-4">
          <PartnerPaymentInfoForm initial={partner.paymentInfo} />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Şifre Değiştir</h2>
        <div className="mt-4">
          <PartnerChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
