"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUGGESTION_STATUS_LABELS, type Suggestion } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function AdminSuggestionRow({ suggestion }: { suggestion: Suggestion }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const isRead = suggestion.status === "okundu";

  async function toggleStatus() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/oneriler/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isRead ? "yeni" : "okundu" }),
      });
      if (!res.ok) {
        showToast("Güncellenemedi, tekrar deneyin.", "error");
        return;
      }
      router.refresh();
    } catch {
      showToast("Bağlantı hatası, tekrar deneyin.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ring-1 ring-slate-100 ${
        isRead ? "border-slate-200" : "border-brand-400"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {suggestion.shopName}
            {suggestion.authorName ? ` · ${suggestion.authorName}` : ""}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(suggestion.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isRead ? "bg-slate-100 text-slate-500" : "bg-brand-50 text-brand-700"
          }`}
        >
          {SUGGESTION_STATUS_LABELS[suggestion.status]}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{suggestion.message}</p>
      <button
        onClick={toggleStatus}
        disabled={saving}
        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {isRead ? "Yeni olarak işaretle" : "Okundu olarak işaretle"}
      </button>
    </div>
  );
}
