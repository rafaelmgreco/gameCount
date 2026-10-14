"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Player = { id: number; name: string };
type Deck = {
  id: number;
  name: string;
  commander: string;
  player: Player;
};
type Match = {
  id: number;
  matchDate: string;
  winningTurn: number;
  winner: Player;
  participants: Array<{ seatOrder: number; player: Player; deck: Deck }>;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : `Erro ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export default function PartidasPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    requestJson<unknown>("/game/matches")
      .then((data) => {
        setMatches(Array.isArray(data) ? (data as Match[]) : []);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Erro ao carregar partidas");
      });
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Histórico</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Painel de Partidas</h1>
            <p className="mt-2 text-sm text-slate-300">Visualização completa das partidas registradas.</p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Voltar ao dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total de partidas</p>
            <p className="mt-2 text-3xl font-black text-cyan-200">{matches.length}</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Último vencedor</p>
            <p className="mt-2 text-xl font-black text-fuchsia-200">{matches[0]?.winner.name ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Última data</p>
            <p className="mt-2 text-xl font-black text-emerald-200">
              {matches[0] ? new Date(`${matches[0].matchDate}T00:00:00`).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>
      </header>

      {message ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200" role="alert">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-blue-300/20 bg-slate-950/90 p-5 shadow-[0_10px_30px_rgba(10,20,40,0.35)]">
        <h2 className="mb-3 text-xl font-semibold text-blue-100">Partidas registradas</h2>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-400">Nenhuma partida registrada ainda.</p>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.id} className="rounded-xl border border-blue-300/20 bg-slate-900/90 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-zinc-100">Vencedor: {match.winner.name}</p>
                  <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">Turno {match.winningTurn}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Data da partida: {new Date(`${match.matchDate}T00:00:00`).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-500">Registro no sistema: {new Date(match.createdAt).toLocaleString()}</p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {match.participants.map((participant) => (
                    <div key={`${match.id}-${participant.seatOrder}`} className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm">
                      <p className="text-cyan-200">Assento {participant.seatOrder}</p>
                      <p className="text-zinc-100">{participant.player.name}</p>
                      <p className="text-slate-400">{participant.deck.name} ({participant.deck.commander})</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
