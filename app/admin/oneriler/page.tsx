import { notFound } from "next/navigation";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { listAllSuggestions } from "@/lib/blobStore";
import AdminSuggestionRow from "@/components/AdminSuggestionRow";
import EmptyState from "@/components/EmptyState";
import { LightbulbIcon } from "@/components/icons";

// Bu sayfa yalnızca ADMIN_EMAILS ortam değişkeninde tanımlı hesaplara açıktır —
// bkz. app/admin/siparisler/page.tsx ile aynı desen ve gerekçe.
export default async function AdminSuggestionsPage() {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const suggestions = await listAllSuggestions();
  const newCount = suggestions.filter((s) => s.status === "yeni").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Öneri Kutusu (Admin)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bayilerin panelden gönderdiği öneri ve geri bildirimler burada listelenir.
        {newCount > 0 && ` ${newCount} tanesi henüz okunmadı.`}
      </p>

      <div className="mt-6 space-y-3">
        {suggestions.length === 0 && (
          <EmptyState
            icon={<LightbulbIcon className="h-6 w-6" />}
            title="Henüz öneri yok"
            description="Bayiler panelden öneri gönderdiğinde burada listelenecek."
          />
        )}
        {suggestions.map((s) => (
          <AdminSuggestionRow key={s.id} suggestion={s} />
        ))}
      </div>
    </div>
  );
}
