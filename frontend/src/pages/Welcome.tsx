import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DEMO_CHIPS = ["Skills", "Malawi", "Time bank", "Peer-to-peer", "Verified", "Low data"];

export function Welcome() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_32px_100px_-48px_rgba(244,63,94,0.35)] ring-1 ring-white/5 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">{t("appName")}</p>
        <h1 className="mt-4 font-display text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-zinc-50 sm:text-3xl">
          {t("tagline")}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">{t("subhead")}</p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">{t("lowBandwidth")}</p>

        <div
          className="mt-8 flex min-h-[52px] items-center justify-between gap-3 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-500 ring-1 ring-white/5"
          role="presentation"
        >
          <span className="truncate">{t("matches")}…</span>
          <kbd className="hidden shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
            ⌘K
          </kbd>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DEMO_CHIPS.map((c) => (
            <span
              key={c}
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-[11px] font-medium text-zinc-300"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/register"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:bg-brand-800"
          >
            {t("getStarted")}
          </Link>
          <Link
            to="/feed"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/50 px-5 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800/80"
          >
            {t("browseFirst")}
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { h: t("stats1h"), b: t("stats1t") },
          { h: t("stats2h"), b: t("stats2t") },
          { h: t("stats3h"), b: t("stats3t") },
        ].map((s) => (
          <div
            key={s.h}
            className="cord-light-section rounded-2xl border border-zinc-200 px-4 py-4 shadow-sm"
          >
            <p className="font-display text-lg font-bold text-zinc-900">{s.h}</p>
            <p className="mt-1 text-sm leading-snug text-zinc-600">{s.b}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-zinc-900/60 to-zinc-950 px-5 py-6 ring-1 ring-rose-500/10 sm:px-8 sm:py-8">
        <h2 className="font-display text-xl font-bold text-zinc-50">{t("cordTagline")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t("cordTaglineSub")}</p>
      </section>

      <section className="cord-light-section rounded-3xl px-5 py-8 sm:px-8">
        <h2 className="font-display text-xl font-bold text-zinc-900">{t("benefitSectionTitle")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { title: t("benefit1Title"), desc: t("benefit1Desc") },
            { title: t("benefit2Title"), desc: t("benefit2Desc") },
            { title: t("benefit3Title"), desc: t("benefit3Desc") },
          ].map((b) => (
            <article
              key={b.title}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.08)] transition hover:shadow-md"
            >
              <h3 className="font-semibold text-zinc-900">{b.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{b.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-zinc-50">{t("howSectionTitle")}</h2>
        <ol className="mt-5 space-y-4">
          {[t("step1"), t("step2"), t("step3"), t("step4")].map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md shadow-rose-900/40">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-zinc-400">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-center text-xs text-zinc-600">{t("pilotNote")}</p>
    </div>
  );
}
