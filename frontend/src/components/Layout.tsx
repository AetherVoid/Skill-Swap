import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

function IconCompass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function Layout() {
  const { t, i18n } = useTranslation();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[52px] min-w-[72px] flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-semibold transition ${
      isActive ? "bg-rose-500/15 text-rose-300" : "text-zinc-500 hover:text-zinc-200"
    }`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-cord-bg pb-28 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-zinc-800/90 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-extrabold text-zinc-950"
            aria-hidden
          >
            SS
          </span>
          <span className="truncate font-display text-base font-bold text-zinc-50">{t("appShort")}</span>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600"
          onClick={() => {
            const n = i18n.language === "en" ? "ny" : "en";
            void i18n.changeLanguage(n);
            localStorage.setItem("lng", n);
          }}
        >
          {i18n.language === "en" ? t("chichewa") : t("english")}
        </button>
      </header>
      <main className="flex-1 px-4 pt-5">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-lg justify-around border-t border-zinc-800/95 bg-zinc-950/95 px-2 py-2 backdrop-blur-xl safe-area-pb"
        aria-label="Main"
      >
        <NavLink to="/feed" className={navClass}>
          <IconCompass className="h-5 w-5" />
          {t("matches")}
        </NavLink>
        <NavLink to="/home" className={navClass}>
          <IconHome className="h-5 w-5" />
          {t("dashboard")}
        </NavLink>
        <NavLink to="/skills" className={navClass}>
          <IconUser className="h-5 w-5" />
          {t("profile")}
        </NavLink>
      </nav>
    </div>
  );
}
