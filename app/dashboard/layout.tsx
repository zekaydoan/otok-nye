import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import {
  countUnseenAnnouncements,
  countUnseenWhatsappAppointments,
  getShopById,
  getStaffById,
} from "@/lib/blobStore";
import { PLAN_LIMITS } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import IconBadge, { type IconBadgeColor } from "@/components/IconBadge";
import { ToastProvider } from "@/components/Toast";
import { BellIcon, CalendarIcon, ChartBarIcon, LightbulbIcon, SettingsIcon } from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/giris");
  const shop = await getShopById(session.shopId);
  if (!shop) redirect("/giris");
  // Çalışan girişinde header'da "hangi çalışan giriş yaptı" bilgisi gösterilir —
  // aksi hâlde ekipteki herkes panelde aynı görünür, kimin işlem yaptığını
  // ayırt etmek zorlaşır.
  const staff =
    session.role === "calisan" && session.staffId
      ? await getStaffById(session.shopId, session.staffId)
      : null;
  // Müşterinin WhatsApp hatırlatmasına "Evet" diyerek otomatik açtırdığı ama
  // bayinin henüz görmediği randevu sayısı — Randevular ikonunda kırmızı rozet
  // olarak gösterilir (bkz. lib/blobStore.countUnseenWhatsappAppointments).
  const unseenWhatsappAppointments = await countUnseenWhatsappAppointments(session.shopId);
  // Admin panelinden yayınlanan, bu bayinin hedef kitlesine giren ve henüz
  // Duyurular sayfası ziyaret edilerek "görülmemiş" duyuru sayısı — Duyurular
  // ikonunda kırmızı rozet olarak gösterilir (bkz. lib/blobStore.countUnseenAnnouncements).
  const unseenAnnouncements = await countUnseenAnnouncements(shop);
  // ADMIN_EMAILS ile eşleşen tek hesaba (site yöneticisine) özel görünen bir
  // giriş noktası — daha önce /admin/istatistikler'e ulaşmanın tek yolu adres
  // çubuğuna elle yazmaktı, oturum kapalıyken de düz bir 404 dönüyordu ve
  // "buraya nasıl giriş yapılır" hiçbir yerde belirtilmiyordu. Bu link yalnızca
  // giriş yapmış olan hesap admin ise render edilir; diğer bayiler için bu
  // koddan bile admin panelinin var olduğu anlaşılmaz.
  const isAdmin = Boolean(await getCurrentAdminShopId());

  // Admin paneli sekmesindeki (bkz. app/admin/layout.tsx) "isim + renkli IconBadge"
  // görsel diliyle tutarlı olsun diye burada da aynı NAV_ITEMS deseni kullanılıyor —
  // tek fark, Randevular/Duyurular rozetlerinin ve Admin Paneli sekmesinin bu bayiye
  // özgü, çalışma zamanında hesaplanan verilere bağlı olması.
  const navItems: {
    href: string;
    label: string;
    icon: React.ReactElement;
    color: IconBadgeColor;
    badge?: number;
  }[] = [
    {
      href: "/dashboard/randevular",
      label: "Randevular",
      icon: <CalendarIcon />,
      color: "blue",
      badge: unseenWhatsappAppointments,
    },
    {
      href: "/dashboard/duyurular",
      label: "Duyurular",
      icon: <BellIcon />,
      color: "amber",
      badge: unseenAnnouncements,
    },
    { href: "/dashboard/oneriler", label: "Öneri Kutusu", icon: <LightbulbIcon />, color: "yellow" },
    ...(isAdmin
      ? [{ href: "/admin/istatistikler", label: "Admin Paneli", icon: <ChartBarIcon />, color: "purple" as const }]
      : []),
    { href: "/dashboard/ayarlar", label: "Ayarlar", icon: <SettingsIcon />, color: "slate" },
  ];

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
              {staff && (
                <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {staff.name}
                </span>
              )}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <IconBadge icon={item.icon} color={item.color} />
                  <span>{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                href="/dashboard/plan"
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:px-3"
              >
                {PLAN_LIMITS[shop.plan].label} plan
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
