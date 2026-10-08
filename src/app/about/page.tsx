import type { Metadata } from 'next';
import LatestWritingSection from '@/components/home/LatestWritingSection';
import FeaturedAppsSection from '@/components/home/FeaturedAppsSection';
import StormTeaser from '@/components/home/StormTeaser';

export const metadata: Metadata = {
  title: 'About — SmartDisruptions',
};

// PLACEHOLDER — the /about build replaces this.
export default function AboutPage() {
  return (
    <>
      <LatestWritingSection />
      <FeaturedAppsSection />
      <StormTeaser />
    </>
  );
}
