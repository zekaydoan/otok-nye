import { ImageResponse } from "next/og";

// Next.js'in dosya tabanlı Open Graph görsel konvansiyonu — bu dosya build
// sırasında otomatik olarak 1200x630'luk bir PNG üretir ve app/layout.tsx'teki
// metadata'ya ekstra bir şey yazmadan sitenin <meta property="og:image"> ve
// Twitter kart etiketlerine bağlanır. Böylece bir bağlantı WhatsApp/Slack/X gibi
// platformlarda paylaşıldığında markayla uyumlu bir önizleme kartı görünür.
export const alt = "OtoHafıza — Araç bakım işletmeleri için QR'lı dijital yağ bakım defteri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #172554 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 120,
            width: 120,
            borderRadius: 28,
            background: "rgba(255,255,255,0.14)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.6c-1 1.7-3.9 5.9-3.9 8.5a3.9 3.9 0 0 0 7.8 0c0-2.6-2.9-6.8-3.9-8.5Z"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path d="M10.1 13.1l1.5 1.4 2.6-2.9" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            display: "flex",
          }}
        >
          OtoHafıza
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            display: "flex",
          }}
        >
          Araç bakım işletmeleri için QR&apos;lı dijital yağ bakım defteri
        </div>
      </div>
    ),
    { ...size }
  );
}
