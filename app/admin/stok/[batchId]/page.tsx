import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getStickerStockBatchById, listStickerTokensByBatch } from "@/lib/blobStore";
import StickerTokenGrid from "@/components/StickerTokenGrid";

// Fiziksel etikete kalıcı olarak basılacak QR kodları her zaman sitenin gerçek,
// kalıcı adresine gitmelidir — bkz. app/admin/siparisler/[id]/etiketler/page.tsx'teki
// aynı gerekçe (process.env.URL/DEPLOY_URL güvenilir değil, host header kullanılır).
function getPermanentSiteUrl(): string {
  const host = headers().get("host");
  if (!host) return process.env.URL || "https://otohafiza.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

// Hiçbir bayiye bağlı olmayan "genel stok" QR etiket partisini gösterir (bkz.
// lib/types.ts StickerStockBatch, components/AdminStockStickerForm — Zeki'nin 20
// Ağustos 2026 talebi: "Hiçbir bayiye bağlı olmayan, genel stok etiket"). Sipariş
// ekranındaki eşdeğerinden (app/admin/siparisler/[id]/etiketler) farkı: etikette
// basılı bir bayi adı/telefonu YOK, çünkü bu etiketler henüz hiçbir bayiye ait
// değil — StickerTokenGrid bu durumda alt bilgi şeridini hiç basmaz.
export default async function AdminStockBatchPage({ params }: { params: { batchId: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) notFound();

  const batch = await getStickerStockBatchById(params.batchId);
  if (!batch) notFound();

  const tokens = await listStickerTokensByBatch(batch.id);
  const siteUrl = getPermanentSiteUrl();
  const assignedCount = tokens.filter((t) => t.shopId).length;
  const boundCount = tokens.filter((t) => t.vehicleId).length;

  return (
    <div>
      <Link href="/admin/siparisler" className="no-print text-sm text-brand-600">
        ← Siparişler
      </Link>
      <h1 className="no-print mt-4 text-2xl font-bold text-slate-900">
        Genel Stok — {batch.quantity} Adet Etiket
      </h1>
      {batch.note && <p className="no-print mt-1 text-sm text-slate-500">Not: {batch.note}</p>}
      <p className="no-print mt-1 text-sm text-slate-500">
        {tokens.length} / {batch.quantity} etiket üretildi · {assignedCount} tanesi bir bayiye
        atandı · {boundCount} tanesi bir araca bağlandı.
      </p>
      <p className="no-print mt-1 text-xs text-amber-600">
        Bu etiketlerde bayi adı/telefonu BASILMAZ — hangi bayiye gideceği henüz belli
        değil. Bir bayi etiketi bir araca ilk kez bağladığında etiket o bayiye kalıcı
        olarak atanır.
      </p>

      <div className="mt-6">
        <StickerTokenGrid
          tokens={tokens}
          baseUrl={siteUrl}
          downloadPdfHref={`/api/admin/stok/${batch.id}/pdf`}
        />
      </div>
    </div>
  );
}
