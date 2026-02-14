import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import InfraStatus from "@/components/landing/InfraStatus";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductOverview from "@/components/landing/ProductOverview";
import LiveValidationPanel from "@/components/landing/LiveValidationPanel";
import BulkValidation from "@/components/landing/BulkValidation";
import Testimonials from "@/components/landing/Testimonials";
import SecuritySection from "@/components/landing/SecuritySection";
import ObjectionHandling from "@/components/landing/ObjectionHandling";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <InfraStatus />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <ProductOverview />
      <LiveValidationPanel />
      <BulkValidation />
      <Testimonials />
      <SecuritySection />
      <ObjectionHandling />
      <div id="pricing">
        <Pricing />
      </div>
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
