import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminShopId } from "@/lib/adminAuth";
import { updateDataRequestStatus } from "@/lib/blobStore";
import { DATA_REQUEST_STATUS_LABELS, type DataRequestStatus } from "@/lib/types";

// Admin, bir KVKK veri talebini inceledikçe durumunu güncelleyebilsin diye —
// bkz. app/api/admin/oneriler/[id] ile aynı desen.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminShopId = await getCurrentAdminShopId();
  if (!adminShopId) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const body = await req.json();
  const { status } = body as { status?: DataRequestStatus };
  if (!status || !(status in DATA_REQUEST_STATUS_LABELS)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  try {
    const updated = await updateDataRequestStatus(params.id, status);
    return NextResponse.json({ request: updated });
  } catch {
    return NextResponse.json({ error: "Kaydedilemedi, lütfen tekrar deneyin." }, { status: 409 });
  }
}
