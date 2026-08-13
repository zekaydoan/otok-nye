import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { updateSuggestionStatus } from "@/lib/blobStore";
import { SUGGESTION_STATUS_LABELS, type SuggestionStatus } from "@/lib/types";

// Admin, gelen bir öneriyi incelediğinde "okundu" olarak işaretleyebilsin diye —
// bkz. app/api/admin/siparisler/[id] ile aynı desen.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { status } = body as { status?: SuggestionStatus };
  if (!status || !(status in SUGGESTION_STATUS_LABELS)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  try {
    const updated = await updateSuggestionStatus(params.id, status);
    return NextResponse.json({ suggestion: updated });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }
}
