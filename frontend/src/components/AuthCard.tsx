import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)] ring-1 ring-white/5 sm:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{subtitle}</p>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-8 border-t border-zinc-800 pt-6">{footer}</div> : null}
    </div>
  );
}

export const inputClass =
  "min-h-[48px] w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3.5 text-base text-zinc-100 shadow-inner outline-none transition placeholder:text-zinc-500 focus:border-brand-600 focus:ring-2 focus:ring-rose-500/20";
