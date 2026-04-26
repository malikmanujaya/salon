import Hero from '../components/sections/Hero';
import TrustedBy from '../components/sections/TrustedBy';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Showcase from '../components/sections/Showcase';
import Testimonials from '../components/sections/Testimonials';
import Pricing from '../components/sections/Pricing';
import CTASection from '../components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Showcase />
      <Testimonials />
      <Pricing />
      <CTASection />
    </>
  );
}
