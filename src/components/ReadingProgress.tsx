import Kiru from '@/components/kiru/Kiru';

/**
 * Reading progress: Kiru runs along the top of the screen as you read, a thin
 * vermilion ink trail streaming out behind him.
 *
 * No JavaScript at all. The article sheet declares a view timeline
 * (`.wr-read-target` → `view-timeline: --wr-read`), the post page shares it
 * with this sibling (`timeline-scope` on `.wr-post`), and CSS drives
 * everything from it on the compositor:
 *
 *  - The runner is one full-width strip — trail on the left, Kiru at the
 *    right end — slid in from off-screen, so the trail "grows" and Kiru moves
 *    with a single transform. 0% is the article's top reaching the top of
 *    the screen, 100% its last line reaching the bottom: it measures the
 *    ARTICLE, not the document, so he arrives as you finish the last
 *    paragraph rather than somewhere in the footer.
 *  - His legs are scroll-driven too (many short iterations of the stride
 *    across the read), so he runs while you scroll and stands mid-stride
 *    when you stop. He is `still`, so the global idle loop never touches him.
 *  - He fades in once the article reaches the top and away once it has
 *    left, so he never sits over the title or the subscribe card.
 *
 * It sits just under the header (and slides up with it when the phone
 * header tucks away), never over the nav. Reduced motion: no ninja, just
 * the thin trail. No scroll-timeline support: nothing — the page reads the
 * same without it. Styles live in app/content/writing.css.
 */
export default function ReadingProgress() {
  return (
    <div className="wr-progress" aria-hidden>
      <div className="wr-runner">
        <span className="wr-trail" />
        <Kiru pose="run" flip still className="wr-runner-kiru" />
      </div>
    </div>
  );
}
