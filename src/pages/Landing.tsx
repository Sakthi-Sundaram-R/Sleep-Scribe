import SpotlightHero from "../components/SpotlightHero";
import Marquee from "../components/fx/Marquee";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import DreamAnalyzer from "../components/DreamAnalyzer";
import DashboardPreview from "../components/DashboardPreview";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <>
      <main>
        <SpotlightHero />
        <Marquee />
        <Features />
        <HowItWorks />
        <DreamAnalyzer />
        <DashboardPreview />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
