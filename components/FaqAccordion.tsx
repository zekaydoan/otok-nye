"use client";

import { useState } from "react";

// Ana sayfadaki SSS bölümü için basit, bağımlılıksız bir akordeon — tek seferde
// yalnızca bir soru açık kalır, satın alma kararını etkileyen ("etiket dayanıklı
// mı", "ücretsiz plan yeterli mi" gibi) itirazları dönüşüm huninin en üstünde
// yanıtlar.
export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-8 max-w-2xl divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-slate-900">{item.q}</span>
              <span
                className={`shrink-0 text-brand-500 transition-transform ${open ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {open && <p className="px-5 pb-4 text-sm text-slate-600">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
