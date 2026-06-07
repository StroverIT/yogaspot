const PLACEHOLDER_GRADIENT = 'from-sage/45 via-primary/15 to-primary/25';

export function StudioGalleryHero({
  images,
  fill = false,
}: {
  images: string[];
  fill?: boolean;
}) {
  const src = images.find(Boolean);
  const shellClass = fill
    ? 'absolute inset-0 h-full w-full overflow-hidden'
    : 'relative mb-6 aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm';

  return (
    <div className={shellClass}>
      {src ? (
        <>
          <img
            src={src}
            alt="Студио"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-linear-to-br ${PLACEHOLDER_GRADIENT}`}
        >
          <span className="text-8xl drop-shadow-sm" aria-hidden>
            {'\u{1F9D8}'}
          </span>
        </div>
      )}
    </div>
  );
}
