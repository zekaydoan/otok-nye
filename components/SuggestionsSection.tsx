"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/EmptyState";
import { LightbulbIcon } from "@/components/icons";
import { SUGGESTION_STATUS_LABELS, type Suggestion, type SuggestionStatus } from "@/lib/types";

const MIN_LEN = 10;
const MAX_LEN = 2000;

function statusBadgeClass(status: SuggestionStatus): string {
  return status === "okundu" ? "bg-slate-100 text-slate-500" : "bg-brand-50 text-brand-700";
}

// /dashboard/oneriler sayfasının tamamını yöneten tek istemci bileşeni — hem
// gönderim formunu hem de bayinin daha önce paylaştığı önerilerin listesini
// aynı state üzerinde tutar (bkz. AppointmentsSection'daki aynı desen), böylece
// yeni gönderilen öneri sunucudan yeniden okumayı beklemeden anında listede görünür.
export default function SuggestionsSection({
  initialSuggestions,
}: {
  initialSuggestions: Suggestion[];
}) {
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = message.trim();
    if (trimmed.length < MIN_LEN) {
      setError(`Öneriniz en az ${MIN_LEN} karakter olmalı.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/oneriler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Öneriniz gönderilemedi.");
        return;
      }
      showToast("Öneriniz bize ulaştı, teşekkür ederiz!");
      setSuggestions((prev) => [data.suggestion, ...prev]);
      setMessage("");
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Öneriniz</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={MAX_LEN}
            placeholder="Örn. Bakım kaydına birden fazla fotoğraf eklemek isterim, ya da: Randevu hatırlatmasını SMS ile de göndersek nasıl olur?"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {message.trim().length}/{MAX_LEN}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Öneriyi Gönder"}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Daha Önce Gönderdikleriniz</h2>
        {suggestions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<LightbulbIcon className="h-6 w-6" />}
              title="Henüz bir öneri paylaşmadınız"
              description="Aklınızdaki ilk fikri yukarıdaki kutuya yazmanız yeterli."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{s.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(s.createdAt).toLocaleString("tr-TR")}
                    {s.authorName ? ` · ${s.authorName}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(s.status)}`}
                >
                  {SUGGESTION_STATUS_LABELS[s.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
