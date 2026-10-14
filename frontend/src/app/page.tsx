"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Player = { id: number; name: string };
type Deck = {
  id: number;
  name: string;
  commander: string;
  player: Player;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const createEmptyParticipant = () => ({ playerId: 0, deckId: 0 });
const todayDate = () => new Date().toISOString().slice(0, 10);

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
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

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [deckName, setDeckName] = useState("");
  const [commander, setCommander] = useState("");
  const [deckPlayerId, setDeckPlayerId] = useState(0);
  const [matchDate, setMatchDate] = useState(todayDate());
  const [winnerPlayerId, setWinnerPlayerId] = useState(0);
  const [winningTurn, setWinningTurn] = useState("");
  const [participants, setParticipants] = useState([
    createEmptyParticipant(),
    createEmptyParticipant(),
    createEmptyParticipant(),
    createEmptyParticipant(),
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [matchFormError, setMatchFormError] = useState("");

  const deckOptionsByPlayer = useMemo(() => {
    return players.reduce<Record<number, Deck[]>>((acc, player) => {
      acc[player.id] = decks.filter((deck) => deck.player.id === player.id);
      return acc;
    }, {});
  }, [players, decks]);

  async function fetchAll() {
    const [playersData, decksData] = await Promise.all([
      requestJson<unknown>("/game/players"),
      requestJson<unknown>("/game/decks"),
    ]);

    const safePlayers = Array.isArray(playersData) ? (playersData as Player[]) : [];
    const safeDecks = Array.isArray(decksData) ? (decksData as Deck[]) : [];

    setPlayers(safePlayers);
    setDecks(safeDecks);
  }

  function addParticipant() {
    setParticipants((current) => [...current, createEmptyParticipant()]);
  }

  function removeParticipant() {
    setParticipants((current) => {
      if (current.length <= 2) return current;
      return current.slice(0, -1);
    });
  }

  function applyParticipantPreset(totalPlayers: number) {
    setParticipants((current) => {
      if (current.length === totalPlayers) return current;

      if (current.length > totalPlayers) {
        return current.slice(0, totalPlayers);
      }

      return [
        ...current,
        ...Array.from({ length: totalPlayers - current.length }, () => createEmptyParticipant()),
      ];
    });
  }

  useEffect(() => {
    fetchAll().catch(() => {
      setMessageType("error");
      setMessage("Erro ao carregar dados da API");
    });
  }, []);

  async function submitPlayer(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await requestJson("/game/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName }),
      });
      setPlayerName("");
      setMessageType("success");
      setMessage("Jogador criado");
      await fetchAll();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Erro ao criar jogador");
    } finally {
      setLoading(false);
    }
  }

  async function submitDeck(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await requestJson("/game/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deckName, commander, playerId: Number(deckPlayerId) }),
      });
      setDeckName("");
      setCommander("");
      setDeckPlayerId(0);
      setMessageType("success");
      setMessage("Deck criado");
      await fetchAll();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Erro ao criar deck");
    } finally {
      setLoading(false);
    }
  }

  async function submitMatch(event: FormEvent) {
    event.preventDefault();
    setMatchFormError("");

    const participantWithoutPlayer = participants.some((participant) => !participant.playerId);
    if (participantWithoutPlayer) {
      setMatchFormError("Selecione um jogador em todos os assentos.");
      return;
    }

    const participantWithoutDeck = participants.some((participant) => !participant.deckId);
    if (participantWithoutDeck) {
      setMatchFormError("Selecione um deck em todos os assentos.");
      return;
    }

    const uniquePlayers = new Set(participants.map((participant) => participant.playerId));
    if (uniquePlayers.size !== participants.length) {
      setMatchFormError("Um jogador não pode aparecer em mais de um assento.");
      return;
    }

    if (!winnerPlayerId || !participants.some((participant) => participant.playerId === winnerPlayerId)) {
      setMatchFormError("O vencedor precisa estar entre os participantes da partida.");
      return;
    }

    const parsedWinningTurn = Number(winningTurn);
    if (!Number.isInteger(parsedWinningTurn) || parsedWinningTurn < 1) {
      setMatchFormError("Informe um turno válido (maior que 0).");
      return;
    }

    if (!matchDate) {
      setMatchFormError("Selecione a data da partida.");
      return;
    }

    setLoading(true);
    try {
      await requestJson("/game/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchDate,
          winnerPlayerId: Number(winnerPlayerId),
          winningTurn: parsedWinningTurn,
          participants: participants.map((item, index) => ({
            playerId: Number(item.playerId),
            deckId: Number(item.deckId),
            seatOrder: Number(index + 1),
          })),
        }),
      });
      setMessageType("success");
      setMessage("Partida registrada");
      setWinningTurn("");
      setMatchDate(todayDate());
      setWinnerPlayerId(0);
      await fetchAll();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Erro ao registrar partida");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Magic: The Gathering</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Commander Control Center</h1>
            <p className="mt-2 text-sm text-slate-300">Dashboard para registrar jogadores, decks e partidas com velocidade.</p>
          </div>
          <Link
            href="/partidas"
            className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Ver histórico completo
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Jogadores</p>
            <p className="mt-2 text-3xl font-black text-cyan-200">{players.length}</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Decks</p>
            <p className="mt-2 text-3xl font-black text-fuchsia-200">{decks.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Mesa Atual</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{participants.length}</p>
          </div>
        </div>
      </header>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            messageType === "error"
              ? "border-red-400/30 bg-red-500/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          }`}
          role="alert"
        >
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1.1fr_2fr]">
        <form onSubmit={submitPlayer} className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 p-5 shadow-[0_10px_30px_rgba(10,20,40,0.35)]">
          <h2 className="text-lg font-bold text-cyan-100">Novo jogador</h2>
          <p className="mb-4 text-xs text-slate-400">Cadastre participantes para as próximas mesas.</p>
          <input className="w-full rounded-xl border border-cyan-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Nome do jogador" required />
          <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(6,182,212,0.35)] transition hover:brightness-110 disabled:opacity-60" disabled={loading}>Salvar jogador</button>
        </form>

        <form onSubmit={submitDeck} className="rounded-2xl border border-fuchsia-300/20 bg-slate-950/90 p-5 shadow-[0_10px_30px_rgba(10,20,40,0.35)]">
          <h2 className="text-lg font-bold text-fuchsia-100">Novo deck</h2>
          <p className="mb-4 text-xs text-slate-400">Associa um deck a um jogador já cadastrado.</p>
          <div className="space-y-2">
            <input className="w-full rounded-xl border border-fuchsia-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-400/30" value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="Nome do deck" required />
            <input className="w-full rounded-xl border border-fuchsia-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-400/30" value={commander} onChange={(e) => setCommander(e.target.value)} placeholder="Comandante" required />
            <select className="w-full rounded-xl border border-fuchsia-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-400/30" value={deckPlayerId} onChange={(e) => setDeckPlayerId(Number(e.target.value))} required>
              <option value={0}>Selecione o jogador</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(192,38,211,0.35)] transition hover:brightness-110 disabled:opacity-60" disabled={loading}>Salvar deck</button>
        </form>

        <form onSubmit={submitMatch} className="rounded-2xl border border-blue-300/20 bg-slate-950/90 p-5 shadow-[0_10px_30px_rgba(10,20,40,0.35)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-blue-100">Registrar partida</h2>
            <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              {participants.length} jogadores
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyParticipantPreset(4)}
              className="rounded-full border border-blue-300/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              Mesa 4
            </button>
            <button
              type="button"
              onClick={() => applyParticipantPreset(6)}
              className="rounded-full border border-blue-300/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              Mesa 6
            </button>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={addParticipant} className="rounded-lg border border-cyan-300/30 px-2 py-1 text-sm font-medium text-cyan-200 hover:bg-cyan-500/10">
                + jogador
              </button>
              <button
                type="button"
                onClick={removeParticipant}
                className="rounded-lg border border-cyan-300/30 px-2 py-1 text-sm font-medium text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
                disabled={participants.length <= 2}
              >
                - jogador
              </button>
            </div>
          </div>

          {matchFormError ? (
            <p className="mb-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200">
              {matchFormError}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Data da partida</label>
            <input
              className="w-full rounded-xl border border-blue-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
          </div>
          <input className="mt-2 w-full rounded-xl border border-blue-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30" type="number" min={1} value={winningTurn} onChange={(e) => setWinningTurn(e.target.value)} placeholder="Turno em que venceu (ex: 7)" />
          <select className="mt-2 w-full rounded-xl border border-blue-300/20 bg-slate-900/80 px-3 py-2 text-zinc-100 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30" value={winnerPlayerId} onChange={(e) => setWinnerPlayerId(Number(e.target.value))} required>
            <option value={0}>Selecione o vencedor</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>

          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {participants.map((participant, index) => (
              <div key={index} className="rounded-xl border border-blue-300/20 bg-slate-900/90 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">Assento {index + 1}</p>
                <select
                  className={`mb-2 w-full rounded-lg border bg-slate-900 px-3 py-2 text-zinc-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 ${!participant.playerId ? "border-amber-400/60" : "border-blue-300/20"}`}
                  value={participant.playerId}
                  onChange={(e) => {
                    const next = [...participants];
                    next[index].playerId = Number(e.target.value);
                    next[index].deckId = 0;
                    setParticipants(next);
                  }}
                >
                  <option value={0}>Jogador</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
                <select
                  className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-zinc-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 ${!participant.deckId ? "border-amber-400/60" : "border-blue-300/20"}`}
                  value={participant.deckId}
                  onChange={(e) => {
                    const next = [...participants];
                    next[index].deckId = Number(e.target.value);
                    setParticipants(next);
                  }}
                >
                  <option value={0}>Deck</option>
                  {(deckOptionsByPlayer[participant.playerId] ?? []).map((deck) => (
                    <option key={deck.id} value={deck.id}>{deck.name} ({deck.commander})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(59,130,246,0.35)] transition hover:brightness-110 disabled:opacity-60" disabled={loading}>Salvar partida</button>
        </form>
      </section>
    </main>
  );
}
