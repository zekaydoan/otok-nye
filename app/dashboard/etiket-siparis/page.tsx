import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById, getStickerUnitPriceTry, listStickerOrdersByShop } from "@/lib/blobStore";
import { isBillingInfoComplete } from "@/lib/billing";
import StickerOrderForm from "@/components/StickerOrderForm";
import StickerOrderList from "@/components/StickerOrderList";
import { buildBusinessWhatsAppLink } from "@/lib/whatsappBusiness";
import { BrandMark, CheckIcon, WhatsAppIcon } from "@/components/icons";

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
  // V2 sadeleştirme (23 Ağustos 2026): bireysel fatura bilgisi kayıtlıysa T.C.
  // Kimlik No zaten orada var — sipariş formunda tekrar sorulmasın. Kurumsal
  // hesaplarda taxNumber farklı bir numara (VKN) olduğu için bilerek
  // gönderilmiyor, kullanıcı bu alanı yine kendisi dolduracak.
  const defaultIdentityNumber =
    shop?.billingInfo?.type === "bireysel" ? shop.billingInfo?.taxNumber : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Dayanıklı QR Etiket Sipariş Et</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kargo takibi elle güncellenir, sipariş durumunuzu aşağıdan izleyebilirsiniz.
      </p>
      <a
        href={buildBusinessWhatsAppLink("Merhaba, etiket siparişiyle ilgili bir sorum var.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline"
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0" />
        Sorularınız mı var? WhatsApp'tan sorun
      </a>

      {/* Ürün tanıtımı — ödeme istemeden önce "neden bu parayı ödüyorum" sorusuna
          görsel olarak cevap verir. V2 sadeleştirme (23 Ağustos 2026): mobilde
          form/fatura-uyarısı ilk ekranda görünsün diye bu blok mobilde
          gizlendi; masaüstünde (daha bol ekran alanı olduğu için) aynen kaldı. */}
      <div className="mt-6 hidden items-center gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid sm:p-6 lg:grid-cols-[1fr,220px]">
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
              <p className="text-[9px] font-bold text-slate-800">{shop?.name || "Yılmaz Servis"}</p>
              <p className="text-[8px] text-slate-500">{shop?.phone || "05XX XXX XX XX"}</p>
            </div>
            <p className="mt-1.5 text-[8px] text-slate-400">Su geçirmez · UV korumalı</p>
          </div>
        </div>
      </div>

      {shop && !isBillingInfoComplete(shop.billingInfo) ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-semibold">Önce fatura bilgilerinizi tamamlamanız gerekiyor.</p>
          <p className="mt-1">
            Etiket siparişiniz için e-fatura/e-arşiv kesebilmemiz adına Bireysel/Kurumsal
            fatura bilgilerinizi bir kez kaydetmeniz yeterli.
          </p>
          <Link
            href={`/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent("/dashboard/etiket-siparis")}`}
            className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
          >
            Fatura Bilgilerini Doldur
          </Link>
        </div>
      ) : (
        <StickerOrderForm
          unitPriceTry={unitPriceTry}
          defaultPhone={shop?.phone}
          defaultName={shop?.name}
          defaultIdentityNumber={defaultIdentityNumber}
        />
      )}

      {orders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Siparişlerim</h2>
          <StickerOrderList orders={orders} />
        </div>
      )}
    </div>
  );
}
