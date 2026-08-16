import { NextResponse } from "next/server";
import { clearPartnerSessionCookie } from "@/lib/partnerAuth";

export async function POST() {
  clearPartnerSessionCookie();
  return NextResponse.json({ ok: true });
}
