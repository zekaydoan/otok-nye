"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_NEW_MEMBER_WINDOW_DAYS,
  ANNOUNCEMENT_RECIPIENT_TYPE_LABELS,
  type Announcement,
  type AnnouncementAudience,
  type AnnouncementRecipientType,
} from "@/lib/types";

const MAX_TITLE_LEN = 120;
const MAX_MESSAGE_LEN = 2000;

// Alıcı türüne göre hazır "hoşgeldiniz" şablonları — Zeki'nin 22 Ağustos 2026
// talebi: "bu hafta üye olan satış partnerileri ayrı tutulsun ustalar ayrı
// tutulsun, onlara hoşgeldiniz tarzında mesajlar gönderelim". Admin bu
// şablonu başlangıç noktası olarak kullanır, yayınlamadan önce dilediği gibi
// değiştirebilir.
const WELCOME_TEMPLATES: Record<AnnouncementRecipientType, { title: string; message: string }> = {
  usta: {
    title: "Aramıza Hoş Geldiniz! 👋",
    message:
      "OtoHafıza ailesine katıldığınız için teşekkür ederiz. 15 araca kadar sonsuza dek ücretsiz kullanabilirsiniz, kredi kartı gerekmez. Herhangi bir sorunuz olursa WhatsApp'tan bize ulaşabilirsiniz: 0542 575 69 18",
  },
  partner: {
    title: "Saha Satış Partneri Ailesine Hoş Geldiniz! 👋",
    message:
      "OtoHafıza Saha Satış Partneri olarak aramıza katıldığınız için teşekkür ederiz. Panelinizdeki kayıt linkinizi paylaşarak hemen kazanmaya başlayabilirsiniz. Sorularınız için WhatsApp'tan ulaşabilirsiniz: 0542 575 69 18",
  },
};

type ReadStats = {
  totalRecipients: number;
  read: { id: string; name: string; readAt: string }[];
  unread: { id: string; name: string }[];
};

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
  const [recipientType, setRecipientType] = useState<AnnouncementRecipientType>("usta");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [newOnly, setNewOnly] = useState(false);
  const [sendEmailToShops, setSendEmailToShops] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Kim okudu?" paneli — duyuru başına ayrı açılıp kapanabilir, veri yalnızca
  // ilk açılışta çekilir (bkz. loadReadStats).
  const [openStatsId, setOpenStatsId] = useState<string | null>(null);
  const [statsById, setStatsById] = useState<Record<string, ReadStats | "loading" | "error">>({});

  function applyWelcomeTemplate() {
    const tpl = WELCOME_TEMPLATES[recipientType];
    setTitle(tpl.title);
    setMessage(tpl.message);
    setNewOnly(true);
  }

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
          recipientType,
          newOnly,
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
            : `Duyuru yayınlandı ve ${summary.sent} alıcıya e-posta gönderildi.`
        );
      } else {
        showToast("Duyuru yayınlandı.");
      }
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setTitle("");
      setMessage("");
      setAudience("all");
      setNewOnly(false);
    } catch {
      setError("Bağlantı hatası, lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStats(id: string) {
    if (openStatsId === id) {
      setOpenStatsId(null);
      return;
    }
    setOpenStatsId(id);
    if (statsById[id]) return; // zaten çekildi
    setStatsById((prev) => ({ ...prev, [id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/duyurular/${id}/okuyanlar`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ReadStats;
      setStatsById((prev) => ({ ...prev, [id]: data }));
    } catch {
      setStatsById((prev) => ({ ...prev, [id]: "error" }));
    }
  }

  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Kime gönderilecek?</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(Object.entries(ANNOUNCEMENT_RECIPIENT_TYPE_LABELS) as [AnnouncementRecipientType, string][]).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRecipientType(value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    recipientType === value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

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
            placeholder="Bayilere/ustalara/partnerlere göstermek istediğiniz kampanya, indirim ya da yeni özellik açıklaması."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {message.trim().length}/{MAX_MESSAGE_LEN}
          </p>
        </div>

        {recipientType === "usta" && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Hedef Kitle (plan)</label>
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
        )}

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={newOnly}
            onChange={(e) => setNewOnly(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Sadece bu hafta katılan yeni üyeler
            <span className="block text-xs text-slate-400">
              Son {ANNOUNCEMENT_NEW_MEMBER_WINDOW_DAYS} gün içinde kaydolmuş{" "}
              {recipientType === "usta" ? "bayilere" : "partnerlere"} gösterilir — hoşgeldiniz mesajları için.
              Süre dolduğunda bu duyuru kendiliğinden görünmez olur.
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={applyWelcomeTemplate}
          className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          Hoşgeldiniz Şablonunu Kullan ({ANNOUNCEMENT_RECIPIENT_TYPE_LABELS[recipientType]})
        </button>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={sendEmailToShops}
            onChange={(e) => setSendEmailToShops(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Hedef kitledeki alıcılara aynı duyurunun e-posta kopyasını da gönder
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
            {announcements.map((a) => {
              const rType = a.recipientType ?? "usta";
              const stats = statsById[a.id];
              return (
                <div
                  key={a.id}
                  className="rounded-xl border-l-4 border-brand-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {a.emailedAt && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          E-posta gönderildi
                        </span>
                      )}
                      {a.newOnly && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Yeni Üyeler
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {ANNOUNCEMENT_RECIPIENT_TYPE_LABELS[rType]}
                      </span>
                      {rType === "usta" && (
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                          {ANNOUNCEMENT_AUDIENCE_LABELS[a.audience]}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{a.message}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString("tr-TR")}</p>
                    <button
                      type="button"
                      onClick={() => toggleStats(a.id)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {openStatsId === a.id ? "Kapat ▲" : "Kim okudu? ▼"}
                    </button>
                  </div>

                  {openStatsId === a.id && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      {stats === "loading" && <p className="text-xs text-slate-500">Yükleniyor...</p>}
                      {stats === "error" && (
                        <p className="text-xs text-red-600">Okuma bilgisi alınamadı.</p>
                      )}
                      {stats && stats !== "loading" && stats !== "error" && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            {stats.read.length}/{stats.totalRecipients} kişi okudu
                          </p>
                          <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                Okudu ({stats.read.length})
                              </p>
                              {stats.read.length === 0 ? (
                                <p className="mt-1 text-xs text-slate-400">Henüz kimse okumadı.</p>
                              ) : (
                                <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-700">
                                  {stats.read.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between gap-2">
                                      <span className="truncate">{r.name}</span>
                                      <span className="shrink-0 text-slate-400">
                                        {new Date(r.readAt).toLocaleDateString("tr-TR")}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                                Okumadı ({stats.unread.length})
                              </p>
                              {stats.unread.length === 0 ? (
                                <p className="mt-1 text-xs text-slate-400">Herkes okudu 🎉</p>
                              ) : (
                                <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-700">
                                  {stats.unread.map((u) => (
                                    <li key={u.id} className="truncate">
                                      {u.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
