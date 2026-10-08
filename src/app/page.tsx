import HeroScene from '@/components/home/hero/HeroScene';
import ReceiptsBand from '@/components/home/ReceiptsBand';
import DojoMap from '@/components/home/DojoMap';
import BuildSections from '@/components/home/build/BuildSections';
import AboutTeaser from '@/components/home/AboutTeaser';
import CTASection from '@/components/home/CTASection';
import '@/components/home/home.css';

// The newest notes, the reel of builds and the Market Storm panel moved to
// /about in October 2026. Their place went to the three Build rooms: one
// section each (websites, apps, games), right after the doors that open them.
export default function Home() {
  return (
    <>
      <HeroScene />
      <ReceiptsBand />
      <DojoMap />
      <BuildSections />
      <AboutTeaser />
      <CTASection />
    </>
  );
}
