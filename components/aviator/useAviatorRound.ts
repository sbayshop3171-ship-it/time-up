'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BETTING_MS, CRASHED_MS, type Phase, type Round,
  createRound, multiplierAt,
} from '@/lib/aviator';

export interface HistoryEntry {
  id: number;
  crashAt: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

export interface RoundState {
  phase: Phase;
  /** while betting/flying the seed is withheld; revealed on the bust */
  round: Round | null;
  multiplier: number;
  bettingLeft: number;
  history: HistoryEntry[];
}

/**
 * Drives betting → flying → crashed.
 *
 * Rounds start on mount, never at module scope: the seed comes from
 * crypto.getRandomValues, which would differ between the server render
 * and the client and break hydration.
 */
export function useAviatorRound(clientSeed: string, onCrash?: (crashAt: number) => void) {
  const [state, setState] = useState<RoundState>({
    phase: 'betting', round: null, multiplier: 1, bettingLeft: BETTING_MS, history: [],
  });

  const raf = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const crashCb = useRef(onCrash);
  const seedRef = useRef(clientSeed);

  useEffect(() => {
    crashCb.current = onCrash;
  }, [onCrash]);

  useEffect(() => {
    seedRef.current = clientSeed;
  }, [clientSeed]);

  useEffect(() => {
    let id = 1;
    let cancelled = false;

    const wait = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
    };

    const startRound = async () => {
      const full = await createRound(id++, seedRef.current);
      if (cancelled) return;

      // the seed stays out of state until the bust, so the UI cannot leak it
      const { serverSeed, ...committed } = full;
      const openedAt = performance.now();

      setState((s) => ({
        ...s, phase: 'betting', round: committed, multiplier: 1, bettingLeft: BETTING_MS,
      }));

      const tickCountdown = () => {
        if (cancelled) return;
        const left = Math.max(0, BETTING_MS - (performance.now() - openedAt));
        setState((s) => (s.phase === 'betting' ? { ...s, bettingLeft: left } : s));
        if (left > 0) raf.current = requestAnimationFrame(tickCountdown);
      };
      raf.current = requestAnimationFrame(tickCountdown);

      wait(BETTING_MS, () => {
        const tookOff = performance.now();
        setState((s) => ({ ...s, phase: 'flying', multiplier: 1 }));

        const fly = () => {
          if (cancelled) return;
          const m = multiplierAt(performance.now() - tookOff);

          if (m >= full.crashAt) {
            setState((s) => ({
              ...s,
              phase: 'crashed',
              multiplier: full.crashAt,
              round: { ...committed, serverSeed },
              history: [
                { id: full.id, crashAt: full.crashAt, serverSeed, clientSeed: full.clientSeed, nonce: full.nonce },
                ...s.history,
              ].slice(0, 24),
            }));
            crashCb.current?.(full.crashAt);
            wait(CRASHED_MS, () => { void startRound(); });
            return;
          }

          setState((s) => (s.phase === 'flying' ? { ...s, multiplier: m } : s));
          raf.current = requestAnimationFrame(fly);
        };
        raf.current = requestAnimationFrame(fly);
      });
    };

    void startRound();

    return () => {
      cancelled = true;
      if (raf.current) cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return state;
}
