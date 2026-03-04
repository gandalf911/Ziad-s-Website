import DataStreamOverlay from '@/components/DataStreamOverlay';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StorytellingAnimation from '@/components/StorytellingAnimation';
import ProcessSection from '@/components/ProcessSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <DataStreamOverlay />
      <HeroSection />
      <FeaturesSection />
      <StorytellingAnimation />
      <ProcessSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
