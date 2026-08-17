import { NextRequest, NextResponse } from "next/server";
import { getPartnerByReferralCode } from "@/lib/blobStore";

// Kayıt sayfasında (?ref=KOD) partnerin adını göstererek linkin "rastgele
// değil, tanıdık biri üzerinden geldiğini" hissettirmek için (bkz.
// app/kayit/page.tsx). Bilinçli olarak SADECE partnerin adını döner —
// telefon/e-posta/komisyon gibi hiçbir hassas alan bu public uç noktadan asla
// dışarı sızmaz. Pasif partnerler için de null döner (durumu değişmiş bir
// partnerin adı kayıt ekranında görünmeye devam etmesin diye).
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const partner = await getPartnerByReferralCode(params.code);
  if (!partner || partner.status !== "aktif") {
    return NextResponse.json({ name: null });
  }
  return NextResponse.json({ name: partner.name });
}
