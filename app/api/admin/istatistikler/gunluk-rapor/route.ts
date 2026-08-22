import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { getDailyStatsReport, listAllPartners, listAllShops, turkeyDateISO } from "@/lib/blobStore";
import { generateDailyStatsReportPdf } from "@/lib/dailyStatsReportPdf";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Admin panelindeki "Bugünün İstatistikleri" (veya seçilen herhangi bir günün)
// PDF indirme butonunun uç noktası — bkz. app/admin/istatistikler/page.tsx,
// lib/blobStore.getDailyStatsReport, lib/dailyStatsReportPdf.ts. ?date=YYYY-MM-DD
// verilmezse Türkiye takvim gününe göre bugün kullanılır (bkz. turkeyDateISO).
export async function GET(req: NextRequest) {
  try {
    const adminShopId = await getCurrentAdminShopId();
    if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

    const dateParam = req.nextUrl.searchParams.get("date");
    const date = dateParam && DATE_RE.test(dateParam) ? dateParam : turkeyDateISO();

    const [report, shops, partners] = await Promise.all([
      getDailyStatsReport(date),
      listAllShops(),
      listAllPartners(),
    ]);

    const pdfBytes = await generateDailyStatsReportPdf(report, {
      shopCount: shops.length,
      partnerCount: partners.length,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="otohafiza-gunluk-rapor-${date}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Günlük istatistik raporu üretim hatası:", err);
    return NextResponse.json({ error: "Rapor üretilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
