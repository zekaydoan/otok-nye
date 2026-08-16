// Basit, bağımlılıksız bir CSV üretici — admin panelindeki dışa aktarma
// butonları için (bkz. components/AdminShopSearch, app/admin/siparisler).
// RFC 4180'e yakın: alan içinde virgül/tırnak/satır sonu varsa çift tırnağa
// alınır, iç tırnaklar ikizlenir. Excel'in Türkçe karakterleri (ör. "İ", "ş")
// doğru göstermesi için UTF-8 BOM eklenir (bkz. downloadCsv).
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsvField(String(cell))).join(",")
  );
  return lines.join("\r\n");
}

// Yalnızca tarayıcıda çalışır (Blob/URL.createObjectURL) — "use client"
// bileşenlerinden çağrılmalı.
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
