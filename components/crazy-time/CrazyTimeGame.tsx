'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MenuIcon } from '@/components/Icons';
import { useAuth } from '@/components/AuthProvider';
import { useUI } from '@/components/UIProvider';
import { toTaka } from '@/lib/auth';
import { money } from '@/lib/brand';
import BetBoard from './BetBoard';
import ChipTray from './ChipTray';
import ResultHistory from './ResultHistory';
import Wheel from './Wheel';
import {
  addBetAmount,
  BETTING_MS,
  chooseResult,
  doubleBets,
  formatClock,
  LOCKED_MS,
  mergeBets,
  payoutFor,
  RESULT_MS,
  settleBets,
  SPINNING_MS,
  spinRotationFor,
  START_BALANCE,
  subtractBetAmount,
  targetLabel,
  totalBets,
  type Bet,
  type Bets,
  type BetTarget,
  type Phase,
  type RoundResult,
} from './gameEngine';

type RoundState = {
  id: number;
  phase: Phase;
  endsAt: number;
  result: RoundResult | null;
  spinRotation: number;
};

type LastOutcome = {
  target: BetTarget;
  stake: number;
  winnings: number;
  net: number;
};

type LiveFeedItem = {
  id: string;
  player: string;
  amount: number;
  verb: 'won' | 'bet';
};

const INITIAL_ROUND: RoundState = {
  id: 1,
  phase: 'betting',
  endsAt: 0,
  result: null,
  spinRotation: 0,
};

const PHASE_LABEL: Record<Phase, string> = {
  betting: 'BET',
  locked: 'LOCK',
  spinning: 'SPIN',
  result: 'HIT',
};

const INITIAL_LIVE_FEED: LiveFeedItem[] = [
  { id: 'seed-3561', player: '3561', amount: 2_189_919, verb: 'won' },
  { id: 'seed-edan', player: 'mbq edan', amount: 165_970, verb: 'won' },
  { id: 'seed-rosso', player: 'ROSSO11', amount: 85_279, verb: 'won' },
];

const LIVE_PLAYERS = ['Terry391', 'maton98', 'Sahil', 'ROSSO11', 'mbq edan', 'sluke'];
const LIVE_AMOUNTS = [72_487, 85_279, 165_970, 218_700, 535_205, 2_189_919];

const bdt = (amount: number) => `BDT ${amount.toLocaleString('en-US')}`;

function nextLiveWin(roundId: number, target: BetTarget): LiveFeedItem {
  const amount = LIVE_AMOUNTS[roundId % LIVE_AMOUNTS.length] + (payoutFor(target) * 1_000);
  return {
    id: `live-${roundId}-${target}`,
    player: LIVE_PLAYERS[roundId % LIVE_PLAYERS.length],
    amount,
    verb: 'won',
  };
}

