import { money } from '@/lib/brand';
import { CHIPS } from './gameEngine';

export default function ChipTray({
  selected,
  disabled,
  onSelect,
}: {
  selected: number;
  disabled: boolean;
  onSelect: (chip: number) => void;
}) {
  return (
    <div className="ct-chips scroll-x" aria-label="Chip selector">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          className={`ct-chip${selected === chip ? ' is-selected' : ''}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          aria-label={`${money(chip)} chip`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
