import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Modules from "@/components/landing/Modules";
import Pricing from "@/components/landing/Pricing";
import Integrations from "@/components/landing/Integrations";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div id="modules">
        <Modules />
      </div>
      <div id="integrations">
        <Integrations />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
