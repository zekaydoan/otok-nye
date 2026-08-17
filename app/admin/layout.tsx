import Link from "next/link";
import { ToastProvider } from "@/components/Toast";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import IconBadge from "@/components/IconBadge";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getPendingCounts } from "@/app/admin/bekleyen-isler/page";
import {
  BellIcon,
  ChartBarIcon,
  ChatIcon,
  DocumentIcon,
  HandshakeIcon,
  LightbulbIcon,
  LockIcon,
  UsersIcon,
} from "@/components/icons";

// Her sekmenin kendine özgü rengi var (bkz. components/IconBadge) — ne işe
// yaradığını isim + renk tekrarıyla pekiştirir, hepsi aynı gri metin olduğunda
// gözle taranması zordu.
const NAV_ITEMS = [
  { href: "/admin/bekleyen-isler", label: "Bekleyen İşler", icon: <BellIcon />, color: "red" as const },
  { href: "/admin/bayiler", label: "Bayiler", icon: <UsersIcon />, color: "blue" as const },
  { href: "/admin/partnerler", label: "Partnerler", icon: <HandshakeIcon />, color: "teal" as const },
  { href: "/admin/istatistikler", label: "İstatistikler", icon: <ChartBarIcon />, color: "purple" as const },
  { href: "/admin/duyurular", label: "Duyurular", icon: <ChatIcon />, color: "amber" as const },
  { href: "/admin/oneriler", label: "Öneriler", icon: <LightbulbIcon />, color: "yellow" as const },
  { href: "/admin/veri-talepleri", label: "Veri Talepleri", icon: <LockIcon />, color: "slate" as const },
  { href: "/admin/aktivite", label: "Aktivite", icon: <DocumentIcon />, color: "green" as const },
];

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
        {/* Admin paneli yalnızca Zeki'nin kullandığı, kalabalık bir iç araç —
            önceden logo + 8 nav öğesi + "Panelime dön" + "Çıkış Yap" hepsi
            max-w-5xl (dar) bir tek satıra sıkıştırılmaya çalışılıyor, sonuçta
            2-3 satıra bölünüp birbirine giriyordu. Şimdi iki ayrı satır:
            üstte marka/hesap satırı, altında NAV_ITEMS kendi geniş satırında
            — ayrıca konteyner max-w-5xl'den max-w-7xl'e çıkarıldı (hem header
            hem main) ki geniş ekranda gerçekten daha fazla yatay alan
            kullanılsın, sıkışıklık azalsın. */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/admin/siparisler"
                className="flex items-center gap-2 text-base font-bold text-brand-700 sm:text-lg"
              >
                <Logo size="sm" />
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Admin
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                  ← Panelime dön
                </Link>
                <LogoutButton />
              </div>
            </div>
            <nav className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <IconBadge icon={item.icon} color={item.color} />
                  <span>{item.label}</span>
                  {item.href === "/admin/bekleyen-isler" && pendingTotal > 0 && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingTotal}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
