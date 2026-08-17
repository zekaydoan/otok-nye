import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listPartnerPayoutQueue, PARTNER_PAYOUT_DUE_DAYS } from "@/lib/blobStore";
import HakedislerTable from "@/components/HakedislerTable";

// Hakedişler (ödeme takip) ekranı — bkz. app/admin/partnerler'daki mevcut
// "Bekleyen Komisyon" sütunu yalnızca OKUNUR bir sayıydı, ödeme yapmak için
// her partnerin kendi detay sayfasını açıp komisyon komisyon işaretlemek
// gerekiyordu. Partner sayısı arttıkça ("ilerleyen zamanlarda partnerler
// çoğaldığında") bu manuel takip sürdürülemez hale geldiği için, hangi
// partnerin ne kadar hak ettiğini VE ne zamandır beklediğini tek ekranda
// gösterip tek tıkla ödeme işaretlemeyi sağlıyoruz.
export default async function AdminHakedislerPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const queue = await listPartnerPayoutQueue();
  const withBalance = queue.filter((i) => i.pendingCommissionTry > 0);
  const totalDueTry = withBalance.reduce((sum, i) => sum + i.pendingCommissionTry, 0);
  const dueCount = withBalance.filter((i) => i.isDue).length;
  const missingIbanCount = withBalance.filter((i) => !i.hasPaymentInfo).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hakedişler</h1>
      <p className="mt-1 text-sm text-slate-500">
        Her partnerin bekleyen komisyon bakiyesi ve en eski tahakkuktan bu yana geçen gün
        sayısı burada toplanır. Ödeme tahsilatı hâlâ elle (banka transferi/elden) yapılır —
        parayı gerçekten gönderdikten sonra &quot;Tümünü Öde&quot;ye basıp kaydı düşürün.
        Ödeme politikamız ayda 1 kez olduğundan, {PARTNER_PAYOUT_DUE_DAYS} günü aşan bakiyeler
        &quot;ödeme zamanı geldi&quot; olarak kırmızıyla işaretlenir.
      </p>

      {withBalance.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ödenmesi Gereken Toplam
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalDueTry.toLocaleString("tr-TR")} TL
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ödeme Zamanı Gelen Partner
            </p>
            <p className="mt-1 text-2xl font-bold text-red-600">{dueCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              IBAN Eksik
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{missingIbanCount}</p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <HakedislerTable items={queue} />
      </div>
    </div>
  );
}
