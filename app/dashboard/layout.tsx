import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById } from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import { ToastProvider } from "@/components/Toast";
import { CalendarIcon, SettingsIcon } from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const shopId = await getCurrentShopId();
  if (!shopId) redirect("/giris");
  const shop = await getShopById(shopId);
  if (!shop) redirect("/giris");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 text-base font-bold text-brand-700 sm:text-lg"
            >
              <Logo size="sm" />
              <span className="truncate">{shop.name}</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/randevular"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Randevular"
                title="Randevular"
              >
                <CalendarIcon className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/dashboard/plan"
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:px-3"
              >
                {PLAN_LIMITS[shop.plan].label} plan
              </Link>
              <Link
                href="/dashboard/ayarlar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Ayarlar"
              >
                <SettingsIcon className="h-[18px] w-[18px]" />
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
