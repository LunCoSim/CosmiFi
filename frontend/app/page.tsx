import { HeroSection } from '../src/components/sections/HeroSection';
import { AboutSection } from '../src/components/sections/AboutSection';
import { NFTShowcaseSection } from '../src/components/sections/NFTShowcaseSection';
import { CompaniesSection } from '../src/components/sections/CompaniesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <NFTShowcaseSection />
      <CompaniesSection />
    </div>
  );
}