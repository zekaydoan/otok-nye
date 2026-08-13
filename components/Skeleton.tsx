// Blob store okumaları bazen (nihai tutarlılık / soğuk başlangıç) gözle görülür
// bir gecikme yaşayabiliyor — bu, Next.js'in dosya tabanlı `loading.tsx`
// konvansiyonuyla eşleşen sayfa segmentlerinde otomatik olarak gösterilen basit
// bir "iskelet" (skeleton) bloğu. Tailwind'in yerleşik `animate-pulse` sınıfını
// kullanır, ekstra CSS gerekmez.
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}
