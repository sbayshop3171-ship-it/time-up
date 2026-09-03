/* ============================================================
   Game catalogue — placeholder data for the front-end build.
   Once a provider/aggregator is licensed this is replaced by a
   Supabase `games` table with the same shape, so nothing above
   this layer has to change.

   Thumbnails are CSS gradients + a glyph on purpose: real game
   artwork belongs to the providers and has to be pulled from
   their own CDN under licence, not copied.
   ============================================================ */

export type Tag = 'hot' | 'new' | 'top';

export interface Game {
  /** slug used in the URL: /casino/<slug> */
  id: string;
  name: string;
  glyph: string;
  provider: string;
  tag?: Tag;
  /** Licensed artwork URL. Local file in public/games/, or a provider CDN
      URL once an aggregator is wired (add its host to next.config images).
      Omitted → GameArt generates the tile. */
  thumb?: string;
}

export type CategoryKey =
  | 'hot' | 'sports' | 'live' | 'slot'
  | 'poker' | 'fish' | 'esports' | 'lottery';

const g = (name: string, glyph: string, provider: string, tag?: Tag, thumb?: string): Game => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name, glyph, provider, tag, thumb,
});

export const CATALOGUE: Record<CategoryKey, Game[]> = {
  hot: [
    g('Aviator', '✈️', 'Spribe', 'hot', '/games/aviator.webp'),
    g('Crazy Time', '🎡', 'Evolution', 'hot', '/games/crazy-time.webp'),
    g('Gates of Olympus', '⚡', 'Pragmatic', 'top', '/games/gates-of-olympus.webp'),
    g('Teen Patti', '🃏', 'Ezugi'),
    g('Sweet Bonanza', '🍭', 'Pragmatic', 'hot', '/games/sweet-bonanza.webp'),
    g('Dragon Tiger', '🐉', 'Ezugi'),
    g('Andar Bahar', '♠️', 'Evolution', 'new'),
    g('Mines', '💣', 'Spribe'),
    g('Lightning Roulette', '🎯', 'Evolution', 'top', '/games/lightning-roulette.webp'),
  ],
  sports: [
    g('Cricket Exchange', '🏏', 'Exchange', 'hot', '/games/cricket-exchange.webp'),
    g('Football', '⚽', 'Sportsbook', undefined, '/games/football.webp'),
    g('Tennis', '🎾', 'Sportsbook', undefined, '/games/tennis.webp'),
    g('Kabaddi', '🤼', 'Sportsbook', 'new'),
    g('Basketball', '🏀', 'Sportsbook'),
    g('Horse Racing', '🐎', 'Sportsbook'),
  ],
  live: [
    g('Lightning Roulette', '🎯', 'Evolution', 'hot'),
    g('Crazy Time', '🎡', 'Evolution', 'top'),
    g('Baccarat VIP', '🀄', 'Ezugi', undefined, '/games/baccarat-vip.webp'),
    g('Blackjack Party', '♣️', 'Evolution'),
    g('Andar Bahar Live', '♦️', 'Ezugi', 'hot'),
    g('Dragon Tiger Live', '🐲', 'Ezugi'),
    g('Monopoly Live', '🎩', 'Evolution'),
    g('Sic Bo', '🎲', 'Ezugi'),
    g('Mega Wheel', '🛞', 'Pragmatic', 'new'),
  ],
  slot: [
    g('Sweet Bonanza', '🍬', 'Pragmatic', 'hot'),
    g('Super Ace', '🂡', 'JILI', 'top'),
    g('Fortune Gems', '💎', 'JILI'),
    g('Big Bass Bonanza', '🎣', 'Pragmatic'),
    g('Starburst', '💫', 'NetEnt'),
    g('Wild West Gold', '🤠', 'Pragmatic'),
    g('Fruit Party', '🍉', 'Pragmatic', undefined, '/games/fruit-party.webp'),
    g('Money Train 3', '🚂', 'Relax', 'new'),
    g('Sugar Rush', '🧁', 'Pragmatic', 'hot'),
    g('Diamond Bonanza', '💎', 'Pragmatic', 'new', '/games/diamond-bonanza.webp'),
  ],
  poker: [
    g('Teen Patti 3D', '🃏', 'Ezugi', 'hot'),
    g('Card Matka', '🎴', 'KingMaker'),
    g('Rummy', '🂡', 'KingMaker'),
    g('Call Break', '🂮', 'KingMaker', 'new'),
    g('7 Up 7 Down', '🎰', 'Ezugi'),
    g('32 Cards', '🗂️', 'Ezugi'),
    g('Casino Holdem', '💼', 'Evolution'),
    g('Poker Pro', '🏆', 'JILI'),
    g('Baccarat', '🀄', 'CQ9'),
  ],
  fish: [
    g('Jackpot Fishing', '🐟', 'JILI', 'hot'),
    g('Dragon Fortune', '🐡', 'Pragmatic'),
    g('Ocean King 3', '🦈', 'CQ9', 'top'),
    g('Bombing Fishing', '💥', 'JILI'),
    g('Royal Fishing', '👑', 'JILI'),
    g('Mega Fishing', '🎣', 'JILI', 'new'),
    g('Fish Hunter', '🔱', 'CQ9'),
    g('Golden Toad', '🐸', 'JDB'),
    g('Boom Legend', '⚓', 'JILI'),
  ],
  esports: [
    g('Counter Strike', '🔫', 'E-Sports', 'hot'),
    g('Dota 2', '🛡️', 'E-Sports'),
    g('Mobile Legends', '📱', 'E-Sports', 'new'),
    g('Valorant', '🎯', 'E-Sports'),
    g('PUBG Mobile', '🪖', 'E-Sports'),
    g('League of Legends', '⚔️', 'E-Sports'),
  ],
  lottery: [
    g('Bingo 5', '🎱', 'JILI', 'hot'),
    g('Keno Live', '🔢', 'Evolution'),
    g('Lotto Instant', '🎟️', 'Betgames'),
    g('Number King', '🔟', 'JDB'),
    g('Lucky Draw', '🍀', 'KingMaker', 'new'),
    g('Color Game', '🌈', 'JILI'),
  ],
};

