import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDataRequest, getVehicleById } from "@/lib/blobStore";
import { escapeHtml, notifyAdmins } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { DataRequest, DataRequestType } from "@/lib/types";
import { DATA_REQUEST_TYPE_LABELS } from "@/lib/types";

const MAX_MESSAGE_LEN = 1000;
const MAX_CONTACT_LEN = 200;

// Kimlik doğrulaması gerektirmez — genel araç sayfasını görebilen (yani QR
// etiketi elinde olan) herkes KVKK m.11 kapsamındaki ilgili kişi haklarını
// (bilgi edinme, silme) burada talep edebilir, bayiye/desteğe yazmak zorunda
// kalmaz. Talep otomatik işlenmez — admin panelinden elle değerlendirilir
// (bkz. app/admin/veri-talepleri), çünkü "silme" isteği o aracın bakım
// geçmişini oluşturan bayinin de haberdar olması gereken bir işlem.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit("veri-talebi", ip, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen biraz sonra tekrar deneyin." }, { status: 429 });
  }

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 });

  const { type, contactInfo, message } = (await req.json()) as {
    type?: DataRequestType;
    contactInfo?: string;
    message?: string;
  };

  if (!type || !(type in DATA_REQUEST_TYPE_LABELS)) {
    return NextResponse.json({ error: "Geçersiz talep türü." }, { status: 400 });
  }
  if (!contactInfo || !contactInfo.trim()) {
    return NextResponse.json({ error: "Size dönüş yapabilmemiz için e-posta veya telefon girin." }, { status: 400 });
  }
  if (contactInfo.length > MAX_CONTACT_LEN || (message && message.length > MAX_MESSAGE_LEN)) {
    return NextResponse.json({ error: "Girilen bilgilerden biri çok uzun." }, { status: 400 });
  }

  const request: DataRequest = {
    id: randomUUID(),
    vehicleId: vehicle.id,
    plateDisplay: vehicle.plateDisplay,
    type,
    contactInfo: contactInfo.trim(),
    message: message?.trim() || undefined,
    status: "yeni",
    createdAt: new Date().toISOString(),
  };
  await createDataRequest(request);

  await notifyAdmins(
    `Yeni KVKK veri talebi — ${vehicle.plateDisplay}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <p><strong>${escapeHtml(DATA_REQUEST_TYPE_LABELS[type])}</strong></p>
      <p>Araç: ${escapeHtml(vehicle.plateDisplay)}</p>
      <p>İletişim: ${escapeHtml(request.contactInfo)}</p>
      ${request.message ? `<p>Not: ${escapeHtml(request.message)}</p>` : ""}
      <p><a href="https://otohafiza.com/admin/veri-talepleri">Admin panelinden görüntüle</a></p>
    </div>`
  );

  return NextResponse.json({ ok: true });
}
