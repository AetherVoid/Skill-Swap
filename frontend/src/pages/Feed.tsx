import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, type MatchRow, type Exchange } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { isAuthDisabled } from "../lib/authMode";

function skillLabel(id: string, m: MatchRow) {
  const row = m.skills.find((s) => s.skillTaxonomy.id === id);
  return row?.skillTaxonomy.nameEn ?? id;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  const a = p[0]?.[0] ?? "?";
  const b = p[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function Feed() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);

  const myOfferIds = useMemo(
    () => new Set(user?.userSkills.filter((s) => s.offered).map((s) => s.skillTaxonomy.id) ?? []),
    [user]
  );
  const myWantIds = useMemo(
    () => new Set(user?.userSkills.filter((s) => !s.offered).map((s) => s.skillTaxonomy.id) ?? []),
    [user]
  );

  useEffect(() => {
    if (!user || loading) return;
    setErr(null);
    void api<{ matches: MatchRow[] }>("/matches")
      .then((r) => setMatches(r.matches))
      .catch((e: Error) => setErr(e.message));
  }, [user, loading]);

  async function requestExchange(m: MatchRow) {
    const theyOffer = m.skills.filter((s) => s.offered).map((s) => s.skillTaxonomy.id);
    const theyWant = m.skills.filter((s) => !s.offered).map((s) => s.skillTaxonomy.id);
    const theyTeachIWant = theyOffer.find((id) => myWantIds.has(id));
    const iTeachTheyWant = theyWant.find((id) => myOfferIds.has(id));
    if (!theyTeachIWant || !iTeachTheyWant) {
      setErr("Could not pair skills — update your profile.");
      return;
    }
    setRequesting(m.id);
    setErr(null);
    try {
      const ex = await api<Exchange>("/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerUserId: m.id,
          skillTheyTeachId: theyTeachIWant,
          skillTheyLearnId: iTeachTheyWant,
          hoursAgreed: 1,
        }),
      });
      window.location.href = `/exchange/${ex.id}`;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setRequesting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-800/80" />
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-800/80" />
      </div>
    );
  }

  if (!user) {
    if (isAuthDisabled()) {
      return (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm leading-relaxed text-amber-100 shadow-sm ring-1 ring-amber-500/20">
          <p className="font-semibold">Demo mode could not load a user.</p>
          <p className="mt-2 text-amber-200/90">
            Ensure the API has <code className="rounded bg-zinc-950/80 px-1 text-amber-100">DISABLE_AUTH=true</code> and run{" "}
            <code className="rounded bg-zinc-950/80 px-1 text-amber-100">npm run db:seed</code> in <code className="rounded bg-zinc-950/80 px-1 text-amber-100">backend</code> so{" "}
            <code className="rounded bg-zinc-950/80 px-1 text-amber-100">demo@skillswap.local</code> exists.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-lg ring-1 ring-white/5">
        <p className="text-pretty text-zinc-300">{t("tagline")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 px-6 text-sm font-semibold text-zinc-100 shadow-sm hover:border-zinc-500"
          >
            {t("login")}
          </Link>
          <Link
            to="/register"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-md hover:bg-brand-800"
          >
            {t("register")}
          </Link>
        </div>
      </div>
    );
  }

  const needsSkills =
    user.userSkills.filter((s) => s.offered).length < 1 ||
    user.userSkills.filter((s) => !s.offered).length < 1;

  if (needsSkills) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100 ring-1 ring-amber-500/20">
        Add at least one skill you teach and one you want on the{" "}
        <Link to="/skills" className="font-semibold text-rose-300 underline underline-offset-2">
          Profile
        </Link>{" "}
        tab first.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">{t("matches")}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t("feedHint")}</p>
      </div>
      {err && (
        <p className="rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/20" role="alert">
          {err}
        </p>
      )}
      {matches.length === 0 && <p className="text-sm text-zinc-500">{t("feedEmpty")}</p>}
      <ul className="flex flex-col gap-4">
        {matches.map((m) => (
          <li
            key={m.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[0_2px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] transition hover:border-zinc-700 hover:ring-white/[0.07]"
          >
            <div className="flex gap-4 p-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-bold text-white shadow-inner ring-1 ring-white/10"
                aria-hidden
              >
                {initials(m.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-50">{m.name}</p>
                    <p className="text-sm text-zinc-500">{m.district}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    {m.verified && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                        {t("verified")}
                      </span>
                    )}
                    <p className="text-xs text-zinc-500">
                      ★ {m.averageRating.toFixed(1)}{" "}
                      <span className="text-zinc-600">({m.ratingCount})</span>
                    </p>
                  </div>
                </div>
                {m.mutualSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">{t("mutualSkills")}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.mutualSkills.slice(0, 6).map((id) => (
                        <span
                          key={id}
                          className="rounded-full border border-zinc-700 bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-zinc-200"
                        >
                          {i18n.language === "ny"
                            ? m.skills.find((s) => s.skillTaxonomy.id === id)?.skillTaxonomy.nameNy ?? skillLabel(id, m)
                            : skillLabel(id, m)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <button
                type="button"
                disabled={requesting === m.id}
                onClick={() => void requestExchange(m)}
                className="w-full min-h-[48px] rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
              >
                {requesting === m.id ? "…" : t("requestExchange")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
