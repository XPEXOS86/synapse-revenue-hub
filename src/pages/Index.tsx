import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import InfraStatus from "@/components/landing/InfraStatus";
import ProductOverview from "@/components/landing/ProductOverview";
import LiveValidationPanel from "@/components/landing/LiveValidationPanel";
import BulkValidation from "@/components/landing/BulkValidation";
import SecuritySection from "@/components/landing/SecuritySection";
import Pricing from "@/components/landing/Pricing";
import AboutSection from "@/components/landing/AboutSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <InfraStatus />
      <ProductOverview />
      <LiveValidationPanel />
      <BulkValidation />
      <SecuritySection />
      <div id="pricing">
        <Pricing />
      </div>
      <div id="company">
        <AboutSection />
      </div>
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
