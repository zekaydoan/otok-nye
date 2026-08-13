import { getCurrentShopId } from "@/lib/auth";
import { getShopById, getStickerUnitPriceTry, listStickerOrdersByShop } from "@/lib/blobStore";
import { STICKER_ORDER_STATUS_LABELS } from "@/lib/types";
import {
  STICKER_ORDER_TRACKING_STEPS,
  isStickerOrderInTrackingFlow,
  stickerOrderStatusBadgeClass,
  stickerOrderTrackingIndex,
} from "@/lib/stickerOrderUi";
import StickerOrderForm from "@/components/StickerOrderForm";
import { BrandMark, CheckIcon } from "@/components/icons";

const BENEFITS = [
  "Motor bölmesi sıcaklığına, yağa ve neme dayanıklı malzeme",
  "Su geçirmez, UV korumalı baskı — kendi yazıcınızdan çıkardığınız kağıt etiket gibi solmaz",
  "Profesyonel görünüm — firmanızı daha güvenilir gösterir",
  "Her etiketin kendine özel QR kodu vardır — plakasız basılır, hangi araca yapıştırırsanız ilk okutmada o araca bağlanır",
];

export default async function StickerOrderPage() {
  const shopId = await getCurrentShopId();
  const shop = shopId ? await getShopById(shopId) : null;
  const unitPriceTry = await getStickerUnitPriceTry();
  const orders = shopId ? await listStickerOrdersByShop(shopId) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Dayanıklı QR Etiket Sipariş Et</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kargo takibi elle güncellenir, sipariş durumunuzu aşağıdan izleyebilirsiniz.
      </p>

      {/* Ürün tanıtımı — ödeme istemeden önce "neden bu parayı ödüyorum" sorusuna
          görsel olarak cevap verir. */}
      <div className="mt-6 grid items-center gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6 lg:grid-cols-[1fr,220px]">
        <ul className="space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              {b}
            </li>
          ))}
        </ul>

        {/* Ürün mockup'ı — StickerEditor'daki basılı etiket tasarımıyla aynı görsel
            dili kullanır, sipariş verilen ürünün ne olduğunu somutlaştırır. */}
        <div className="hidden justify-self-center lg:block">
          <div className="w-40 rotate-3 rounded-2xl border border-slate-300 bg-white p-3 text-center shadow-xl transition-transform hover:rotate-0">
            <div className="flex items-center justify-center gap-1 rounded-lg bg-brand-700 py-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-white/20 text-white">
                <BrandMark className="h-2.5 w-2.5" />
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">Bakım Geçmişi</span>
            </div>
            <div className="mt-2.5 flex justify-center">
              <div className="rounded-md border-2 border-slate-800 bg-white p-1">
                <div className="grid h-14 w-14 grid-cols-4 gap-0.5 rounded bg-slate-900 p-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-[1px] ${
                        [0, 1, 3, 5, 6, 9, 10, 12, 14, 15].includes(i) ? "bg-white" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[9px] font-bold text-slate-800">{shop?.name || "Zeki Servis"}</p>
              <p className="text-[8px] text-slate-500">{shop?.phone || "05XX XXX XX XX"}</p>
            </div>
            <p className="mt-1.5 text-[8px] text-slate-400">Su geçirmez · UV korumalı</p>
          </div>
        </div>
      </div>

      <StickerOrderForm unitPriceTry={unitPriceTry} defaultPhone={shop?.phone} defaultName={shop?.name} />

      {orders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Siparişlerim</h2>
          <div className="mt-3 space-y-2">
            {orders.map((order) => {
              const inFlow = isStickerOrderInTrackingFlow(order.status);
              const currentIdx = stickerOrderTrackingIndex(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {order.quantity} adet — {order.totalPriceTry.toFixed(2)}₺
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                        {order.trackingNumber ? ` · Takip No: ${order.trackingNumber}` : ""}
                      </p>
                    </div>
                    {!inFlow && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stickerOrderStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {STICKER_ORDER_STATUS_LABELS[order.status]}
                      </span>
                    )}
                  </div>

                  {/* Ödemesi onaylanmış siparişler için mini kargo takip göstergesi. */}
                  {inFlow && (
                    <div className="mt-3 flex items-center">
                      {STICKER_ORDER_TRACKING_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              i <= currentIdx ? "bg-brand-600" : "bg-slate-200"
                            }`}
                            title={STICKER_ORDER_STATUS_LABELS[step]}
                          />
                          {i < STICKER_ORDER_TRACKING_STEPS.length - 1 && (
                            <span
                              className={`h-px w-6 sm:w-10 ${
                                i < currentIdx ? "bg-brand-600" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                      <span className="ml-2 text-xs font-medium text-brand-700">
                        {STICKER_ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
