"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface ShopOption {
  id: string;
  name: string;
  email: string;
}

const TR_CITIES_HINT = "İstanbul, Ankara, İzmir...";

// "Etiket Hediye Kararı" (bkz. pazarlama/ETIKET_HEDIYE_KARARI_BEKLIYOR.md) —
// kart çekmeden, iyzico'ya hiç dokunmadan bir bayiye ücretsiz/pilot QR etiket
// vermek için. Bayi seçimi bir <input list> + <datalist> ile yapılır (ayrı bir
// arama kütüphanesi eklemeden, çok sayıda bayi olsa bile yazarak filtrelenebilsin
// diye) — seçilen "İsim — e-posta" metni burada shopId'ye geri çözülür.
export default function AdminGiftStickerForm({ shops }: { shops: ShopOption[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [shopQuery, setShopQuery] = useState("");
  const [quantity, setQuantity] = useState("20");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shopLabel = (s: ShopOption) => `${s.name} — ${s.email}`;
  const selectedShop = shops.find((s) => shopLabel(s) === shopQuery) || null;

  function resetForm() {
    setShopQuery("");
    setQuantity("20");
    setFullName("");
    setPhone("");
    setAddressLine("");
    setDistrict("");
    setCity("");
    setPostalCode("");
    setNote("");
  }

  async function handleSubmit() {
    setError(null);
    if (!selectedShop) {
      setError("Listeden geçerli bir bayi seçmelisiniz.");
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Geçerli bir adet giriniz.");
      return;
    }
    if (!fullName || !phone || !addressLine || !district || !city) {
      setError("Teslimat adresi bilgilerini eksiksiz doldurun.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/etiket-hediye", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: selectedShop.id,
          quantity: qty,
          address: { fullName, phone, addressLine, district, city, postalCode: postalCode || undefined },
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Kaydedilemedi.");
        return;
      }
      showToast(`${qty} adet ücretsiz etiket oluşturuldu.`);
      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-slate-100 hover:bg-brand-50"
      >
        🎁 Ücretsiz Etiket Ver
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">🎁 Ücretsiz Etiket Ver</p>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Kapat
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Kart çekilmez, fatura kesilmez — sipariş doğrudan "Ödendi" durumunda
        oluşur ve normal sipariş ekranından üretim/kargo takibi yapılır.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">Bayi</label>
          <input
            list="gift-shop-options"
            value={shopQuery}
            onChange={(e) => setShopQuery(e.target.value)}
            placeholder="İsim veya e-posta ile arayın..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <datalist id="gift-shop-options">
            {shops.map((s) => (
              <option key={s.id} value={shopLabel(s)} />
            ))}
          </datalist>
          {shopQuery && !selectedShop && (
            <p className="mt-1 text-[11px] text-amber-600">Listeden bir bayi seçmelisiniz.</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Adet</label>
          <input
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Not (opsiyonel)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ör. İlk 20 Müşteri pilotu"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 mt-1 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-700">Teslimat Adresi</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Ad Soyad / Yetkili</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Telefon</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600">Adres</label>
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">İlçe</label>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">İl</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={TR_CITIES_HINT}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Posta Kodu (opsiyonel)</label>
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Oluşturuluyor..." : "Ücretsiz Etiket Oluştur"}
        </button>
      </div>
    </div>
  );
}
