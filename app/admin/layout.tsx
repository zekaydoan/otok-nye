import Link from "next/link";
import { ToastProvider } from "@/components/Toast";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPendingCounts } from "@/app/admin/bekleyen-isler/page";

// Daha önce admin sayfaları çıplak bir <div> ile başlıyor, dashboard'daki gibi
// bir marka şeridi ya da panele dönüş yolu sunmuyordu — yetkili bir hesapla
// giriş yapan kişi burada "kayboluyormuş" hissi yaşıyordu. Bu header, dashboard
// layout'uyla aynı görsel dili kullanır ama admin bağlamını "Admin" rozetiyle
// ayırt eder.
//
// "Bekleyen İşler" rozeti (bkz. app/admin/bekleyen-isler) her admin sayfası
// açıldığında hesaplanır — admin girişi yapmamış (ör. 404 dönecek) kullanıcılar
// için gereksiz sorgu yapılmasın diye önce getCurrentAdminShopId kontrol edilir.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminShopId = await getCurrentAdminShopId();
  const pendingTotal = adminShopId ? (await getPendingCounts()).total : 0;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
            <Link href="/admin/siparisler" className="flex items-center gap-2 text-base font-bold text-brand-700 sm:text-lg">
              <Logo size="sm" />
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
                Admin
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/admin/bekleyen-isler" className="relative text-sm font-medium text-slate-500 hover:text-slate-700">
                Bekleyen İşler
                {pendingTotal > 0 && (
                  <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {pendingTotal}
                  </span>
                )}
              </Link>
              <Link href="/admin/bayiler" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Bayiler
              </Link>
              <Link href="/admin/istatistikler" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                İstatistikler
              </Link>
              <Link href="/admin/duyurular" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Duyurular
              </Link>
              <Link href="/admin/oneriler" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Öneriler
              </Link>
              <Link href="/admin/veri-talepleri" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Veri Talepleri
              </Link>
              <Link href="/admin/aktivite" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Aktivite
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                ← Panelime dön
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
