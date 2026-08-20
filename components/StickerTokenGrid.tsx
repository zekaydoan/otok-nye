"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BrandMark } from "@/components/icons";

interface TokenItem {
  token: string;
  vehicleId?: string;
}

interface Props {
  tokens: TokenItem[];
  baseUrl: string;
  // Genel stok partilerinde (bkz. app/admin/stok/[batchId]) henüz hiçbir bayiye ait
  // olmadığından bu ikisi boş bırakılabilir — bu durumda alt bilgi şeridi hiç basılmaz.
  labelName?: string;
  labelPhone?: string;
}

// Her token'ı hem gerçek bir QR kod olarak (doğrudan yazdırılabilir/PDF alınabilir)
// hem de düz metin link olarak gösterir — bayi kendi yazıcısından çıkarabilir ya da
// düz listeyi profesyonel bir baskı firmasına iletebilir.
export default function StickerTokenGrid({ tokens, baseUrl, labelName, labelPhone }: Props) {
  const [view, setView] = useState<"qr" | "list">("qr");

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-slate-300">
          <button
            onClick={() => setView("qr")}
            className={`px-3 py-1.5 text-sm font-medium ${
              view === "qr" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            QR Görünümü
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-sm font-medium ${
              view === "list" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Düz Liste
          </button>
        </div>
        {view === "qr" && (
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Yazdır / PDF Kaydet
          </button>
        )}
      </div>

      {view === "list" ? (
        <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <ol className="space-y-1 font-mono text-sm text-slate-700">
            {tokens.map((t, i) => (
              <li key={t.token}>
                {i + 1}. {baseUrl}/e/{t.token}
                {t.vehicleId && <span className="ml-2 font-sans text-xs text-green-600">(bağlandı)</span>}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="print-grid grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {tokens.map((t) => (
            <div
              key={t.token}
              className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white text-center shadow-sm"
              style={{ breakInside: "avoid" }}
            >
              <div className="flex items-center justify-center gap-1.5 bg-brand-700 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
                  <BrandMark className="h-2.5 w-2.5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Bakım Geçmişi
                </span>
              </div>

              <div className="flex flex-col items-center px-4 pb-3 pt-4">
                <div className="rounded-lg border-2 border-slate-800 bg-white p-1.5">
                  <QRCodeSVG
                    value={`${baseUrl}/e/${t.token}`}
                    size={110}
                    level="H"
                    imageSettings={{ src: "/icon-512.png", height: 22, width: 22, excavate: true }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  QR kodu okutup aracınıza kaydedin
                </p>
              </div>

              {labelName && (
                <div className="border-t-2 border-dashed border-slate-300 bg-accent-500/10 px-3 py-2">
                  <p className="text-xs font-bold text-accent-600">{labelName}</p>
                  {labelPhone && <p className="text-[11px] text-slate-600">{labelPhone}</p>}
                </div>
              )}

              {t.vehicleId && (
                <span className="no-print absolute right-2 top-2 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                  Bağlandı
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
