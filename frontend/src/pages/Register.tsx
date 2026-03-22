import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { MALAWI_DISTRICTS } from "../data/malawi";
import { AuthCard, inputClass } from "../components/AuthCard";

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState<string>(MALAWI_DISTRICTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api<{ accessToken: string }>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, district }),
      });
      await setSession(r.accessToken);
      navigate("/skills", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title={t("register")}
      subtitle={t("registerSubtitle")}
      footer={
        <p className="text-center text-sm text-zinc-400">
          {t("haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-rose-400 hover:underline">
            {t("login")}
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">{t("email")}</span>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">{t("password")}</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">{t("name")}</span>
          <input
            className={inputClass}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">{t("district")}</span>
          <select
            className={inputClass}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {MALAWI_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-950/50 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/20" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="min-h-[52px] rounded-full bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-900/25 transition hover:bg-brand-800 disabled:opacity-50"
        >
          {busy ? "…" : t("register")}
        </button>
      </form>
    </AuthCard>
  );
}
