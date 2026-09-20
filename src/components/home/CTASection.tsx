import { RevealOnScroll } from '@/components/ui';
import SubscribeForm from '@/components/SubscribeForm';

export default function CTASection() {
  return (
    <section className="px-5 pt-6 pb-24 sm:px-6">
      <RevealOnScroll>
        {/* A taped paper card rather than a sticky note: the form's helper text
            uses the theme's own text colours, which a fixed-yellow sticky
            cannot carry in dark mode. */}
        <div className="nb-sheet nb-tape mx-auto max-w-lg rotate-[0.8deg] px-6 pt-9 pb-7 sm:px-9">
          <h2 className="font-display text-4xl text-text-primary sm:text-[2.6rem]">
            want the next build?
          </h2>
          <div className="mt-5">
            <SubscribeForm source="home" />
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
