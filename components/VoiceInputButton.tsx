"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/components/icons";

// Tarayıcının yerleşik konuşma tanıma API'si (Web Speech API) standart bir arayüze
// sahip değil — Chrome/Edge'de `webkitSpeechRecognition` olarak, bazı diğer
// tarayıcılarda hiç bulunmuyor. TypeScript'in DOM tip tanımları bu API'yi
// içermediğinden `window`'u `any`'e daraltarak erişiyoruz; destekleyen tarayıcı
// yoksa düğme hiç görünmez (bkz. aşağıdaki `supported` kontrolü), bu yüzden
// tip güvenliği eksikliği çalışma zamanı hatasına yol açmaz.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// Usta bir sayıyı sesli söylediğinde tanıma motoru genelde rakam olarak yazıya
// döker (ör. "dört buçuk" değil "4.5" veya "4,5" döner) — bu yüzden dikteden gelen
// metinden ilk sayıyı ayıklamak, tam bir Türkçe sayı-okuma ayrıştırıcısı yazmaktan
// çok daha güvenilir. Virgül ondalık ayıracı olarak noktaya çevrilir.
export function extractFirstNumber(text: string): string | null {
  const match = text.replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? match[0] : null;
}

export default function VoiceInputButton({
  onResult,
  numeric = false,
  label,
}: {
  // Tanınan metni (numeric=true ise ayıklanmış sayıyı) alan geri çağırım.
  onResult: (value: string) => void;
  numeric?: boolean;
  label?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  function handleClick() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "tr-TR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript: string = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) return;
      if (numeric) {
        const num = extractFirstNumber(transcript);
        if (num) onResult(num);
      } else {
        onResult(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label ? `${label} için sesle doldur` : "Sesle doldur"}
      title={listening ? "Dinleniyor... durdurmak için tıklayın" : "Sesle doldur"}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
        listening
          ? "animate-pulse border-red-400 bg-red-50 text-red-600"
          : "border-slate-300 text-slate-500 hover:bg-slate-50"
      }`}
    >
      <MicIcon className="h-3.5 w-3.5" />
    </button>
  );
}
