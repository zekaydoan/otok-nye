"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { CameraIcon } from "@/components/icons";

// Telefon kamerasıyla aracın üzerindeki QR etiketini tarayıp doğrudan araç sayfasına
// yönlendirir — ustanın plaka yazmasına gerek bırakmaz. jsQR saf JS ile çalıştığı için
// (native bağımlılık yok) tüm modern tarayıcılarda (iOS Safari dahil) çalışır.
export default function QrScanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Kamerayı QR koduna doğrultun");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const foundRef = useRef(false);

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function extractVehicleId(rawValue: string): string | null {
    try {
      const url = new URL(rawValue);
      const match = url.pathname.match(/\/arac\/([a-zA-Z0-9-]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  function tick() {
    if (foundRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      const vehicleId = extractVehicleId(code.data);
      if (vehicleId) {
        foundRef.current = true;
        setStatus("Araç bulundu, yönlendiriliyor...");
        stop();
        setTimeout(() => {
          setOpen(false);
          router.push(`/dashboard/araclar/${vehicleId}`);
        }, 400);
        return;
      }
      setStatus("Bu bir OtoHafıza etiketi değil, taramaya devam ediliyor...");
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function start() {
    setError(null);
    setStatus("Kamerayı QR koduna doğrultun");
    foundRef.current = false;
    setOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError(
        "Kameraya erişilemedi. Tarayıcı izinlerini kontrol edin veya aşağıdan plaka ile arayın."
      );
    }
  }

  function close() {
    stop();
    setOpen(false);
  }

  useEffect(() => stop, []);

  if (!open) {
    return (
      <button
        onClick={start}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
      >
        <CameraIcon className="h-4 w-4" />
        QR ile Ara
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} muted playsInline className="w-full" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-4 text-center text-sm text-white">{error || status}</p>
      <button
        onClick={close}
        className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
      >
        Kapat
      </button>
    </div>
  );
}
