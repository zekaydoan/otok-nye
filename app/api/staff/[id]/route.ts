import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { deleteStaffAccount, getStaffById } from "@/lib/blobStore";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  if (session.role !== "sahibi") {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const staff = await getStaffById(session.shopId, params.id);
  if (!staff) {
    return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
  }

  await deleteStaffAccount(session.shopId, params.id);
  return NextResponse.json({ ok: true });
}
