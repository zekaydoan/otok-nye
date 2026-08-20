"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  type Announcement,
  type AnnouncementAudience,
} from "@/lib/types";

const MAX_TITLE_LEN = 120;
const MAX_MESSAGE_LEN = 2000;

// Admin Duyurular sayfasının tamamını yöneten tek istemci bileşeni — hem
// yayınlama formunu hem de daha önce gönderilen duyuruların geçmişini aynı
// state üzerinde tutar (bkz. SuggestionsSection'daki aynı desen), böylece yeni
// yayınlanan duyuru sunucudan yeniden okumayı beklemeden anında listede görünür.
export default function AdminAnnouncementForm({
  initialAnnouncements,
}: {
  initialAnnouncements: Announcement[];
}) {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [sendEmailToShops, setSendEmailToShops] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle) {
      setError("Başlık zorunlu.");
      return;
    }
    if (!trimmedMessage) {
      setError("Duyuru metni zorunlu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/duyurular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          message: trimmedMessage,
          audience,
          sendEmailToShops,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Duyuru yayınlanamadı.");
        return;
      }
      const summary = data.emailSummary as
        | { attempted: number; sent: number; failed: number }
        | null;
      if (summary && summary.attempted > 0) {
        showToast(
          summary.failed > 0
            ? `Duyuru yayınlandı. E-posta: ${summary.sent}/${summary.attempted} gönderildi, ${summary.failed} başarısız.`
            : `Duyuru yayınlandı ve ${summary.sent} bayiye e-posta gönderildi.`
        );
      } else {
        showToast("Duyuru yayınlandı.");
      }
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setTitle("");
      setMessage("");
      setAudience("all");
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
          <label className="block text-sm font-medium text-slate-700">Başlık</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE_LEN}
            placeholder="Örn. Yeni özellik: Türkiye ziyaretçi haritası"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Duyuru Metni</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={MAX_MESSAGE_LEN}
            placeholder="Bayilere/ustalara göstermek istediğiniz kampanya, indirim ya da yeni özellik açıklaması."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {message.trim().length}/{MAX_MESSAGE_LEN}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Hedef Kitle</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          >
            {Object.entries(ANNOUNCEMENT_AUDIENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={sendEmailToShops}
            onChange={(e) => setSendEmailToShops(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Hedef kitledeki bayilere aynı duyurunun e-posta kopyasını da gönder
            <span className="block text-xs text-slate-400">
              İşaretli değilse duyuru yalnızca panelde görünür, e-posta gitmez.
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Yayınlanıyor..." : "Duyuruyu Yayınla"}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Gönderilen Duyurular</h2>
        {announcements.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Henüz bir duyuru yayınlanmadı.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <div className="flex shrink-0 gap-1.5">
                    {a.emailedAt && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        E-posta gönderildi
                      </span>
                    )}
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {ANNOUNCEMENT_AUDIENCE_LABELS[a.audience]}
                    </span>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{a.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
