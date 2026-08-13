// Dashboard karşılama başlığı için günün saatine göre selamlama metni üretir.
// Sunucu saatine (Netlify fonksiyon runtime'ı) göre çalışır; Türkiye saat
// diliminden birkaç saat sapma olsa bile ("Günaydın" yerine "İyi günler" gibi)
// kritik bir işlevsellik değil, sadece küçük bir kişiselleştirme dokunuşu.
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}
