import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoSection from "@/components/landing/DemoSection";
import WhySonata from "@/components/landing/WhySonata";
import SpotifyIntegration from "@/components/landing/SpotifyIntegration";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <HowItWorks />
      <DemoSection />
      <WhySonata />
      <SpotifyIntegration />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
