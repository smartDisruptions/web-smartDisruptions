import SubscribeForm from '@/components/SubscribeForm';
import Kiru from '@/components/kiru/Kiru';

/** The newsletter, on a sheet, with Kiru sitting on its top edge. */
export default function CTASection() {
  return (
    <section aria-labelledby="hm-next" className="px-5 pt-28 pb-10 sm:px-6 sm:pt-36">
      <div className="sd-reveal relative mx-auto max-w-lg">
        <Kiru pose="sit" className="absolute -top-[92px] right-6 h-28 w-auto" />
        <div className="sd-sheet px-6 pt-8 pb-7 sm:px-9">
          <p className="sd-kicker">The newsletter</p>
          <h2 id="hm-next" className="font-display mt-3 text-3xl text-text-primary sm:text-[2.4rem]">
            Want the next build?
          </h2>
          <div className="mt-5">
            <SubscribeForm source="home" />
          </div>
        </div>
      </div>
    </section>
  );
}
