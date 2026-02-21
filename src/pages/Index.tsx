import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LiveValidationPanel from "@/components/landing/LiveValidationPanel";
import SecuritySection from "@/components/landing/SecuritySection";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LiveValidationPanel />
      <SecuritySection />
      <div id="pricing">
        <Pricing />
      </div>
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
