import HeroSection from '@/components/home/HeroSection';
import LatestWritingSection from '@/components/home/LatestWritingSection';
import FeaturedAppsSection from '@/components/home/FeaturedAppsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <LatestWritingSection />
      <FeaturedAppsSection />
      <CTASection />
    </>
  );
}
