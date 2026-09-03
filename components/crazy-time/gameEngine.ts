export type Phase = 'betting' | 'locked' | 'spinning' | 'result';

export type BetTarget =
  | '1'
  | '2'
  | '5'
  | '10'
  | 'coin-flip'
  | 'pachinko'
  | 'cash-hunt'
  | 'crazy-time';

export type Bet = {
  target: BetTarget;
  amount: number;
};

export type Bets = Partial<Record<BetTarget, number>>;

export type RoundResult = {
  roundId: number;
  target: BetTarget;
  payout: number;
};

export type BetTargetMeta = {
  id: BetTarget;
  label: string;
  sublabel: string;
  payout: number;
  tone: 'one' | 'two' | 'five' | 'ten' | 'coin' | 'pachinko' | 'cash' | 'crazy';
  kind: 'number' | 'bonus';
};

export type WheelSegment = {
  target: BetTarget;
  label: string;
  color: string;
};

export const BETTING_MS = 285_000;
export const LOCKED_MS = 10_000;
export const SPINNING_MS = 8_000;
export const RESULT_MS = 5_000;
export const START_BALANCE = 5_000;
export const CHIPS = [10, 20, 50, 100, 500, 1000] as const;

export const TARGETS: BetTargetMeta[] = [
  { id: '1', label: '1', sublabel: 'PAYS 1X', payout: 1, tone: 'one', kind: 'number' },
  { id: '2', label: '2', sublabel: 'PAYS 2X', payout: 2, tone: 'two', kind: 'number' },
  { id: '5', label: '5', sublabel: 'PAYS 5X', payout: 5, tone: 'five', kind: 'number' },
  { id: '10', label: '10', sublabel: 'PAYS 10X', payout: 10, tone: 'ten', kind: 'number' },
  { id: 'coin-flip', label: 'COIN FLIP', sublabel: 'BONUS GAME', payout: 0, tone: 'coin', kind: 'bonus' },
  { id: 'pachinko', label: 'PACHINKO', sublabel: 'BONUS GAME', payout: 0, tone: 'pachinko', kind: 'bonus' },
  { id: 'cash-hunt', label: 'CASH HUNT', sublabel: 'BONUS GAME', payout: 0, tone: 'cash', kind: 'bonus' },
  { id: 'crazy-time', label: 'CRAZY TIME', sublabel: 'BONUS GAME', payout: 0, tone: 'crazy', kind: 'bonus' },
];

const WHEEL_SEQUENCE: BetTarget[] = [
  '1', '2', '1', '5', '1', '2', '10', '1',
  'coin-flip', '2', '1', '5', '1', '2', 'pachinko', '1',
  '2', '1', '10', '2', '1', 'cash-hunt', '5', '1',
  '2', '1', '5', '2', '1', 'crazy-time', '10', '1',
  '2', '1', '5', '1', '2', 'coin-flip', '1', '10',
  '2', '1', 'pachinko', '5', '1', '2', 'cash-hunt', '1',
];

const SEGMENT_COLORS: Record<BetTarget, string> = {
  '1': '#75c7bb',
  '2': '#e0b552',
  '5': '#d783a5',
  '10': '#9898d6',
  'coin-flip': '#4ab4d2',
  pachinko: '#d552a6',
  'cash-hunt': '#50ae6a',
  'crazy-time': '#d74d45',
};

const LABELS = new Map(TARGETS.map((target) => [target.id, target.label]));

export const WHEEL_SEGMENTS: WheelSegment[] = WHEEL_SEQUENCE.map((target) => ({
  target,
  label: LABELS.get(target) ?? target,
  color: SEGMENT_COLORS[target],
}));

export function targetLabel(target: BetTarget): string {
  return LABELS.get(target) ?? target;
}

export function payoutFor(target: BetTarget): number {
  return TARGETS.find((item) => item.id === target)?.payout ?? 0;
}

export function totalBets(bets: Bets): number {
  return Object.values(bets).reduce((sum, amount) => sum + (amount ?? 0), 0);
}

export function addBetAmount(bets: Bets, target: BetTarget, amount: number): Bets {
  return { ...bets, [target]: (bets[target] ?? 0) + amount };
}

export function subtractBetAmount(bets: Bets, target: BetTarget, amount: number): Bets {
  const next = { ...bets };
  const remaining = (next[target] ?? 0) - amount;
  if (remaining > 0) next[target] = remaining;
  else delete next[target];
  return next;
}

export function doubleBets(bets: Bets): Bets {
  return Object.fromEntries(
    Object.entries(bets).map(([target, amount]) => [target, (amount ?? 0) * 2]),
  ) as Bets;
}

export function mergeBets(a: Bets, b: Bets): Bets {
  let next: Bets = { ...a };
  for (const [target, amount] of Object.entries(b) as [BetTarget, number][]) {
    next = addBetAmount(next, target, amount);
  }
  return next;
}

export function chooseResult(): BetTarget {
  return WHEEL_SEGMENTS[Math.floor(Math.random() * WHEEL_SEGMENTS.length)].target;
}

export function spinRotationFor(target: BetTarget, roundId: number, previousRotation: number): number {
  const candidates = WHEEL_SEGMENTS
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment.target === target);
  const picked = candidates[roundId % candidates.length]?.index ?? 0;
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const targetRotation = -(picked * segmentAngle + segmentAngle / 2);
  const previousTurn = previousRotation % 360;
  const delta = ((targetRotation - previousTurn) % 360 + 360) % 360;
  return previousRotation + 1440 + delta;
}

export function settleBets(bets: Bets, target: BetTarget) {
  const stake = totalBets(bets);
  const hitStake = bets[target] ?? 0;
  const payout = payoutFor(target);
  const winnings = hitStake * payout;
  return { stake, hitStake, payout, winnings, net: winnings - stake };
}

export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
