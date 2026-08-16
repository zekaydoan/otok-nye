"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { BrandMark, WarningIcon } from "@/components/icons";

interface Props {
  vehicleId: string;
  plateDisplay: string;
  defaultShopName: string;
  defaultShopPhone: string;
}

export default function StickerEditor({
  vehicleId,
  plateDisplay,
  defaultShopName,
  defaultShopPhone,
}: Props) {
  const [origin, setOrigin] = useState("");
  const [shopName, setShopName] = useState(defaultShopName);
  const [shopPhone, setShopPhone] = useState(defaultShopPhone);
  const [copies, setCopies] = useState(4);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/arac/${vehicleId}` : "";

  // Yazdırma işleminin kendisini engellemeyen, sonucunu beklemeyen bir bildirim
  // — admin panelinde bilgi amaçlı görünür (bkz. app/admin/bekleyen-isler).
  // Ağ hatası olursa sessizce yutulur, kullanıcı bunu asla görmemeli.
  function handlePrint() {
    fetch(`/api/vehicles/${vehicleId}/etiket-yazdirildi`, { method: "POST" }).catch(() => {});
    window.print();
  }

  return (
    <div>
      <div className="no-print mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:flex sm:flex-wrap sm:items-end">
        <div className="sm:w-64">
          <label className="block text-sm font-medium text-slate-700">Etikette Görünecek Firma Adı</label>
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-slate-700">Telefon (reklam alanı)</label>
          <input
            value={shopPhone}
            onChange={(e) => setShopPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="sm:w-20">
          <label className="block text-sm font-medium text-slate-700">Kaç Adet</label>
          <input
            type="number"
            min={1}
            max={24}
            value={copies}
            onChange={(e) => setCopies(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <button
            onClick={handlePrint}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Yazdır / PDF Kaydet
          </button>
          <Link
            href={`/dashboard/araclar/${vehicleId}`}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Geri
          </Link>
        </div>
      </div>

      <div className="no-print mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          Bu etiketi kendi yazıcınızdan bastırıp standart bir yapışkanla monte ediyorsunuz;
          motor bölmesindeki sıcaklık, yağ ve nem zamanla baskının solmasına veya etiketin
          yerinden çıkmasına yol açabilir. Uzun süre okunur ve sağlam kalması için, mümkünse
          etiketi laminatlı ya da su geçirmez bir yüzeye yapıştırın —{" "}
          <Link href="/dashboard/etiket-siparis" className="font-semibold text-amber-900 underline hover:text-amber-950">
            dayanıklı, hazır basılmış QR etiket seçeneğimize
          </Link>{" "}
          de göz atabilirsiniz.
        </p>
      </div>

      <div className="print-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: copies }).map((_, i) => (
          <div
            key={i}
            className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white text-center shadow-sm"
            style={{ breakInside: "avoid" }}
          >
            {/* Kesim/hizalama işaretleri — yazdırıldığında kartın nereden kesileceğini gösterir */}
            <span className="no-print absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-slate-300" />
            <span className="no-print absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-slate-300" />
            <span className="no-print absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-slate-300" />
            <span className="no-print absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-slate-300" />

            <div className="flex items-center justify-center gap-1.5 bg-brand-700 py-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
                <BrandMark className="h-2.5 w-2.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                Yağ Bakım Geçmişi
              </span>
            </div>

            <div className="flex flex-col items-center px-4 pb-3 pt-4">
              <div className="rounded-lg border-2 border-slate-800 bg-white p-1.5">
                {url && <QRCodeSVG value={url} size={130} level="M" />}
              </div>

              {/* Türkiye plakası görünümüne benzeyen etiket — okunabilirliği ve
                  "resmi/güvenilir" hissi artırmak için */}
              <div className="mt-3 flex overflow-hidden rounded-md border-2 border-slate-900">
                <div className="flex items-center bg-brand-700 px-1">
                  <span className="text-[7px] font-bold leading-none text-white">TR</span>
                </div>
                <div className="bg-white px-3 py-1">
                  <span className="text-lg font-extrabold tracking-wide text-slate-900">
                    {plateDisplay}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                QR kodu okutup bakım geçmişini görün
              </p>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 bg-accent-500/10 px-3 py-2">
              <p className="text-xs font-bold text-accent-600">{shopName}</p>
              {shopPhone && <p className="text-[11px] text-slate-600">{shopPhone}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
