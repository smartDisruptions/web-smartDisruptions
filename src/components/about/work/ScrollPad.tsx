import ScrollPadFX from './ScrollPadFX';

/**
 * Marks <html> with data-au-pad while /about is showing, which gives the
 * page's scroller the padding that keeps keyboard focus and section jumps
 * clear of the sticky header (app/about/work.css explains why, and why it
 * isn't a :has() rule).
 *
 * Two halves. On a full page load the inline script sets it as the page is
 * parsed, before the first paint and before the browser jumps to a #hash in
 * the address (a shared link to /about#wall lands right). Scripts in markup
 * React renders on a client navigation never run, so ScrollPadFX sets it
 * there, in a layout effect — before the router scrolls to a #hash — and
 * takes it away when the page goes.
 */
export default function ScrollPad() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.setAttribute('data-au-pad','')",
        }}
      />
      <ScrollPadFX />
    </>
  );
}
