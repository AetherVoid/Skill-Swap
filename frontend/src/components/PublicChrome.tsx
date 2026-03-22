import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-dvh cord-hero-gradient">
      <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-h-[44px] min-w-[44px] items-center gap-2.5 rounded-xl pr-2">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-extrabold tracking-tight text-zinc-950 shadow-lg shadow-rose-500/10"
              aria-hidden
            >
              SS
            </span>
            <span className="font-display text-lg font-bold leading-tight text-zinc-50">{t("appShort")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
              onClick={() => {
                const n = i18n.language === "en" ? "ny" : "en";
                void i18n.changeLanguage(n);
                localStorage.setItem("lng", n);
              }}
            >
              {i18n.language === "en" ? t("chichewa") : t("english")}
            </button>
            <Link
              to="/login"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-900/30 transition hover:bg-brand-800"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 pb-16 pt-6">{children}</div>
      <footer className="border-t border-zinc-800/90 bg-zinc-950/60 px-4 py-6 text-center text-xs text-zinc-500">
        <p>{t("uxTrustFooter")}</p>
      </footer>
    </div>
  );
}
