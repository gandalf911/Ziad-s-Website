import ServicesStack from '@/components/ServicesStack';
import StorytellingAnimation from '@/components/StorytellingAnimation';
import ProcessSection from '@/components/ProcessSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <ServicesStack />
      {/* Opaque wrapper sits ABOVE the pinned ServicesStack sections
          so their dot-grid backgrounds don't bleed through */}
      <div className="relative z-10 bg-background">
        <StorytellingAnimation />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
