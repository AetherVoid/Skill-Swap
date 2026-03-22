import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, type Exchange } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { isAuthDisabled } from "../lib/authMode";

export function Dashboard() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [list, setList] = useState<Exchange[]>([]);

  useEffect(() => {
    if (!user) return;
    void api<Exchange[]>("/exchanges").then(setList);
  }, [user]);

  if (loading) return <p className="text-zinc-500">…</p>;
  if (!user) {
    if (isAuthDisabled()) {
      return (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm leading-relaxed text-amber-100 ring-1 ring-amber-500/20">
          <p className="font-semibold">Demo mode could not load a user.</p>
          <p className="mt-2 text-amber-200/90">
            Run <code className="rounded bg-zinc-950/80 px-1">npm run db:seed</code> in <code className="rounded bg-zinc-950/80 px-1">backend</code> and keep{" "}
            <code className="rounded bg-zinc-950/80 px-1">DISABLE_AUTH=true</code> on the API.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 text-sm text-zinc-400">
        <Link to="/login" className="font-semibold text-rose-400 hover:underline">
          {t("login")}
        </Link>
        <Link to="/register" className="font-semibold text-rose-400 hover:underline">
          {t("register")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {isAuthDisabled() && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100/95">
          Auth is off for development: you are viewing as the seeded demo account.
        </p>
      )}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">{t("dashboard")}</h1>
        <p className="mt-1 truncate text-sm text-zinc-500">{user.email}</p>
      </div>
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-zinc-900/80 p-5 shadow-[0_16px_48px_-24px_rgba(244,63,94,0.35)] ring-1 ring-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/90">{t("creditBalance")}</p>
        <p className="mt-1 font-display text-4xl font-bold text-zinc-50">{user.creditBalance ?? 0}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Time-bank style: earn credits by teaching hours, spend to learn. Escrow on completion is on the roadmap.
        </p>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-zinc-300">{t("messages")}</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {list.length === 0 && <li className="text-sm text-zinc-500">No exchanges yet.</li>}
          {list.map((ex) => {
            const other = ex.user1Id === user.id ? ex.user2 : ex.user1;
            return (
              <li key={ex.id}>
                <Link
                  to={`/exchange/${ex.id}`}
                  className="flex min-h-[52px] items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 shadow-sm ring-1 ring-white/[0.03] transition hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <span className="font-medium text-zinc-100">{other.name}</span>
                  <span className="text-xs uppercase text-zinc-500">{ex.status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <button
        type="button"
        className="text-sm font-medium text-rose-400/90 underline hover:text-rose-300"
        onClick={() => {
          logout();
          window.location.href = "/";
        }}
      >
        {t("signOut")}
      </button>
    </div>
  );
}
