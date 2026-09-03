'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { CATALOGUE, hasDemo, PLAYABLE_IDS, type CategoryKey, type Game } from '@/lib/catalogue';
import { CATEGORY_LABEL, t } from '@/lib/strings';
import GameArt from './GameArt';
import { LeftIcon, RightIcon } from './Icons';

const TAG_LABEL = { hot: 'HOT', new: 'NEW', top: 'TOP' } as const;

export function GameCard({ game }: { game: Game; index?: number }) {
  /* A game with its own engine opens that; anything with a demo entry opens
     the view-only preview; the rest land on the placeholder page. */
  const href = PLAYABLE_IDS.includes(game.id) ? `/game/${game.id}` : `/casino/${game.id}`;
  return (
    <Link className="game" href={href}>
      {/* supplied artwork already carries its own HOT/NEW badge, so skip the
          overlay there to avoid stacking a second one */}
      {game.tag && !game.thumb && <i className={`tag tag--${game.tag}`}>{TAG_LABEL[game.tag]}</i>}
      <GameArt id={game.id} thumb={game.thumb} name={game.name} provider={game.provider} />
      <div className="game__meta">
        <div className="game__prov">{game.provider}</div>
      </div>
    </Link>
  );
}

/** Previewable games lead, the rest keep their order — a stable partition so
    every rail shows what a visitor can actually open first. */
function previewFirst(games: Game[]): Game[] {
  return [...games].sort((a, b) => Number(hasDemo(b.id)) - Number(hasDemo(a.id)));
}

export default function GameSection({
  category,
  games,
  title,
}: {
  category?: CategoryKey;
  games?: Game[];
  title?: string;
}) {
  const list = previewFirst(games ?? (category ? CATALOGUE[category] : []));
  const heading = title ?? (category ? CATEGORY_LABEL[category] : '');
  const railRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="sec" id={category ? `sec-${category}` : undefined}>
      <div className="sec__hd">
        <h2 className="sec__title">{heading}</h2>
        <div className="sec__ctrl">
          {category && <Link href={`/casino?category=${category}`}>{t.all}</Link>}
          <button type="button" aria-label={t.previous} onClick={() => nudge(-1)}><LeftIcon /></button>
          <button type="button" aria-label={t.next} onClick={() => nudge(1)}><RightIcon /></button>
        </div>
      </div>
      <div className="scroll-x" ref={railRef}>
        <div className="rail">
          {list.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </div>
    </section>
  );
}
