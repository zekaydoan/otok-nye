"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { PARTNER_CATEGORY_LABELS, PARTNER_TIER_LABELS, type PartnerCategory } from "@/lib/types";
// Yalnızca tip olarak içe aktarılıyor (import type) — derleme sırasında
// tamamen elenir, bu yüzden lib/blobStore.ts'in sunucuya özel bağımlılığı
// (@netlify/blobs) istemci paketine karışmaz.
import type { PartnerSummary } from "@/lib/blobStore";

// Admin Partnerler sayfasının tamamını yöneten istemci bileşeni — hem yeni
// partner ekleme formunu hem de mevcut partner listesini aynı bileşende
// tutar (bkz. AdminAnnouncementForm'daki aynı desen). Yeni partner eklendiğinde
// listeyi sunucudan taze veriyle yeniden çekmek için router.refresh() kullanılır
// — PartnerSummary hesaplı alanlar (aktif işletme sayısı, tahakkuk eden
// komisyon vb.) içerdiğinden, sıfır bir partner için bunları client tarafında
// yeniden hesaplamak yerine sunucuya bırakmak daha güvenilir.
export default function AdminPartnerForm({
  initialPartners,
}: {
  initialPartners: PartnerSummary[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  // V2 sadeleştirme (23 Ağustos 2026, Zeki onayı): partner sayısı arttıkça
  // düz liste sürdürülemez hale geliyordu — basit isim/bölge araması eklendi
  // (bkz. components/AdminShopSearch.tsx ile aynı istemci taraflı desen).
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<PartnerCategory | "">("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(initialPartners.length === 0);
  const [created, setCreated] = useState<{ name: string; referralCode: string; tempPassword: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) return setError("Ad Soyad zorunlu.");
    if (!trimmedPhone) return setError("Telefon zorunlu.");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/partnerler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: email.trim() || undefined,
          category: category || undefined,
          region: region.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Partner eklenemedi.");
        return;
      }
      showToast("Partner eklendi.");
      setCreated({
        name: data.partner.name,
        referralCode: data.partner.referralCode,
        tempPassword: data.tempPassword,
      });
      setName("");
      setPhone("");
      setEmail("");
      setCategory("");
      setRegion("");
      setFormOpen(false);
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const filteredPartners = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialPartners;
    return initialPartners.filter(
      (s) =>
        s.partner.name.toLowerCase().includes(q) ||
        (s.partner.region || "").toLowerCase().includes(q)
    );
  }, [initialPartners, query]);

  return (
    <div className="mt-6 space-y-6">
      {created && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">
                {created.name} eklendi — giriş bilgilerini WhatsApp&apos;tan iletin
              </p>
              <p className="mt-1 text-amber-800">
                Telefon: partnerin girdiği numara · Geçici şifre:{" "}
                <span className="font-mono font-bold">{created.tempPassword}</span>
              </p>
              <p className="mt-1 text-amber-800">
                Referans linki: partner detay sayfasından kopyalanabilir (kod: {created.referralCode})
              </p>
              <p className="mt-2 text-xs text-amber-700">
                Bu şifre yalnızca şimdi gösteriliyor, tekrar görüntülenemez — kaydetmeden kapatmayın.
              </p>
            </div>
            <button
              onClick={() => setCreated(null)}
              className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {formOpen ? (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn. Ahmet Yılmaz"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0555 000 00 00"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-posta (opsiyonel)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PartnerCategory | "")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Seçilmedi</option>
                {Object.entries(PARTNER_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Bölge (opsiyonel)</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Örn. Merter Oto Sanayi Sitesi, İstanbul"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Ekleniyor..." : "Partner Ekle"}
            </button>
            {initialPartners.length > 0 && (
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>
            )}
          </div>
        </form>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          + Yeni Partner Ekle
        </button>
      )}

      <div>
        {initialPartners.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz bir partner eklenmedi.</p>
        ) : (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim veya bölge ara..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-2 text-xs text-slate-400">
              {filteredPartners.length} / {initialPartners.length} partner gösteriliyor
            </p>
          </>
        )}
        {initialPartners.length > 0 && filteredPartners.length === 0 && (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">
            Sonuç bulunamadı.
          </p>
        )}
        {filteredPartners.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Seviye</th>
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Ücretli</th>
                  <th className="px-4 py-3">Bekleyen Komisyon</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((s) => (
                  <tr key={s.partner.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/partnerler/${s.partner.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {s.partner.name}
                      </Link>
                      <p className="text-xs text-slate-400">{s.partner.referralCode}</p>
                    </td>
                    <td className="px-4 py-3">{PARTNER_TIER_LABELS[s.tier]}</td>
                    <td className="px-4 py-3">
                      {s.activeShopCount}/{s.totalShopCount}
                    </td>
                    <td className="px-4 py-3">{s.paidShopCount}</td>
                    <td className="px-4 py-3 font-medium">
                      {s.pendingCommissionTry.toLocaleString("tr-TR")} TL
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          s.partner.status === "aktif"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.partner.status === "aktif" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
