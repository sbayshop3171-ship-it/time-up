'use client';

import { money } from '@/lib/brand';
import { fmtX, type Phase } from '@/lib/aviator';

/** Sample table of other players. Real rows arrive from Supabase once
    bets are persisted; the shape here is what that query will return. */
const SEATS = [
  { user: '*******418', stake: 500 },
  { user: '*******902', stake: 1200 },
  { user: '*******147', stake: 250 },
  { user: '*******660', stake: 3000 },
  { user: '*******035', stake: 800 },
  { user: '*******571', stake: 150 },
  { user: '*******284', stake: 2000 },
  { user: '*******719', stake: 600 },
];

/** Deterministic per-seat target, so the table does not reshuffle each frame. */
const targetFor = (i: number) => 1.2 + ((i * 37) % 45) / 10;

export default function LiveBets({ phase, multiplier }: { phase: Phase; multiplier: number }) {
  return (
    <section className="sec">
      <div className="sec__hd">
        <h2 className="sec__title">এই রাউন্ডের বেট</h2>
        <div className="sec__ctrl"><span>{SEATS.length} জন</span></div>
      </div>

      <div className="av-bets">
        {SEATS.map((s, i) => {
          const target = targetFor(i);
          const out = phase !== 'betting' && multiplier >= target;
          return (
            <div className={`av-bets__row${out ? ' is-out' : ''}`} key={s.user}>
              <span className="av-bets__u">{s.user}</span>
              <span className="av-bets__s">{money(s.stake)}</span>
              <span className="av-bets__x">{out ? fmtX(target) : '—'}</span>
              <span className="av-bets__w">{out ? money(Math.round(s.stake * target)) : '—'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
