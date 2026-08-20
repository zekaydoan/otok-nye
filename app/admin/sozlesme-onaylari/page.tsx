import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllContractAcceptances } from "@/lib/blobStore";
import EmptyState from "@/components/EmptyState";
import { CheckCircleIcon } from "@/components/icons";
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
// computeAcceptanceHash). Kayıtlar yalnızca eklenir; bu sayfa salt okunurdur,
// hiçbir düzenleme/silme eylemi sunmaz.
export default async function AdminContractAcceptancesPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const entries = await listAllContractAcceptances();

  const groups = new Map<string, ContractAcceptanceRecord[]>();
  for (const entry of entries) {
    const key = dayLabel(entry.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sözleşme Onayları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kullanıcı (Bayi) ve Saha Partneri hesaplarının kayıt/başvuru anında onayladığı sözleşme ve
        izinlerin gün gün, değişmez kaydı — "kim, hangi metni, hangi versiyonla, ne zaman ve hangi
        IP'den onayladı" sorusuna kanıt niteliğinde cevap verir. En yeni 500 kayıt gösterilir.
      </p>

      <div className="mt-6 space-y-6">
        {entries.length === 0 && (
          <EmptyState
            icon={<CheckCircleIcon className="h-6 w-6" />}
            title="Henüz kayıt yok"
            description="Bir kullanıcı veya saha partneri üye olduğunda onay kaydı burada listelenecek."
          />
        )}
        {[...groups.entries()].map(([day, dayEntries]) => (
          <div key={day}>
            <h2 className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
              {day} <span className="font-normal text-slate-400">· {dayEntries.length} kayıt</span>
            </h2>
            <div className="mt-2 space-y-2">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACCOUNT_TYPE_BADGE_CLASS[entry.accountType]}`}
                      >
                        {ACCOUNT_TYPE_LABELS[entry.accountType]}
                      </span>
                      <Link
                        href={ACCOUNT_HREF[entry.accountType](entry.accountId)}
                        className="text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {entry.identifier}
                      </Link>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{new Date(entry.createdAt).toLocaleTimeString("tr-TR")}</p>
                      <p>IP: {entry.ip}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {entry.items.map((item) => (
                      <li
                        key={item.document}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
                      >
                        <span className={item.accepted ? "text-slate-700" : "text-slate-400 line-through"}>
                          {DOCUMENT_LABELS[item.document]}{" "}
                          <span className="text-slate-400">({item.version})</span>
                        </span>
                        <span
                          className="font-mono text-slate-400"
                          title={`Bütünlük parmak izi (SHA-256): ${item.hash}`}
                        >
                          {item.hash.slice(0, 12)}…
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
