import HeroSection from '@/components/home/HeroSection';
import FeaturedAppsSection from '@/components/home/FeaturedAppsSection';
import SystemTeaserSection from '@/components/home/SystemTeaserSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedAppsSection />
      <SystemTeaserSection />
      <CTASection />
    </>
  );
}
