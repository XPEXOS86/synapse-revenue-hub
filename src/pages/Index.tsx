import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BrainGrid from "@/components/landing/BrainGrid";
import Pricing from "@/components/landing/Pricing";
import EdFunkAgents from "@/components/landing/EdFunkAgents";
import Integrations from "@/components/landing/Integrations";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <BrainGrid />
      <div id="pricing">
        <Pricing />
      </div>
      <div id="agents">
        <EdFunkAgents />
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
