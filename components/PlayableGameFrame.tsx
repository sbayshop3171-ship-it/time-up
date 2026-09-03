function frameUrl(raw?: string): string | null {
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function PlayableGameFrame({ url, name }: { url?: string; name: string }) {
  const src = frameUrl(url);

  if (!src) {
    return (
      <section className="play-frame play-frame--empty" aria-label={name}>
        <div className="note play-frame__empty">
          গেম চালু করার authorized launch URL সেট করা হয়নি।
        </div>
      </section>
    );
  }

  return (
    <section className="play-frame" aria-label={name}>
      <div className="play-frame__box">
        <iframe
          src={src}
          title={name}
          allow="autoplay; fullscreen; encrypted-media; clipboard-read; clipboard-write"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>
    </section>
  );
}
