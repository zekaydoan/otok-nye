// Ana sayfa hero başlığı "Araca yapıştırın, her bakımda okutun, geçmiş
// kendiliğinden biriksin." sözünü tek bakışta somutlaştıran, hareketli ve
// canlı renkli bir sahne: kaputa yapıştırılmış, parlayan bir QR etiketi ve
// onu okutan bir telefon. İlk sürüm (düz çizgi + soluk renkler) çok "sakin"
// kaldığı için — bkz. kullanıcı geri bildirimi "daha dikkat çekici olmalı" —
// bu sürüm degrade dolgular, parlama/ışıma efektleri (radial gradient glow),
// nabız gibi atan bir tarama halkası ve telefon ekranında sürekli kayan bir
// tarama çizgisiyle çok daha "canlı" ve dikkat çekici bir his hedefliyor.
export default function QrScanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      className={className}
      role="img"
      aria-label="Motor kaputuna yapıştırılan, parlayan bir QR etiketin telefonla okutulması"
    >
      <defs>
        <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <clipPath id="phoneScreenClip">
          <rect x="-20" y="-40" width="40" height="66" rx="5" />
        </clipPath>
      </defs>

      {/* zemin gölgesi */}
      <ellipse cx="155" cy="284" rx="150" ry="12" className="fill-slate-900/10" />

      {/* QR etiketinin arkasındaki turuncu parlama — sahnenin en dikkat çeken
          noktasını nabız gibi atarak vurgular */}
      <circle cx="158" cy="118" r="62" fill="url(#glowGrad)">
        <animate attributeName="r" values="55;68;55" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* araba gövdesi — degrade dolgulu, önceki soluk halinden çok daha canlı */}
      <g transform="rotate(-3 155 190)">
        <path
          d="M32 226
             Q32 176 80 174
             L104 174
             Q118 136 160 134
             L206 134
             Q242 136 254 174
             L278 174
             Q302 176 302 210
             L302 226
             Z"
          fill="url(#carGrad)"
          stroke="#eff6ff"
          strokeOpacity="0.9"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M118 174 Q130 146 160 144 L202 144 Q232 146 242 174 Z"
          className="fill-white"
          stroke="#eff6ff"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <path d="M32 214 L302 214" stroke="#bfdbfe" strokeWidth="2.5" opacity="0.8" />

        {/* tekerlekler */}
        <circle cx="96" cy="228" r="22" className="fill-slate-900" />
        <circle cx="96" cy="228" r="9" className="fill-slate-300" />
        <circle cx="254" cy="228" r="22" className="fill-slate-900" />
        <circle cx="254" cy="228" r="9" className="fill-slate-300" />

        {/* far */}
        <rect x="286" y="188" width="18" height="10" rx="3" className="fill-accent-400" />
      </g>

      {/* nabız gibi atan tarama halkası — QR etiketinin çevresinde */}
      <circle cx="158" cy="112" r="40" fill="none" className="stroke-accent-500" strokeWidth="2.5">
        <animate attributeName="r" values="34;46;34" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* QR etiketi — büyük, gerçekçi köşe işaretleriyle, hafif eğik */}
      <g transform="translate(158 112) rotate(-8)">
        <rect
          x="-38"
          y="-38"
          width="76"
          height="76"
          rx="10"
          className="fill-white"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <g className="fill-slate-900">
          <rect x="-29" y="-29" width="20" height="20" rx="2" />
          <rect x="-23" y="-23" width="8" height="8" className="fill-white" />
          <rect x="9" y="-29" width="20" height="20" rx="2" />
          <rect x="15" y="-23" width="8" height="8" className="fill-white" />
          <rect x="-29" y="9" width="20" height="20" rx="2" />
          <rect x="-23" y="15" width="8" height="8" className="fill-white" />
          <rect x="-3" y="-3" width="8" height="8" />
          <rect x="10" y="10" width="10" height="10" />
          <rect x="-3" y="16" width="7" height="7" />
          <rect x="14" y="-8" width="7" height="7" />
          <rect x="-16" y="2" width="6" height="6" />
        </g>
      </g>

      {/* tarama bağlantısı — kesikli, hareketli "enerji akışı" hissi veren çizgi */}
      <line x1="214" y1="98" x2="292" y2="80" className="stroke-accent-500" strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="0.7s" repeatCount="indefinite" />
      </line>

      {/* telefon — büyük, koyu degradeli, ekranında sürekli kayan tarama çizgisiyle */}
      <g transform="translate(330 76) rotate(6)">
        <rect x="-32" y="-56" width="64" height="112" rx="13" fill="url(#phoneGrad)" />
        <rect x="-26" y="-48" width="52" height="96" rx="8" className="fill-slate-800" />
        <g clipPath="url(#phoneScreenClip)">
          <rect x="-20" y="-40" width="40" height="66" rx="5" className="fill-brand-50" />
          {/* sürekli yukarı-aşağı kayan tarama çizgisi */}
          <rect x="-20" y="-40" width="40" height="4" className="fill-accent-500" opacity="0.9">
            <animate attributeName="y" values="-40;22;-40" dur="1.8s" repeatCount="indefinite" />
          </rect>
        </g>
        {/* kamera tarama köşeleri */}
        <g className="stroke-accent-400" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M-15 -33 L-15 -24 M-15 -33 L-6 -33" />
          <path d="M15 -33 L15 -24 M15 -33 L6 -33" />
          <path d="M-15 7 L-15 -2 M-15 7 L-6 7" />
          <path d="M15 7 L15 -2 M15 7 L6 7" />
        </g>
        {/* alt hoparlör/ev tuşu detayı — telefonu daha "gerçek" gösterir */}
        <rect x="-8" y="42" width="16" height="3" rx="1.5" className="fill-slate-500" />
      </g>

      {/* okutuldu parıltısı — telefonun üstünde ışıldayan yıldız */}
      <g transform="translate(360 26)">
        <path
          d="M0 -10 L2.4 -2.4 10 0 2.4 2.4 0 10 -2.4 2.4 -10 0 -2.4 -2.4Z"
          className="fill-accent-400"
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.7;1.15;0.7"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(60 60)">
        <path
          d="M0 -6 L1.4 -1.4 6 0 1.4 1.4 0 6 -1.4 1.4 -6 0 -1.4 -1.4Z"
          className="fill-accent-200"
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1.1;0.6;1.1"
            dur="1.9s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.9s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}
