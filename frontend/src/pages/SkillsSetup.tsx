import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, type TaxonomySkill } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function SkillsSetup() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [taxonomy, setTaxonomy] = useState<TaxonomySkill[]>([]);
  const [offered, setOffered] = useState<Set<string>>(new Set());
  const [wanted, setWanted] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<TaxonomySkill[]>("/taxonomy").then(setTaxonomy);
  }, []);

  useEffect(() => {
    if (!user) return;
    const o = new Set(user.userSkills.filter((s) => s.offered).map((s) => s.skillTaxonomy.id));
    const w = new Set(user.userSkills.filter((s) => !s.offered).map((s) => s.skillTaxonomy.id));
    if (o.size) setOffered(o);
    if (w.size) setWanted(w);
  }, [user]);

  function label(s: TaxonomySkill) {
    return i18n.language === "ny" ? s.nameNy : s.nameEn;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (offered.size < 1 || wanted.size < 1) {
      setError("Pick at least one skill to teach and one to learn.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/users/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offered: [...offered].map((id) => ({ skillTaxonomyId: id, proficiency: "can_teach" })),
          wanted: [...wanted].map((id) => ({ skillTaxonomyId: id, proficiency: "beginner" })),
        }),
      });
      await refreshUser();
      navigate("/feed", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleOffered(id: string) {
    setOffered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setWanted((w) => {
      const next = new Set(w);
      next.delete(id);
      return next;
    });
  }

  function toggleWanted(id: string) {
    setWanted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOffered((o) => {
      const next = new Set(o);
      next.delete(id);
      return next;
    });
  }

  if (!user) {
    return (
      <p className="text-center text-zinc-400">
        <Link to="/login" className="font-semibold text-rose-400 underline">
          {t("login")}
        </Link>
        {" · "}
        <Link to="/register" className="font-semibold text-rose-400 underline">
          {t("register")}
        </Link>
        {" · "}
        {t("yourSkills")}
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void save(e)} className="pb-8">
      <h1 className="font-display text-2xl font-bold text-zinc-50">{t("yourSkills")}</h1>
      <p className="mt-2 text-sm text-zinc-500">Choose from the list — custom names come in a later phase.</p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-400/90">{t("offered")}</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {taxonomy.map((s) => (
            <li key={`o-${s.id}`}>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 ring-1 ring-white/[0.03] transition hover:border-zinc-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-600 bg-zinc-950 text-brand-600 focus:ring-rose-500/30"
                  checked={offered.has(s.id)}
                  onChange={() => toggleOffered(s.id)}
                />
                <span className="text-zinc-200">{label(s)}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-400/90">{t("wanted")}</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {taxonomy.map((s) => (
            <li key={`w-${s.id}`}>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 ring-1 ring-white/[0.03] transition hover:border-zinc-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-600 bg-zinc-950 text-brand-600 focus:ring-rose-500/30"
                  checked={wanted.has(s.id)}
                  onChange={() => toggleWanted(s.id)}
                />
                <span className="text-zinc-200">{label(s)}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full min-h-[52px] rounded-full bg-brand-600 py-3 font-semibold text-white shadow-md shadow-rose-900/25 disabled:opacity-50 hover:bg-brand-800"
      >
        {t("saveSkills")}
      </button>
    </form>
  );
}
