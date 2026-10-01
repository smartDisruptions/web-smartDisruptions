import HeroScene from '@/components/home/hero/HeroScene';
import ReceiptsBand from '@/components/home/ReceiptsBand';
import DojoMap from '@/components/home/DojoMap';
import LatestWritingSection from '@/components/home/LatestWritingSection';
import FeaturedAppsSection from '@/components/home/FeaturedAppsSection';
import StormTeaser from '@/components/home/StormTeaser';
import AboutTeaser from '@/components/home/AboutTeaser';
import CTASection from '@/components/home/CTASection';
import '@/components/home/home.css';

export default function Home() {
  return (
    <>
      <HeroScene />
      <ReceiptsBand />
      <DojoMap />
      <LatestWritingSection />
      <FeaturedAppsSection />
      <StormTeaser />
      <AboutTeaser />
      <CTASection />
    </>
  );
}
