import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllContractAcceptances } from "@/lib/blobStore";
import AdminContractAcceptanceSearch, {
  type ContractAcceptanceRow,
} from "@/components/AdminContractAcceptanceSearch";
import type { ContractAcceptanceRecord, ContractDocumentKey } from "@/lib/types";

const DOCUMENT_LABELS: Record<ContractDocumentKey, string> = {
  saas_kullanim_sartlari: "SaaS Kullanım ve Lisans Sözleşmesi",
  saha_partner_sozlesmesi: "Saha Partner Sözleşmesi",
  kvkk_aydinlatma: "KVKK Aydınlatma Metni",
  yurtdisi_veri_aktarimi: "Yurt Dışı Veri Aktarımı Açık Rızası",
  pazarlama_izni: "Pazarlama İzni",
};

const ACCOUNT_TYPE_LABELS: Record<ContractAcceptanceRecord["accountType"], string> = {
  shop: "Kullanıcı (Bayi)",
  partner: "Saha Partneri",
};

const ACCOUNT_TYPE_BADGE_CLASS: Record<ContractAcceptanceRecord["accountType"], string> = {
  shop: "bg-blue-50 text-blue-700",
  partner: "bg-teal-50 text-teal-700",
};

// aktivite/page.tsx'teki TARGET_HREF ile aynı desen — hesap türüne göre admin
// detay sayfasına gider (bkz. app/admin/bayiler/[id], app/admin/partnerler/[id]).
const ACCOUNT_HREF: Record<ContractAcceptanceRecord["accountType"], (id: string) => string> = {
  shop: (id) => `/admin/bayiler/${id}`,
  partner: (id) => `/admin/partnerler/${id}`,
};

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

// Kayıt (app/kayit) ve Saha Partneri başvurusu (app/partner-basvuru) anında
// alınan sözleşme/KVKK/pazarlama onaylarının, kimin ne zaman neyi onayladığını
// GÜN GÜN gösteren değişmez döküm — bir uyuşmazlıkta ispat niteliğinde
// (bkz. lib/blobStore.ts recordContractAcceptance, lib/contracts.ts
// computeAcceptanceHash). Kayıtlar yalnızca eklenir; bu sayfa salt okurdur,
// hiçbir düzenleme/silme eylemi sunmaz.
//
// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): gün-gün gruplama ve arama
// (istemci tarafı filtreleme) AdminContractAcceptanceSearch'e taşındı — bu
// bileşen yalnızca düz metin/etiket alanları alır, kayıtları değiştirme veya
// silme imkânı sunmaz; ispat niteliğindeki verinin değişmezliği korunur.
export default async function AdminContractAcceptancesPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const entries = await listAllContractAcceptances();

  const rows: ContractAcceptanceRow[] = entries.map((entry) => ({
    id: entry.id,
    day: dayLabel(entry.createdAt),
    accountTypeLabel: ACCOUNT_TYPE_LABELS[entry.accountType],
    accountTypeBadgeClass: ACCOUNT_TYPE_BADGE_CLASS[entry.accountType],
    href: ACCOUNT_HREF[entry.accountType](entry.accountId),
    identifier: entry.identifier,
    timeLabel: new Date(entry.createdAt).toLocaleTimeString("tr-TR"),
    ip: entry.ip,
    items: entry.items.map((item) => ({
      document: item.document,
      label: DOCUMENT_LABELS[item.document],
      version: item.version,
      accepted: item.accepted,
      hash: item.hash,
    })),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sözleşme Onayları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kullanıcı (Bayi) ve Saha Partneri hesaplarının kayıt/başvuru anında onayladığı sözleşme ve
        izinlerin gün gün, değişmez kaydı — "kim, hangi metni, hangi versiyonla, ne zaman ve hangi
        IP'den onayladı" sorusuna kanıt niteliğinde cevap verir. En yeni 500 kayıt gösterilir.
      </p>

      <div className="mt-6">
        <AdminContractAcceptanceSearch rows={rows} />
      </div>
    </div>
  );
}
