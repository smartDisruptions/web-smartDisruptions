import type { PostSummary } from '@/lib/posts';

/**
 * A post's hero, in whichever theme the site is currently wearing.
 *
 * The generated cards ship twice — the same art grounded on charcoal and on
 * paper — because a single dark image put a black slab in the middle of the
 * paper theme, and the images ended up the darkest thing on a warm page.
 *
 * Both copies render and CSS hides one (see `.hero-themed-*` in globals.css).
 * That is deliberate over `<picture>` + `prefers-color-scheme`, which only
 * knows what the OS wants and would ignore the site's own theme toggle, and
 * over picking one on the client, which cannot run before paint without a
 * flash. Two ~10KB WebPs is the cheaper trade.
 *
 * A post whose hero is a photograph or an app screenshot has no light variant
 * and needs none: it is a picture of a thing, not a themed surface, and it sits
 * on either ground the way a photo sits on a page.
 */
export default function HeroImage({
  post,
  className = '',
  priority = false,
}: {
  post: Pick<PostSummary, 'heroImage' | 'heroImageLight' | 'heroImageAlt' | 'title'>;
  className?: string;
  priority?: boolean;
}) {
  if (!post.heroImage) return null;

  const alt = post.heroImageAlt ?? post.title;
  const loading = priority ? undefined : ('lazy' as const);
  const fetchPriority = priority ? ('high' as const) : undefined;

  if (!post.heroImageLight) {
    return (
      <img
        src={post.heroImage}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <>
      <img
        src={post.heroImage}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={`hero-themed-dark ${className}`.trim()}
      />
      <img
        src={post.heroImageLight}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={`hero-themed-light ${className}`.trim()}
      />
    </>
  );
}
