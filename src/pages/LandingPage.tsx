import { Hero } from "@/components/Hero";
import { ProductDemo } from "@/components/ProductDemo";
import { SectionBridge } from "@/components/SectionBridge";
import { HowItWorks } from "@/components/HowItWorks";
import { PriceExplorer } from "@/components/PriceExplorer";
import { ClinicCarousel } from "@/components/ClinicCarousel";
import { TrustPillars } from "@/components/TrustPillars";
import { DarkCta } from "@/components/DarkCta";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductDemo />
      <SectionBridge text="Tre steg. Två minuter. Så här ser varje steg ut." targetId="how-it-works" />
      <HowItWorks />
      <SectionBridge text="Men vad kostar det egentligen? Här är referenspriserna." targetId="prices" />
      <PriceExplorer />
      <ClinicCarousel />
      <TrustPillars />
      <DarkCta />
      <Footer />
    </>
  );
}
