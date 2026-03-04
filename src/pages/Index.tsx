import DataStreamOverlay from '@/components/DataStreamOverlay';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ProcessSection from '@/components/ProcessSection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <DataStreamOverlay />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
