import { money } from '@/lib/brand';
import { TARGETS, type BetTarget, type Bets } from './gameEngine';

export default function BetBoard({
  bets,
  disabled,
  result,
  onTarget,
}: {
  bets: Bets;
  disabled: boolean;
  result: BetTarget | null;
  onTarget: (target: BetTarget) => void;
}) {
  return (
    <div className="ct-board" aria-label="Crazy Time bet board">
      {TARGETS.map((target) => {
        const amount = bets[target.id] ?? 0;
        const cls = [
          'ct-target',
          `ct-target--${target.tone}`,
          target.kind === 'bonus' ? 'ct-target--bonus' : '',
          amount > 0 ? 'is-armed' : '',
          result === target.id ? 'is-hit' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={target.id}
            className={cls}
            type="button"
            disabled={disabled}
            onClick={() => onTarget(target.id)}
            aria-label={`${target.label} bet`}
          >
            {amount > 0 && <span className="ct-target__bet">{money(amount)}</span>}
            <span className="ct-target__shine" aria-hidden />
            <strong>{target.label}</strong>
            <small>{target.sublabel}</small>
          </button>
        );
      })}
    </div>
  );
}
