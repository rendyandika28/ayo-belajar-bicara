"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { sentences } from "@/data/sentences";
import { planSession, isCorrect, SESSION_SIZE, type Round, type Tile } from "@/lib/susunKalimat";
import { speak, preloadAudio } from "@/lib/speech";
import { playPop, playCorrect, playWrong, playApplause } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import AssetImage from "@/components/ui/AssetImage";
import GameTutorial from "@/components/GameTutorial";

const SpeakerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export default function SusunKalimatPage() {
  const addStar = useAppStore((s) => s.addStar);
  const incrementSession = useAppStore((s) => s.incrementSession);
  const recordGamePlay = useAppStore((s) => s.recordGamePlay);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [status, setStatus] = useState<"play" | "wrong" | "done">("play");
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    recordGamePlay("susun-kalimat");
    setRounds(planSession(sentences));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [recordGamePlay]);

  const round = rounds[idx];
  // Fetch this and the next item's voice now, so it plays instantly when asked for.
  useEffect(() => preloadAudio([rounds[idx]?.sentence.text, rounds[idx + 1]?.sentence.text]), [rounds, idx]);

  // Say the sentence when a round starts: the child builds what they hear.
  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => speak(round.sentence.text), 400);
    return () => clearTimeout(t);
  }, [round]);

  const listen = useCallback(() => { if (round) speak(round.sentence.text); }, [round]);

  const place = useCallback((tile: Tile) => {
    if (!round || status !== "play" || answer.length >= round.words.length) return;
    playPop();
    const next = [...answer, tile];
    setAnswer(next);
    if (next.length < round.words.length) return;
    if (isCorrect(next.map((t) => t.text), round.words)) {
      playCorrect();
      const stars = missed ? 1 : 2;
      addStar(stars);
      setScore((s) => s + stars);
      setStatus("done");
      timerRef.current = setTimeout(() => speak(round.sentence.text), 300);
    } else {
      playWrong();
      setStatus("wrong");
      setMissed(true);
      timerRef.current = setTimeout(() => { setAnswer([]); setStatus("play"); }, 1100);
    }
  }, [round, status, answer, missed, addStar]);

  // Tap a placed word to send it back (fix a mistake before the last slot).
  const unplace = useCallback((tile: Tile) => {
    if (status !== "play") return;
    playPop();
    setAnswer((a) => a.filter((t) => t.id !== tile.id));
  }, [status]);

  const next = useCallback(() => {
    if (idx < rounds.length - 1) {
      setIdx((i) => i + 1);
      setAnswer([]);
      setStatus("play");
      setMissed(false);
    } else {
      setFinished(true);
      incrementSession();
      playApplause();
    }
  }, [idx, rounds.length, incrementSession]);

  const restart = useCallback(() => {
    setRounds(planSession(sentences));
    setIdx(0);
    setAnswer([]);
    setStatus("play");
    setMissed(false);
    setScore(0);
    setFinished(false);
  }, []);

  if (!round && !finished) {
    return (
      <GameShell title="Susun Kalimat">
        <p className="font-heading text-xl text-ink-muted text-center py-16">Memuat…</p>
      </GameShell>
    );
  }

  if (finished) {
    return (
      <GameShell title="Susun Kalimat">
        <ConfettiEffect show />
        <section className="max-w-md mx-auto bg-surface rounded-3xl border border-line p-6 sm:p-8 flex flex-col items-center text-center gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-warn" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
          </svg>
          <h2 className="font-heading text-3xl font-bold text-ink">Hebat Sekali!</h2>
          <p className="font-body text-xl text-ink-muted">Kamu menyusun {SESSION_SIZE} kalimat dan dapat {score} bintang!</p>
          <BigButton onClick={restart} className="w-full sm:w-auto">Main Lagi</BigButton>
        </section>
      </GameShell>
    );
  }

  const usedIds = new Set(answer.map((t) => t.id));
  const solved = status === "done";

  return (
    <GameShell title="Susun Kalimat">
      <GameTutorial
        gameKey="susun-kalimat"
        steps={[
          { image: "/images/ui/listen.webp", text: "Dengarkan kalimatnya. Tekan 'Dengar' untuk mengulang." },
          { image: "/images/ui/choose.webp", text: "Ketuk kata-kata sesuai urutan. Ketuk kata di atas untuk mengembalikannya." },
        ]}
      />
      <ConfettiEffect show={solved} />

      {/* Fits one screen (dvh minus GameShell header/padding): no scrolling while playing. */}
      <div className="max-w-md mx-auto flex flex-col gap-3 h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)] min-h-[460px] max-h-[760px]">
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-line rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full origin-left"
              initial={false}
              animate={{ scaleX: (idx + 1) / rounds.length }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="font-body text-base text-ink-muted tabular-nums">{idx + 1} / {rounds.length}</p>
        </div>

        <section className="flex-1 min-h-0 bg-surface rounded-3xl border border-line p-4 flex flex-col gap-3">
          {solved ? (
            /* Reward: the picture of the sentence just built */
            <motion.div
              key={`done-${round.sentence.id}`}
              className="flex-1 min-h-0 flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                <AssetImage src={`/images/sentences/${round.sentence.id}.webp`} eager className="h-full max-h-72 aspect-square rounded-3xl" />
              </div>
              <p className="shrink-0 font-heading text-2xl sm:text-3xl font-bold text-good-strong text-center first-letter:uppercase">
                {round.sentence.text}.
              </p>
              <p className="shrink-0 font-body text-base text-ink-muted" aria-live="polite">
                {missed ? "Benar! +1 bintang" : "Sempurna! +2 bintang"}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="shrink-0 flex items-center justify-between gap-3">
                <p className="font-heading text-xl font-bold text-ink">Susun kalimat yang kamu dengar</p>
                <button
                  type="button"
                  onClick={listen}
                  aria-label="Dengar kalimat"
                  className="shrink-0 w-14 h-14 rounded-full bg-accent-strong text-on-accent flex items-center justify-center hover:bg-ink transition-colors"
                >
                  <SpeakerIcon />
                </button>
              </div>

              {/* Answer line: one slot per word; placed words can be tapped back */}
              <div
                className={`shrink-0 min-h-[88px] rounded-2xl border-2 border-dashed p-2 flex flex-wrap content-center justify-center gap-2 transition-colors ${
                  status === "wrong" ? "border-warn bg-paper" : "border-line bg-paper"
                }`}
              >
                {round.words.map((_, i) => {
                  const tile = answer[i];
                  return tile ? (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => unplace(tile)}
                      aria-label={`Kembalikan ${tile.text}`}
                      className="min-h-[56px] px-4 rounded-2xl bg-accent-soft border-2 border-accent font-heading text-xl text-ink"
                    >
                      {tile.text}
                    </button>
                  ) : (
                    <span key={`slot-${i}`} aria-hidden="true" className="min-h-[56px] min-w-[72px] rounded-2xl border-2 border-dashed border-line" />
                  );
                })}
              </div>
              <p className="shrink-0 min-h-[28px] text-center font-heading text-lg text-ink" aria-live="polite">
                {status === "wrong" ? "Urutannya belum pas, coba lagi" : ""}
              </p>

              {/* Word bank */}
              <div className="flex-1 min-h-0 flex flex-wrap content-center justify-center gap-3">
                {round.tiles.map((tile) => {
                  const used = usedIds.has(tile.id);
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => place(tile)}
                      disabled={used || status !== "play"}
                      aria-hidden={used || undefined}
                      className={`min-h-[64px] min-w-[88px] px-5 rounded-3xl border-2 font-heading text-2xl transition-[opacity,background-color] duration-150 ${
                        used ? "opacity-0 pointer-events-none border-line" : "bg-paper text-ink border-line hover:bg-accent-soft active:bg-line"
                      }`}
                    >
                      {tile.text}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {solved && (
          <div className="shrink-0 grid grid-cols-2 gap-3">
            <BigButton tone="quiet" onClick={listen}>
              <SpeakerIcon /> Dengar
            </BigButton>
            <BigButton tone="good" onClick={next}>
              {idx < rounds.length - 1 ? "Lanjut" : "Selesai"}
            </BigButton>
          </div>
        )}
      </div>
    </GameShell>
  );
}
