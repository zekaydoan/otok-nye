import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAdminAuditLog } from "@/lib/blobStore";
import AdminActivitySearch from "@/components/AdminActivitySearch";
import type { AdminAuditAction, AdminAuditLogEntry } from "@/lib/types";

const ACTION_LABELS: Record<AdminAuditAction, string> = {
  plan_degistirildi: "Plan değiştirildi",
  bayi_silindi: "Bayi hesabı kalıcı olarak silindi",
  siparis_guncellendi: "Sipariş durumu güncellendi",
  siparis_kargo_guncellendi: "Sipariş kargo bilgisi güncellendi",
  iade_isaretlendi: "İade işaretlendi",
  siparis_silindi: "Sipariş kalıcı olarak silindi",
  siparis_hediye_edildi: "Sipariş hediye edildi",
  genel_stok_etiket_olusturuldu: "Genel stok etiket partisi oluşturuldu",
  partner_olusturuldu: "Partner eklendi",
  partner_durum_degisti: "Partner durumu değişti",
  partner_atandi: "Partner ataması değişti",
  partner_komisyon_odendi: "Partner komisyonu ödendi",
  partner_sifre_sifirlandi: "Partner şifresi sıfırlandı",
  partner_kendi_basvurdu: "Partner kendi başvurusuyla katıldı",
  partner_hakedis_toplu_odendi: "Partner hakedişi toplu ödendi",
};

// Record<AdminAuditLogEntry["targetType"], ...> ile (Record<string, ...>
// yerine) kasıtlı olarak katı tiplendirildi — targetType'a yeni bir değer
// eklenip burası unutulursa (bkz. Bölüm 68 partner_atandi/targetType "partner"
// eklenmesiyle burada az kalsın atlanan bir eksiklik) derleme zamanında hata
// verir, sessiz bir runtime çökmesine dönüşmez.
const TARGET_HREF: Record<AdminAuditLogEntry["targetType"], (id: string) => string> = {
  shop: (id) => `/admin/bayiler/${id}`,
  sticker_order: () => `/admin/siparisler`,
  sticker_stock_batch: (id) => `/admin/stok/${id}`,
  partner: (id) => `/admin/partnerler/${id}`,
};

// Admin "bu planı kim, ne zaman aktive etti?" gibi sorulara artık burada cevap
// bulabilir — bkz. lib/blobStore.ts recordAdminAuditLog. Şimdilik yalnızca plan
// değişikliği ve sipariş durum/iade işlemleri kaydediliyor; kapsam istenirse
// genişletilebilir (bkz. app/api/admin/shops/[id]/plan, app/api/admin/siparisler/[id]).
//
// V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): href/etiket eşlemesi burada,
// sunucu tarafında hesaplanıp düz metin alanlarıyla AdminActivitySearch'e
// (istemci bileşeni) geçiriliyor — Next.js sunucu→istemci sınırından fonksiyon
// geçirilemediği için TARGET_HREF eşlemesi istemci tarafına taşınmadı.
export default async function AdminActivityPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const entries = await listAdminAuditLog();
  const rows = entries.map((e) => ({
    id: e.id,
    href: TARGET_HREF[e.targetType](e.targetId),
    title: `${ACTION_LABELS[e.action]} — ${e.targetLabel}`,
    detail: e.detail,
    actorEmail: e.actorEmail,
    createdAtLabel: new Date(e.createdAt).toLocaleString("tr-TR"),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Aktivite Geçmişi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Admin panelinden yapılan plan ve sipariş işlemlerinin kronolojik günlüğü — en yeni 200 kayıt.
      </p>

      <div className="mt-6">
        <AdminActivitySearch entries={rows} />
      </div>
    </div>
  );
}
