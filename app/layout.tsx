import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = process.env.URL || process.env.DEPLOY_URL || "https://oto-kunye.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Oto Künye | Oto Tamircileri için QR'lı Yağ Takip Sistemi",
  description:
    "Araca yapıştırılan QR kod ile yağ bakım geçmişini otomatik kaydedin ve gösterin. Oto tamircileri için SaaS.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Oto Künye | Oto Tamircileri için QR'lı Yağ Takip Sistemi",
    description:
      "Araca yapıştırılan QR kod ile yağ bakım geçmişini otomatik kaydedin ve gösterin.",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oto Künye | Oto Tamircileri için QR'lı Yağ Takip Sistemi",
    description:
      "Araca yapıştırılan QR kod ile yağ bakım geçmişini otomatik kaydedin ve gösterin.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oto Künye",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
