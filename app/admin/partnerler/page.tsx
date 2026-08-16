import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllPartnerSummaries } from "@/lib/blobStore";
import AdminPartnerForm from "@/components/AdminPartnerForm";

// Saha Partner Ağı — bkz. pazarlama/Saha_Partner_Agi_Analiz.docx. Bu sayfa
// yalnızca ADMIN_EMAILS'teki hesaplara açıktır (bkz. app/admin/duyurular ile
// aynı desen ve gerekçe).
export default async function AdminPartnersPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const summaries = await listAllPartnerSummaries();
  const totalPending = summaries.reduce((sum, s) => sum + s.pendingCommissionTry, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Saha Partnerleri</h1>
      <p className="mt-1 text-sm text-slate-500">
        Yağ/yedek parça/kimyasal/POS satıcıları gibi zaten oto servisleri gezen saha
        partnerlerinin getirdiği işletmeler ve hak ettikleri komisyonlar burada takip edilir.
        Ödeme tahsilatı henüz otomatik değil — komisyon tutarları burada hesaplanır, ödeme
        elle (banka transferi vb.) yapılıp &quot;ödendi&quot; olarak işaretlenir.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Partnerler artık genelde{" "}
        <span className="font-medium text-slate-700">/partner-basvuru</span>&apos;dan kendileri
        başvurup hesap açıyor (siz onay vermeden anında aktif oluyorlar — aktivite geçmişinde
        görürsünüz). Aşağıdaki form yalnızca istisnai durumlar (ör. siz elle eklemek isterseniz)
        için duruyor.
      </p>

      {summaries.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Partner</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summaries.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Getirilen İşletme
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summaries.reduce((sum, s) => sum + s.totalShopCount, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Bekleyen Komisyon
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalPending.toLocaleString("tr-TR")} TL
            </p>
          </div>
        </div>
      )}

      <AdminPartnerForm initialPartners={summaries} />
    </div>
  );
}
