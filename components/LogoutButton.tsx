"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ağ hatası olsa bile kullanıcıyı ana sayfaya yönlendirmeye devam ediyoruz;
      // oturum çerezinin sunucuda temizlenmesi bu isteğe bağlı olsa da, en azından
      // kullanıcı arayüzde takılıp kalmasın.
    } finally {
      router.push("/");
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
