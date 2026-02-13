import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BrainGrid from "@/components/landing/BrainGrid";
import Integrations from "@/components/landing/Integrations";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div id="brains">
        <BrainGrid />
      </div>
      <div id="integrations">
        <Integrations />
      </div>
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
