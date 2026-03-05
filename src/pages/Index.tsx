import DataStreamOverlay from '@/components/DataStreamOverlay';
import ServicesStack from '@/components/ServicesStack';
import StorytellingAnimation from '@/components/StorytellingAnimation';
import ProcessSection from '@/components/ProcessSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <DataStreamOverlay />
      <ServicesStack />
      <StorytellingAnimation />
      <ProcessSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
