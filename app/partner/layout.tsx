import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPartnerId } from "@/lib/partnerAuth";
import { getPartnerById } from "@/lib/blobStore";
import Logo from "@/components/Logo";
import PartnerLogoutButton from "@/components/PartnerLogoutButton";

// Saha Partneri paneli — bkz. app/partner-girisi, lib/partnerAuth.ts. Bayi
// panelinden (app/dashboard) TAMAMEN AYRI bir bölüm: farklı oturum, farklı
// veri modeli (Partner, Shop değil), farklı görsel dil (marka rengi
// korunuyor ama içerik partnere özel).
export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) redirect("/partner-girisi");

  const partner = await getPartnerById(partnerId);
  if (!partner) redirect("/partner-girisi");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link href="/partner" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
              Partner
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Ayarlar sayfasına (veya ileride eklenecek başka alt sayfalara)
                girildiğinde, sol üstteki logo+"Partner" rozeti tıklanabilir
                olsa da bunu bir "geri dön" kontrolü olarak fark etmeyen
                kullanıcılar sıkışmış hissediyordu (bkz. kullanıcı geri
                bildirimi, /partner/ayarlar). Sitedeki "← X" geri dön
                linklerinin ezici çoğunluğu (bkz. app/admin/partnerler/[id],
                app/admin/iyzico-abonelik, app/dashboard/araclar/yeni vb.)
                text-brand-600 kullanıyor — admin/layout.tsx'teki tek istisna
                (slate-500) yerine site geneliyle tutarlı renk burada da
                uygulandı. */}
            <Link
              href="/partner"
              className="hidden text-sm font-medium text-brand-600 hover:underline sm:inline"
            >
              ← Panelim
            </Link>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">{partner.name}</span>
            <Link
              href="/partner/ayarlar"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Ayarlar
            </Link>
            <PartnerLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
