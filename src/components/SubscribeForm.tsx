// Email signup: Substack's own signup box, embedded.
//
// The list lives on Substack (decided 2026-11-16). Substack collects the
// email, sends the welcome email, runs unsubscribes and sends every
// newsletter, so this site stores nothing. The old self-hosted path
// (/api/subscribe → a Supabase project that paused in August 2026, after
// which every signup failed) is no longer called from anywhere.
//
// Substack's box is another site's page, so it can't be restyled from here:
// it has a see-through background and dark text. It sits on its own light
// card in both themes so it stays readable on the dark one. Its content is
// about 270px tall when there's room and about 310px on a phone, centred,
// with Substack's badge pinned to the bottom — hence the two heights, switched
// by the card's own width (a container query), not the viewport's.
//
// There is one list for everyone. The props are kept so every page that
// places a signup box compiles unchanged, but `source`, `cta` and `done` no
// longer change anything: Substack's box has its own button and its own
// confirmation step.
const SUBSTACK_EMBED = 'https://joshescusa.substack.com/embed';

export default function SubscribeForm({
  className = '',
}: {
  source?:
    | 'site'
    | 'post'
    | 'home'
    | 'market-storm'
    | 'websites'
    | 'apps'
    | 'games';
  className?: string;
  cta?: string;
  done?: string;
}) {
  return (
    <div className={`@container w-full max-w-md ${className}`.trim()}>
      <iframe
        src={SUBSTACK_EMBED}
        title="Subscribe to Smart Disruptions on Substack"
        loading="lazy"
        scrolling="no"
        className="block h-[372px] w-full rounded-2xl border border-[var(--sd-border-strong)] bg-white [color-scheme:light] @sm:h-[324px]"
      />
    </div>
  );
}
