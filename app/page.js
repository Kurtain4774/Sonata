import dynamic from "next/dynamic";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/landing/Footer";

const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"));
const DemoSection = dynamic(() => import("@/components/landing/DemoSection"));
const WhySonata = dynamic(() => import("@/components/landing/WhySonata"));
const SpotifyIntegration = dynamic(() => import("@/components/landing/SpotifyIntegration"));
const FAQSection = dynamic(() => import("@/components/landing/FAQSection"));
const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA"));

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
