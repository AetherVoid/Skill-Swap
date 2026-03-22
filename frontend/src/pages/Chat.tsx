import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Msg = { id: string; content: string; senderId: string; sentAt: string };

export function Chat() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void api<Msg[]>(`/exchanges/${id}/messages`).then(setMessages);
  }, [id]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !text.trim()) return;
    setErr(null);
    try {
      const m = await api<Msg>(`/exchanges/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      setMessages((prev) => [...prev, m]);
      setText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!user) {
    return (
      <p className="text-zinc-400">
        <Link to="/login" className="font-semibold text-rose-400 underline">
          {t("login")}
        </Link>{" "}
        to chat.
      </p>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col pb-24">
      <h1 className="font-display text-xl font-bold text-zinc-50">{t("messages")}</h1>
      <div className="mt-4 flex flex-1 flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 ring-1 ring-white/[0.04]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.senderId === user.id
                ? "ml-auto bg-brand-600 text-white shadow-md shadow-rose-900/30"
                : "border border-zinc-700 bg-zinc-950/80 text-zinc-100"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <form onSubmit={(e) => void send(e)} className="fixed bottom-20 left-0 right-0 mx-auto flex max-w-lg gap-2 px-4">
        <input
          className="min-h-[48px] flex-1 rounded-full border border-zinc-700 bg-zinc-950/80 px-4 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("typeMessage")}
        />
        <button type="submit" className="min-h-[48px] rounded-full bg-brand-600 px-5 font-semibold text-white hover:bg-brand-800">
          Send
        </button>
      </form>
    </div>
  );
}
