"use client";

import { useRouter } from "next/navigation";

export default function PartnerLogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await fetch("/api/partner/cikis", { method: "POST" });
    } catch {
      // bkz. components/LogoutButton.tsx aynı yorum — ağ hatası olsa bile
      // kullanıcı takılıp kalmasın diye yönlendirmeye devam edilir.
    } finally {
      router.push("/partner-girisi");
      router.refresh();
    }
  }
  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      Çıkış Yap
    </button>
  );
}
