import HeroScene from '@/components/home/hero/HeroScene';
import ReceiptsBand from '@/components/home/ReceiptsBand';
import DojoMap from '@/components/home/DojoMap';
import AboutTeaser from '@/components/home/AboutTeaser';
import CTASection from '@/components/home/CTASection';
import '@/components/home/home.css';

// The newest notes, the reel of builds and the Market Storm panel moved to
// /about in October 2026. Three of the doors open the Build rooms; the
// rooms' own sections (websites, apps, games) live on /learn, the page whose
// headline promises all three.
export default function Home() {
  return (
    <>
      <HeroScene />
      <ReceiptsBand />
      <DojoMap />
      <AboutTeaser />
      <CTASection />
    </>
  );
}
