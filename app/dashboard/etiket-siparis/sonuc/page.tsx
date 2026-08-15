import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import { getStickerOrderById } from "@/lib/blobStore";
import Logo from "@/components/Logo";
import { CheckCircleIcon, WarningIcon } from "@/components/icons";
import PurchaseConversionPing from "@/components/PurchaseConversionPing";

export default async function StickerOrderResultPage({
  searchParams,
}: {
  searchParams: { siparis?: string; durum?: string };
}) {
  const shopId = await getCurrentShopId();
  const order =
    searchParams.siparis && shopId
      ? await getStickerOrderById(searchParams.siparis, { consistency: "strong" })
      : null;

  // Başka bir bayinin siparişini görüntülemeye çalışırsa (ör. eski/paylaşılmış bir
  // bağlantı) genel bir hata göster, sipariş detayını sızdırma.
  const visibleOrder = order && order.shopId === shopId ? order : null;

  const success = visibleOrder?.status === "odendi";
  const failed = visibleOrder?.status === "odeme_basarisiz" || searchParams.durum === "hata";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="flex justify-center">
        <Logo withText />
      </div>
      {success && (
        <div className="mt-6 rounded-xl bg-green-50 p-8 ring-1 ring-green-100">
          <PurchaseConversionPing orderId={visibleOrder.id} />
          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Ödemeniz alındı</h1>
          <p className="mt-2 text-sm text-slate-600">
            {visibleOrder.quantity} adetlik etiket siparişiniz onaylandı. Sipariş
            durumunu "Siparişlerim" listesinden takip edebilirsiniz.
          </p>
        </div>
      )}
      {failed && (
        <div className="mt-6 rounded-xl bg-red-50 p-8 ring-1 ring-red-100">
          <WarningIcon className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Ödeme tamamlanamadı</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kartınızdan çekim yapılmadı. Lütfen bilgilerinizi kontrol edip tekrar
            deneyin, sorun devam ederse bankanızla iletişime geçin.
          </p>
        </div>
      )}
      {!success && !failed && (
        <div className="mt-6 rounded-xl bg-slate-50 p-8 ring-1 ring-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Sipariş durumu bulunamadı</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bağlantı süresi dolmuş olabilir. Siparişlerinizi aşağıdan kontrol edin.
          </p>
        </div>
      )}
      <Link
        href="/dashboard/etiket-siparis"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        Etiket Siparişlerime Dön
      </Link>
    </div>
  );
}