export default function CrazyTimeGame() {
  const { ready: authReady, session, profile, wallet } = useAuth();
  const { toast } = useUI();
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [round, setRound] = useState<RoundState>(INITIAL_ROUND);
  const [selectedChip, setSelectedChip] = useState(10);
  const [gameBalance, setGameBalance] = useState(START_BALANCE);
  const [bets, setBets] = useState<Bets>({});
  const [undoStack, setUndoStack] = useState<Bet[]>([]);
  const [lastRoundBets, setLastRoundBets] = useState<Bets>({});
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [lastOutcome, setLastOutcome] = useState<LastOutcome | null>(null);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(INITIAL_LIVE_FEED);
  const betsRef = useRef<Bets>({});
  const walletBalanceRef = useRef<number | null>(null);

  const hasSession = Boolean(session);
  const mainBalance = wallet ? toTaka(wallet.balance) : null;
  const turnoverDone = wallet ? toTaka(wallet.turnover_done) : null;
  const turnoverNeed = wallet ? toTaka(wallet.turnover_need) : null;
  const displayName = profile?.display_name?.trim();
  const playerName = displayName
    || (profile?.phone ? `${profile.phone.slice(0, 3)}***${profile.phone.slice(-2)}` : null)
    || (hasSession ? 'Player' : 'Main Guest');

  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  useEffect(() => {
    if (mainBalance === null) return;
    if (walletBalanceRef.current === mainBalance) return;
    walletBalanceRef.current = mainBalance;
    setGameBalance(mainBalance);
  }, [mainBalance]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const startedAt = Date.now();
      setNow(startedAt);
      setRound({
        id: 1,
        phase: 'betting',
        endsAt: startedAt + BETTING_MS,
        result: null,
        spinRotation: 0,
      });
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready || round.endsAt === 0) return undefined;

    const timer = window.setTimeout(() => {
      const at = Date.now();

      if (round.phase === 'betting') {
        setRound({ ...round, phase: 'locked', endsAt: at + LOCKED_MS });
        return;
      }

      if (round.phase === 'locked') {
        const target = chooseResult();
        setRound({
          ...round,
          phase: 'spinning',
          endsAt: at + SPINNING_MS,
          result: { roundId: round.id, target, payout: payoutFor(target) },
          spinRotation: spinRotationFor(target, round.id, round.spinRotation),
        });
        return;
      }

      if (round.phase === 'spinning' && round.result) {
        const result = round.result;
        const outcome = settleBets(betsRef.current, result.target);
        const resolvedBets = betsRef.current;

        if (outcome.winnings > 0) {
          setGameBalance((balance) => balance + outcome.winnings);
        }

        setLastRoundBets(resolvedBets);
        setBets({});
        setUndoStack([]);
        setHistory((items) => [result, ...items].slice(0, 14));
        setLiveFeed((items) => {
          const nextItems = [nextLiveWin(round.id, result.target), ...items];
          if (outcome.stake > 0) {
            nextItems.unshift({
              id: `own-${round.id}`,
              player: outcome.winnings > 0 ? playerName : `Round ${round.id}`,
              amount: outcome.winnings > 0 ? outcome.winnings : outcome.stake,
              verb: outcome.winnings > 0 ? 'won' : 'bet',
            });
          }
          return nextItems.slice(0, 5);
        });
        setLastOutcome({
          target: result.target,
          stake: outcome.stake,
          winnings: outcome.winnings,
          net: outcome.net,
        });

        if (outcome.stake > 0) {
          if (result.payout === 0) {
            toast(`${targetLabel(result.target)} bonus feature next phase`);
          } else if (outcome.winnings > 0) {
            toast(`${targetLabel(result.target)} hit - ${money(outcome.winnings)} won`);
          } else {
            toast(`${targetLabel(result.target)} hit - no win`);
          }
        }

        setRound({ ...round, phase: 'result', endsAt: at + RESULT_MS });
        return;
      }

      setRound({
        id: round.id + 1,
        phase: 'betting',
        endsAt: at + BETTING_MS,
        result: null,
        spinRotation: round.spinRotation,
      });
      setLastOutcome(null);
    }, Math.max(0, round.endsAt - Date.now()));

    return () => window.clearTimeout(timer);
  }, [playerName, ready, round, toast]);

  const totalStake = useMemo(() => totalBets(bets), [bets]);
  const canBet = ready && round.phase === 'betting';
  const activeResult = round.phase === 'result' ? round.result?.target ?? null : null;
  const remaining = ready ? Math.max(0, round.endsAt - now) : 0;
  const balanceKind = mainBalance === null ? 'Demo balance' : 'Main balance';

  const placeBet = useCallback((target: BetTarget) => {
    if (!canBet) return;
    if (gameBalance < selectedChip) {
      toast('ব্যালেন্স যথেষ্ট নয়');
      return;
    }

    setGameBalance((balance) => balance - selectedChip);
    setBets((current) => addBetAmount(current, target, selectedChip));
    setUndoStack((current) => [...current, { target, amount: selectedChip }].slice(-80));
  }, [canBet, gameBalance, selectedChip, toast]);

  const undo = useCallback(() => {
    if (!canBet) return;
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setGameBalance((balance) => balance + last.amount);
    setBets((current) => subtractBetAmount(current, last.target, last.amount));
    setUndoStack((current) => current.slice(0, -1));
  }, [canBet, undoStack]);

  const clear = useCallback(() => {
    if (!canBet || totalStake === 0) return;
    setGameBalance((balance) => balance + totalStake);
    setBets({});
    setUndoStack([]);
  }, [canBet, totalStake]);

  const double = useCallback(() => {
    if (!canBet || totalStake === 0) return;
    if (gameBalance < totalStake) {
      toast('ডাবল করার মতো ব্যালেন্স নেই');
      return;
    }

    const additions = Object.entries(bets)
      .map(([target, amount]) => ({ target: target as BetTarget, amount: amount ?? 0 }))
      .filter((item) => item.amount > 0);
    setGameBalance((balance) => balance - totalStake);
    setBets((current) => doubleBets(current));
    setUndoStack((current) => [...current, ...additions].slice(-80));
  }, [bets, canBet, gameBalance, toast, totalStake]);

  const repeat = useCallback(() => {
    if (!canBet) return;
    const amount = totalBets(lastRoundBets);
    if (amount === 0) return;
    if (gameBalance < amount) {
      toast('রিপিট করার মতো ব্যালেন্স নেই');
      return;
    }

    const additions = Object.entries(lastRoundBets)
      .map(([target, value]) => ({ target: target as BetTarget, amount: value ?? 0 }))
      .filter((item) => item.amount > 0);
    setGameBalance((balance) => balance - amount);
    setBets((current) => mergeBets(current, lastRoundBets));
    setUndoStack((current) => [...current, ...additions].slice(-80));
  }, [canBet, gameBalance, lastRoundBets, toast]);

  const statusText = lastOutcome
    ? `${targetLabel(lastOutcome.target)} - ${lastOutcome.net >= 0 ? '+' : ''}${money(lastOutcome.net)}`
    : authReady
      ? 'Place chips before lock'
      : 'Loading main balance';

  return (
    <section className="ct-game" aria-label="Crazy Time demo game">
      <div className="ct-stage">
        <div className="ct-live">
          {liveFeed.slice(0, 3).map((item, index) => (
            <span key={item.id} className={index === 0 ? 'ct-live__lead' : undefined}>
              {index === 0 ? (
                <>
                  <b>{item.player}</b> {item.verb} {bdt(item.amount)}
                </>
              ) : (
                <>
                  {bdt(item.amount)} {item.player}
                </>
              )}
            </span>
          ))}
          <span className="ct-live__wallet">
            {balanceKind} {money(gameBalance)}
            {turnoverNeed !== null && turnoverNeed > 0 ? ` · Turnover ${money(turnoverDone ?? 0)}/${money(turnoverNeed)}` : ''}
          </span>
        </div>
        <Wheel phase={round.phase} result={round.result?.target ?? null} rotation={round.spinRotation} />
        <div className={`ct-timer ct-timer--${round.phase}`}>
          <span>{PHASE_LABEL[round.phase]}</span>
          <b>{round.phase === 'result' && round.result ? targetLabel(round.result.target) : formatClock(remaining)}</b>
        </div>
      </div>

      <ResultHistory history={history} />

      <BetBoard bets={bets} disabled={!canBet} result={activeResult} onTarget={placeBet} />

      <ChipTray selected={selectedChip} disabled={!canBet} onSelect={setSelectedChip} />

      <div className="ct-controls" aria-label="Round controls">
        <button type="button" onClick={repeat} disabled={!canBet || totalBets(lastRoundBets) === 0} aria-label="Repeat bets">↻</button>
        <button type="button" onClick={undo} disabled={!canBet || undoStack.length === 0} aria-label="Undo last bet">↶</button>
        <button className="ct-controls__chip" type="button" disabled aria-label="Selected chip">{selectedChip}</button>
        <button type="button" onClick={double} disabled={!canBet || totalStake === 0} aria-label="Double bets">×2</button>
        <button type="button" onClick={clear} disabled={!canBet || totalStake === 0} aria-label="Clear bets">CLR</button>
        <button type="button" onClick={() => toast('Menu will open in next phase')} aria-label="Game menu"><MenuIcon /></button>
      </div>

      <div className="ct-foot">
        <span>{statusText}</span>
        <b>{balanceKind} {money(gameBalance)} · Bet {money(totalStake)}</b>
      </div>
    </section>
  );
}