/** Tabs in the sticky rail, in the order the reference site uses. */
export const TAB_ORDER: CategoryKey[] = [
  'hot', 'sports', 'live', 'slot', 'poker', 'fish',
];

/** Every section rendered on the home page, top to bottom. */
export const HOME_SECTIONS: CategoryKey[] = [
  'hot', 'sports', 'live', 'slot', 'poker', 'fish', 'esports', 'lottery',
];

export const PROVIDERS = [
  'PRAGMATIC', 'EVOLUTION', 'JILI', 'EZUGI', 'PG SOFT', 'NETENT',
  'SPRIBE', 'CQ9', 'JDB', 'HABANERO', 'BETGAMES', 'RELAX', 'KINGMAKER',
];

export const PAYMENT_METHODS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Bank Transfer', 'USDT'];

/* ============================================================
   Demo previews — provider fun-mode URLs, keyed by the game id
   (the slug in /casino/<id>).

   VIEW ONLY. The page frames the URL behind a blocking overlay:
   the player sees the real game render but cannot click into it.
   Nothing here touches a wallet and no session token is minted,
   so these must be the provider's own public play-money pages —
   never a launch URL lifted from another operator's session.

   A game with no entry here keeps the "aggregator not connected"
   placeholder, so this map can be filled in one game at a time.
   ============================================================ */
export const DEMOS: Record<string, string> = {
  /* Pragmatic Play — demogamesfree is their own unauthenticated demo host.
     openGame.do redirects to a fresh play-money session on every load, so the
     URL never goes stale and carries no operator token. */
  'gates-of-olympus': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=en&cur=USD',
  'sweet-bonanza': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&lang=en&cur=USD',
  'big-bass-bonanza': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs10bbbonanza&lang=en&cur=USD',
  'wild-west-gold': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs40wildwest&lang=en&cur=USD',
  'fruit-party': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitparty&lang=en&cur=USD',
  'sugar-rush': 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugarrush&lang=en&cur=USD',

  /* Evolution live game shows have no fun mode at all, so there is no demo
     URL to give — a real launch URL would be one player's real-money session,
     tied to a balance and expiring in minutes. The stand-in is a short
     self-hosted gameplay clip: drop an .mp4/.webm in public/games/ and point
     the slug at it (e.g. '/games/crazy-time.mp4'). GamePreview plays a local
     video file in a muted, looping, view-only frame. YouTube is not an option
     here — it blocks embedding on gambling videos (age-gate / Error 153). */
  'crazy-time': '/games/crazy-time.mp4',

  /* Spribe — /launch mints a demo user + token per load on their own host.
     Aviator is deliberately absent: GameSection routes it to the in-house
     /game/aviator, so a Spribe frame here would never be reached. */
  'mines': 'https://demo.spribe.io/launch/mines?currency=USD&lang=en',
};

export const demoUrl = (id: string): string | undefined => DEMOS[id];

/* ============================================================
   Which games a visitor can actually see something for.

   A game is "previewable" if it has its own working engine on the
   site (PLAYABLE) or a demo entry above (a provider fun-mode page,
   or a gameplay clip). Everything else still has a page, but it
   shows the "aggregator not connected yet" placeholder — so the
   home page floats the previewable ones up and lets the rest sink.
   ============================================================ */
export const PLAYABLE_IDS = ['aviator'];

export const hasDemo = (id: string): boolean =>
  PLAYABLE_IDS.includes(id) || id in DEMOS;

/** Unique previewable games, in home-section order (first match wins). */
export function demoGames(): Game[] {
  const seen = new Set<string>();
  const out: Game[] = [];
  for (const key of HOME_SECTIONS) {
    for (const g of CATALOGUE[key]) {
      if (hasDemo(g.id) && !seen.has(g.id)) {
        seen.add(g.id);
        out.push(g);
      }
    }
  }
  return out;
}
