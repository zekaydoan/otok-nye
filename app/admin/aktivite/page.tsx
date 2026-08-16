import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAdminAuditLog } from "@/lib/blobStore";
import EmptyState from "@/components/EmptyState";
import { ChartBarIcon } from "@/components/icons";
import type { AdminAuditAction, AdminAuditLogEntry } from "@/lib/types";

const ACTION_LABELS: Record<AdminAuditAction, string> = {
  plan_degistirildi: "Plan değiştirildi",
  siparis_guncellendi: "Sipariş durumu güncellendi",
  iade_isaretlendi: "İade işaretlendi",
  siparis_silindi: "Sipariş kalıcı olarak silindi",
  partner_olusturuldu: "Partner eklendi",
  partner_durum_degisti: "Partner durumu değişti",
  partner_atandi: "Partner ataması değişti",
  partner_komisyon_odendi: "Partner komisyonu ödendi",
};

// Record<AdminAuditLogEntry["targetType"], ...> ile (Record<string, ...>
// yerine) kasıtlı olarak katı tiplendirildi — targetType'a yeni bir değer
// eklenip burası unutulursa (bkz. Bölüm 68 partner_atandi/targetType "partner"
// eklenmesiyle burada az kalsın atlanan bir eksiklik) derleme zamanında hata
// verir, sessiz bir runtime çökmesine dönüşmez.
const TARGET_HREF: Record<AdminAuditLogEntry["targetType"], (id: string) => string> = {
  shop: (id) => `/admin/bayiler/${id}`,
  sticker_order: () => `/admin/siparisler`,
  partner: (id) => `/admin/partnerler/${id}`,
};

// Admin "bu planı kim, ne zaman aktive etti?" gibi sorulara artık burada cevap
// bulabilir — bkz. lib/blobStore.ts recordAdminAuditLog. Şimdilik yalnızca plan
// değişikliği ve sipariş durum/iade işlemleri kaydediliyor; kapsam istenirse
// genişletilebilir (bkz. app/api/admin/shops/[id]/plan, app/api/admin/siparisler/[id]).
export default async function AdminActivityPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const entries = await listAdminAuditLog();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Aktivite Geçmişi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Admin panelinden yapılan plan ve sipariş işlemlerinin kronolojik günlüğü — en yeni 200 kayıt.
      </p>

      <div className="mt-6 space-y-2">
        {entries.length === 0 && (
          <EmptyState
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="Henüz kayıt yok"
            description="Plan veya sipariş işlemi yaptığınızda burada listelenecek."
          />
        )}
        {entries.map((e) => (
          <Link
            key={e.id}
            href={TARGET_HREF[e.targetType](e.targetId)}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {ACTION_LABELS[e.action]} — {e.targetLabel}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{e.actorEmail}</p>
              <p>{new Date(e.createdAt).toLocaleString("tr-TR")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
