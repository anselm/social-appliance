import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import UseCasesSection from "@/components/UseCasesSection";
import SocialProofSection from "@/components/SocialProofSection";
import TrustSection from "@/components/TrustSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <FeaturesGrid />
      <UseCasesSection />
      <SocialProofSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  );
}
