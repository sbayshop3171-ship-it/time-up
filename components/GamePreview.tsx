import Link from 'next/link';

/**
 * Game shown running, but gated behind a deposit.
 *
 * Two kinds of source feed this, told apart by the URL:
 *  - A provider's own play-money page (real art, real reels).
 *  - A self-hosted .mp4/.webm gameplay clip, for games with no fun mode.
 *
 * Either way a transparent veil sits on top and the frame takes no input, so
 * the game plays on screen but a visitor cannot touch it — the deposit CTA
 * above is the way in. No session token, no wallet.
 */

/** youtu.be/ID, watch?v=ID or embed/ID → the id, else null. */
function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/** a path/URL ending in a video container we can play natively. */
const isVideoFile = (url: string) => /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);

export default function GamePreview({ url, name }: { url: string; name: string }) {
  const ytId = youTubeId(url);
  const video = isVideoFile(url);

  const src = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1`
    : url;

  return (
    <section className="gpv">
      {/* deposit CTA sits above the game */}
      <div className="gpv__bar">
        <span className="gpv__note">ডিপোজিট করলে খেলতে পারবেন</span>
        <Link href="/deposit" className="btn btn--gold gpv__cta">ডিপোজিট</Link>
      </div>

      <div className={`gpv__box${video ? ' gpv__box--video' : ''}`}>
        {/* sits behind the frame: providers take tens of seconds to pull their
            assets, and an empty black box reads as broken until then */}
        <p className="gpv__loading">গেম লোড হচ্ছে…</p>

        {video ? (
          <video
            src={url}
            title={name}
            autoPlay
            muted
            loop
            playsInline
            tabIndex={-1}
            aria-hidden="true"
          />
        ) : (
          <iframe
            src={src}
            title={name}
            tabIndex={-1}
            aria-hidden="true"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        )}

        {/* invisible: it only has to swallow the tap, not announce itself */}
        <div className="gpv__veil" aria-hidden />
      </div>
    </section>
  );
}
