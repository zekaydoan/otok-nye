"use client";

import { WhatsAppIcon } from "@/components/icons";

// Panelden tek tıkla WhatsApp hatırlatma gönderme butonu. Normal bir <a href>
// yeterli olurdu ama bayinin "gönderdim" bilgisinin kalıcı olarak kaydedilmesi
// (bkz. lib/blobStore.ts ReminderLogEntry) ve otomatik gece taramasının aynı
// döngü için tekrar mesaj göndermemesi için, linki açmadan önce sessizce bir
// API çağrısıyla durumu işaretliyoruz. API çağrısı başarısız olsa bile WhatsApp
// linkinin açılmasını engellemiyoruz — kayıt tutulamasa da mesajın gitmesi
// önceliklidir.
export default function WhatsAppReminderButton({
  vehicleId,
  whatsAppLink,
}: {
  vehicleId: string;
  whatsAppLink: string;
}) {
  function handleClick() {
    fetch(`/api/vehicles/${vehicleId}/reminder-sent`, { method: "POST" }).catch(() => {
      // Sessizce yok say — kayıt tutulamasa bile mesaj zaten yeni sekmede açılıyor.
    });
  }

  return (
    <a
      href={whatsAppLink}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
      WhatsApp'tan Hatırlat
    </a>
  );
}
