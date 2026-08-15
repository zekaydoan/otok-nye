"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Bayi hesabını kalıcı olarak silen, geri alınamaz bir işlem — yanlışlıkla tek
// tıkla tetiklenmesin diye admin, bayinin adını harfiyen yazarak onaylamak
// zorunda (GitHub'daki "type to confirm" deseniyle aynı mantık). Silme, bayinin
// aboneliğini/planını da otomatik iptal eder — bkz. lib/blobStore.ts deleteShop
// yorumundaki kapsam notu.
export default function AdminDeleteShopButton({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === shopName;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Silinemedi, lütfen tekrar deneyin.");
        return;
      }
      showToast("Bayi hesabı silindi.");
      router.push("/admin/bayiler");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <h2 className="font-bold text-red-800">Tehlikeli Bölge</h2>
      <p className="mt-1 text-sm text-red-700">
        Bu hesabı sildiğinizde bayinin girişi, ekip/çalışan hesapları, randevuları ve
        önerileri kalıcı olarak silinir; abonelik/planı otomatik olarak iptal edilir.
        Araç ve bakım kayıtları ile geçmiş etiket siparişleri (mali kayıt olduğu için)
        silinmez. Bu işlem geri alınamaz.
      </p>

      <label className="mt-4 block text-xs font-medium text-red-700">
        Onaylamak için bayi adını yazın: <span className="font-semibold">{shopName}</span>
      </label>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="mt-1 w-full max-w-sm rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none sm:w-auto"
      />

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3">
        <button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Siliniyor..." : "Bayiyi Kalıcı Olarak Sil"}
        </button>
      </div>
    </div>
  );
}
