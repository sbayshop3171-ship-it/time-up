import type { CSSProperties } from 'react';
import { targetLabel, WHEEL_SEGMENTS, type BetTarget, type Phase } from './gameEngine';

function point(cx: number, cy: number, radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function slicePath(index: number, total: number) {
  const start = (index * 360) / total;
  const end = ((index + 1) * 360) / total;
  const a = point(50, 50, 46, start);
  const b = point(50, 50, 46, end);
  return `M50 50 L${a.x.toFixed(3)} ${a.y.toFixed(3)} A46 46 0 0 1 ${b.x.toFixed(3)} ${b.y.toFixed(3)} Z`;
}

export default function Wheel({
  phase,
  result,
  rotation,
}: {
  phase: Phase;
  result: BetTarget | null;
  rotation: number;
}) {
  const spinning = phase === 'spinning';
  const held = phase === 'result';
  const style = { '--ct-spin-rotation': `${rotation}deg` } as CSSProperties;
  const rotorClass = ['ct-wheel__rotor', spinning ? 'is-spinning' : '', held ? 'is-held' : 'is-idle']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="ct-wheel" aria-label="Crazy Time spinning wheel">
      <span className="ct-wheel__pin" aria-hidden />
      <div className={rotorClass} style={style}>
        <svg viewBox="0 0 100 100" role="img" aria-label={result ? `${targetLabel(result)} selected` : 'Wheel rotating'}>
          <defs>
            <radialGradient id="ct-wheel-hub" cx="50%" cy="48%" r="54%">
              <stop offset="0%" stopColor="#fff5c8" />
              <stop offset="48%" stopColor="#f2c34b" />
              <stop offset="78%" stopColor="#c97824" />
              <stop offset="100%" stopColor="#5a2c10" />
            </radialGradient>
            <radialGradient id="ct-wheel-glow" cx="50%" cy="50%" r="58%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".24" />
              <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="49" fill="#d89e29" />
          <circle cx="50" cy="50" r="46.5" fill="#173c38" />
          {WHEEL_SEGMENTS.map((segment, index) => {
            const mid = (index * 360) / WHEEL_SEGMENTS.length + 360 / WHEEL_SEGMENTS.length / 2;
            const short = segment.target === 'coin-flip' ? 'CF'
              : segment.target === 'pachinko' ? 'P'
                : segment.target === 'cash-hunt' ? 'CH'
                  : segment.target === 'crazy-time' ? 'CT'
                    : segment.label;
            return (
              <g key={`${segment.target}-${index}`}>
                <path d={slicePath(index, WHEEL_SEGMENTS.length)} fill={segment.color} stroke="#f8e6a3" strokeWidth=".42" />
                <text
                  x="50"
                  y="11"
                  transform={`rotate(${mid} 50 50)`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="ct-wheel__txt"
                >
                  {short}
                </text>
              </g>
            );
          })}
          <circle cx="50" cy="50" r="31" fill="none" stroke="#fff6c0" strokeWidth=".8" strokeDasharray="1.3 3" opacity=".72" />
          <circle cx="50" cy="50" r="18" fill="url(#ct-wheel-hub)" stroke="#fff1ad" strokeWidth="1.4" />
          <circle cx="50" cy="50" r="10.5" fill="#6f3027" stroke="#f6cf66" strokeWidth=".9" />
          <text x="50" y="47.3" textAnchor="middle" className="ct-wheel__brand">CRAZY</text>
          <text x="50" y="56.2" textAnchor="middle" className="ct-wheel__brand">TIME</text>
          <circle cx="50" cy="50" r="46" fill="url(#ct-wheel-glow)" />
        </svg>
      </div>
    </div>
  );
}
