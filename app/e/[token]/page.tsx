import { redirect } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import { getStickerToken } from "@/lib/blobStore";
import Logo from "@/components/Logo";
import TokenLoginPrompt from "@/components/TokenLoginPrompt";
import BindStickerForm from "@/components/BindStickerForm";

// Fiziksel, plakasız basılmış bir etiketin QR kodu bu sayfaya yönlendirir. Etiket
// zaten bir araca bağlıysa doğrudan o aracın herkese açık sayfasına yönlendirilir.
// Bağlı değilse — ve yalnızca etiketin ait olduğu bayi giriş yapmışsa — bir araca
// bağlanabilir. Böylece bayi aynı fiziksel etiket partisini farklı zamanlarda
// farklı araçlara uygulayabilir; plaka sipariş anında değil, ilk kullanımda belli olur.
export default async function StickerTokenPage({ params }: { params: { token: string } }) {
  const tokenRecord = await getStickerToken(params.token, { consistency: "strong" });

  if (!tokenRecord) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-center">
            <Logo withText />
          </div>
          <p className="mt-6 text-sm text-slate-600">
            Bu etiket kodu geçersiz veya artık kullanılmıyor.
          </p>
        </div>
      </main>
    );
  }

  if (tokenRecord.vehicleId) {
    redirect(`/arac/${tokenRecord.vehicleId}`);
  }

  const shopId = await getCurrentShopId();

  if (!shopId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-center">
            <Logo withText />
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            Bu etiket henüz bir araca atanmamış. Aracı sisteme kaydetmek için yetkili
            girişi yapın.
          </p>
          <TokenLoginPrompt />
        </div>
      </main>
    );
  }

  if (tokenRecord.shopId !== shopId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-center">
            <Logo withText />
          </div>
          <p className="mt-6 text-sm text-slate-600">
            Bu etiket başka bir yetkili servise ait olduğu için hesabınızla
            bağlayamazsınız.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <Logo withText />
        <h1 className="mt-6 text-xl font-bold text-slate-900">Etiketi Araca Bağla</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bu etiketi yapıştırdığınız aracın bilgilerini girin. Bundan sonra bu etiket
          okutulduğunda doğrudan bu aracın bakım geçmişi açılacak.
        </p>
        <BindStickerForm token={tokenRecord.token} />
      </div>
    </main>
  );
}
