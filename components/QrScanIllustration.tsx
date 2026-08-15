// Ana sayfa hero başlığı "Araca yapıştırın, her bakımda okutun, geçmiş
// kendiliğinden biriksin." sözünü tek bakışta somutlaştıran el çizimi tarzı bir
// sahne: kaputa yapıştırılmış bir QR etiketi ve onu okutan bir telefon. Metin
// yoğun bir sayfada okuma hafızasından çok görsel hafızayı hedefleyen tek
// büyük illüstrasyon — önceki soyut "veri kartı" mockup'ının yerini alır
// (bkz. app/page.tsx hero bölümü). Site genelindeki çizgi-ikon dilini (bkz.
// components/icons.tsx) düz renk dolgularla birleştirir, harici görsel dosyası
// gerektirmez.
export default function QrScanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 260"
      className={className}
      role="img"
      aria-label="Motor kaputuna yapıştırılan QR etiketin bir telefonla okutulması"
    >
      {/* zemin gölgesi */}
      <ellipse cx="150" cy="230" rx="130" ry="10" className="fill-slate-200/70" />

      {/* araba gövdesi */}
      <path
        d="M38 192
           Q38 150 80 148
           L100 148
           Q112 116 150 114
           L192 114
           Q224 116 234 148
           L254 148
           Q276 150 276 180
           L276 192
           Z"
        className="fill-brand-100 stroke-brand-700"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* kabin camı */}
      <path
        d="M112 148 Q122 124 150 122 L188 122 Q214 124 222 148 Z"
        className="fill-white stroke-brand-700"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* tampon çizgisi */}
      <path d="M38 180 L276 180" className="stroke-brand-300" strokeWidth="2" />

      {/* tekerlekler */}
      <circle cx="92" cy="194" r="19" className="fill-slate-800" />
      <circle cx="92" cy="194" r="7" className="fill-slate-300" />
      <circle cx="230" cy="194" r="19" className="fill-slate-800" />
      <circle cx="230" cy="194" r="7" className="fill-slate-300" />

      {/* far */}
      <rect x="258" y="166" width="16" height="9" rx="2.5" className="fill-accent-400" />

      {/* QR etiketi — kaputun üzerinde hafif eğik, gerçek bir etiket gibi */}
      <g transform="translate(150 98) rotate(-9)">
        <rect
          x="-30"
          y="-30"
          width="60"
          height="60"
          rx="9"
          className="fill-white stroke-slate-300"
          strokeWidth="2"
        />
        <g className="fill-slate-900">
          <rect x="-22" y="-22" width="15" height="15" rx="1.5" />
          <rect x="-17" y="-17" width="5" height="5" className="fill-white" />
          <rect x="7" y="-22" width="15" height="15" rx="1.5" />
          <rect x="12" y="-17" width="5" height="5" className="fill-white" />
          <rect x="-22" y="7" width="15" height="15" rx="1.5" />
          <rect x="-17" y="12" width="5" height="5" className="fill-white" />
          <rect x="-2" y="-2" width="6" height="6" />
          <rect x="8" y="8" width="7" height="7" />
          <rect x="-2" y="12" width="5" height="5" />
          <rect x="10" y="-8" width="5" height="5" />
        </g>
      </g>

      {/* tarama bağlantısı — kesikli çizgi, QR'dan telefona doğru dikkat çeker */}
      <line
        x1="196"
        y1="86"
        x2="264"
        y2="76"
        className="stroke-accent-500"
        strokeWidth="2.5"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />

      {/* telefon — QR'ı okutuyor */}
      <g transform="translate(302 66)">
        <rect
          x="-27"
          y="-48"
          width="54"
          height="96"
          rx="11"
          className="fill-white stroke-slate-700"
          strokeWidth="3"
        />
        <rect x="-19" y="-38" width="38" height="62" rx="4" className="fill-brand-50" />
        {/* kamera tarama köşeleri */}
        <g className="stroke-accent-500" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M-13 -30 L-13 -22 M-13 -30 L-5 -30" />
          <path d="M13 -30 L13 -22 M13 -30 L5 -30" />
          <path d="M-13 6 L-13 -2 M-13 6 L-5 6" />
          <path d="M13 6 L13 -2 M13 6 L5 6" />
        </g>
        {/* okutuldu göstergesi */}
        <circle cx="0" cy="-12" r="3" className="fill-green-500">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
