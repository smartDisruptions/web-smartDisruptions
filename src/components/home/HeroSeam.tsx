/**
 * The seam between the hero and the four doors: two hairlines fading out
 * from a small vermilion diamond. It holds still and says nothing. It took
 * the place of the receipts band, a scrolling vermilion marquee of counts,
 * which Josh found noisy (November 2026); the counts live on the doors' own
 * chips and on /apps.
 */
export default function HeroSeam() {
  return (
    <div className="hm-seam" aria-hidden>
      <i />
      <span />
      <i />
    </div>
  );
}
