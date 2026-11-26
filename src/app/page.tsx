import HeroScene from '@/components/home/hero/HeroScene';
import HeroSeam from '@/components/home/HeroSeam';
import DojoMap from '@/components/home/DojoMap';
import AboutTeaser from '@/components/home/AboutTeaser';
import CTASection from '@/components/home/CTASection';
import '@/components/home/home.css';

// The newest notes, the reel of builds and the Market Storm panel moved to
// the work (now /apps) in October 2026. The four doors are Apps, Learn,
// Arcade and Writing (Josh, November 2026); the three Build rooms are
// reached through /learn, the page whose headline promises all three.
export default function Home() {
  return (
    <>
      <HeroScene />
      <HeroSeam />
      <DojoMap />
      <AboutTeaser />
      <CTASection />
    </>
  );
}
