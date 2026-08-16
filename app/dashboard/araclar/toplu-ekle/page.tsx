"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPlateForDisplay, validatePlate } from "@/lib/plates";
import type { Vehicle } from "@/lib/types";

interface ParsedRow {
  plate: string;
  brand: string;
  model: string;
  year: string;
  ownerName: string;
  ownerPhone: string;
  error?: string;
}

interface SkippedRow {
  row: number;
  plate?: string;
  reason: string;
}

// Basit, tırnaklı alan desteklemeyen bir CSV ayrıştırıcı — Excel/Google E-Tablolar'dan
// düz virgülle ayrılmış olarak dışa aktarılan ya da elle yapıştırılan listeler için
// yeterlidir. Plaka/marka/model gibi alanlarda virgül geçmesi beklenmediğinden bu
// kısıtlama pratikte sorun yaratmaz.
function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = lines.map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      plate: cols[0] || "",
      brand: cols[1] || "",
      model: cols[2] || "",
      year: cols[3] || "",
      ownerName: cols[4] || "",
      ownerPhone: cols[5] || "",
    };
  });

  // İlk satır başlık gibi görünüyorsa (ör. "Plaka") atla — kullanıcı başlık
  // satırını silmeyi unutsa bile listeye hatalı bir "araç" olarak girmesin.
  if (rows.length > 0 && /^plaka$/i.test(rows[0].plate)) {
    rows.shift();
  }

  return rows.map((r) => {
    if (!r.plate || !r.brand || !r.model) {
      return { ...r, error: "Plaka, marka ve model zorunludur." };
    }
    const check = validatePlate(r.plate);
    if (!check.valid) {
      return { ...r, error: check.message };
    }
    return { ...r, plate: formatPlateForDisplay(check.normalized) };
  });
}

const EXAMPLE = `34 ABC 123,Volkswagen,Passat,2019,Ahmet Yılmaz,05551234567
06 XY 789,Renault,Clio,2021,,`;

export default function BulkImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: Vehicle[]; skipped: SkippedRow[] } | null>(null);

  const validCount = useMemo(() => rows?.filter((r) => !r.error).length ?? 0, [rows]);
  const invalidCount = (rows?.length ?? 0) - validCount;

  function resetPreview() {
    setRows(null);
    setResult(null);
    setError(null);
  }

  function handleParse() {
    setError(null);
    setResult(null);
    if (!raw.trim()) {
      setError("Önce yapıştıracak veya yükleyecek bir liste girin.");
      return;
    }
    const parsed = parseCsv(raw);
    if (parsed.length === 0) {
      setError("Geçerli bir satır bulunamadı.");
      return;
    }
    setRows(parsed);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result || ""));
      resetPreview();
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleSubmit() {
    if (!rows) return;
    const validRows = rows.filter((r) => !r.error);
    if (validRows.length === 0) {
      setError("İçe aktarılacak geçerli satır yok.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vehicles/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresBilling) {
          router.push(`/dashboard/fatura-bilgileri?returnTo=${encodeURIComponent("/dashboard/araclar/toplu-ekle")}`);
          return;
        }
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      setResult(data);
      // Netlify Blobs'un .list() gecikmesi yüzünden dashboard'a hemen dönülürse
      // yeni eklenen araçlar henüz görünmeyebilir — sessionStorage köprüsüyle
      // (bkz. VehicleListSection) anında listeye ekleniyor.
      if (data.created?.length) {
        try {
          sessionStorage.setItem("otoHafizaTopluArac", JSON.stringify(data.created));
        } catch {
          // sessionStorage kullanılamıyorsa sessizce yok say.
        }
      }
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-brand-600">
        ← Araçlarım
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Toplu Araç Ekle</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mevcut müşteri listenizi Excel/Google E-Tablolar'dan CSV olarak dışa aktarıp
        yükleyin ya da aşağıya yapıştırın. Sütun sırası: Plaka, Marka, Model, Yıl,
        Sahibi Adı, Sahibi Telefonu — Yıl ve sahip bilgileri boş bırakılabilir.
      </p>

      {!result && (
        <div className="mt-6 space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">CSV Dosyası Yükle</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFile}
              className="mt-1 w-full text-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">veya Buraya Yapıştırın</label>
            <textarea
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                resetPreview();
              }}
              rows={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none"
              placeholder={EXAMPLE}
            />
            <button
              type="button"
              onClick={() => {
                setRaw(EXAMPLE);
                resetPreview();
              }}
              className="mt-1 text-xs font-medium text-brand-600 hover:underline"
            >
              Örnek formatı doldur
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!rows && (
            <button
              type="button"
              onClick={handleParse}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Listeyi Önizle
            </button>
          )}

          {rows && (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-brand-700">{validCount}</span> geçerli satır
                {invalidCount > 0 && (
                  <>
                    , <span className="font-semibold text-red-600">{invalidCount}</span> hatalı
                    satır (içe aktarılmayacak)
                  </>
                )}
              </p>
              <div className="mt-2 max-h-72 overflow-x-auto overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[480px] text-xs">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Plaka</th>
                      <th className="px-3 py-2 font-medium">Marka / Model</th>
                      <th className="px-3 py-2 font-medium">Sahibi</th>
                      <th className="px-3 py-2 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r, i) => (
                      <tr key={i} className={r.error ? "bg-red-50" : ""}>
                        <td className="px-3 py-2 text-slate-900">{r.plate || "—"}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {r.brand} {r.model}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{r.ownerName || "—"}</td>
                        <td className="px-3 py-2">
                          {r.error ? (
                            <span className="text-red-600">{r.error}</span>
                          ) : (
                            <span className="text-green-600">Hazır</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <label className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Listedeki tüm araç sahiplerinin bilgilerinin (plaka, iletişim, bakım
                  geçmişi) dijital ortamda saklanacağı, QR kod ile görüntülenebileceği ve
                  bakım hatırlatması için kullanılabileceği konusunda kendilerini
                  bilgilendirdiğimi onaylıyorum. Detaylar:{" "}
                  <Link href="/kvkk" target="_blank" className="font-medium text-brand-600 underline">
                    KVKK Aydınlatma Metni
                  </Link>
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || validCount === 0 || !consent}
                className="mt-4 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "İçe aktarılıyor..." : `${validCount} Aracı İçe Aktar`}
              </button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <p className="text-sm font-semibold text-slate-900">
            {result.created.length} araç eklendi
            {result.skipped.length > 0 && `, ${result.skipped.length} satır atlandı`}.
          </p>
          {result.skipped.length > 0 && (
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {result.skipped.map((s, i) => (
                <p key={i}>
                  Satır {s.row} {s.plate ? `(${s.plate})` : ""}: {s.reason}
                </p>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Araçlarıma Dön
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setRows(null);
                setRaw("");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Yeni Liste Yükle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
