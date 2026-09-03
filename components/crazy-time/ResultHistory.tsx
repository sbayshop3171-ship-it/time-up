import { targetLabel, type RoundResult } from './gameEngine';

export default function ResultHistory({ history }: { history: RoundResult[] }) {
  const rows = history.length ? history : [
    { roundId: 0, target: '5', payout: 5 },
    { roundId: -1, target: '2', payout: 2 },
    { roundId: -2, target: '1', payout: 1 },
    { roundId: -3, target: '10', payout: 10 },
  ] as RoundResult[];

  return (
    <div className="ct-history scroll-x" aria-label="Recent results">
      {rows.slice(0, 12).map((item, index) => (
        <span
          key={`${item.roundId}-${index}`}
          className={`ct-history__chip ct-history__chip--${item.target}`}
          title={targetLabel(item.target)}
        >
          {targetLabel(item.target)}
        </span>
      ))}
    </div>
  );
}
