import { Hero } from "@/components/Hero";
import { ProductDemo } from "@/components/ProductDemo";
import { SectionBridge } from "@/components/SectionBridge";
import { HowItWorks } from "@/components/HowItWorks";
import { PriceExplorer } from "@/components/PriceExplorer";
import { ClinicCarousel } from "@/components/ClinicCarousel";
import { TrustPillars } from "@/components/TrustPillars";
import { DarkCta } from "@/components/DarkCta";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductDemo />
      <ScrollReveal>
        <SectionBridge text="Tre steg. Två minuter. Så här ser varje steg ut." targetId="how-it-works" />
      </ScrollReveal>
      <HowItWorks />
      <ScrollReveal>
        <SectionBridge text="Men vad kostar det egentligen? Här är referenspriserna." targetId="prices" />
      </ScrollReveal>
      <PriceExplorer />
      <ClinicCarousel />
      <TrustPillars />
      <ScrollReveal direction="none">
        <DarkCta />
      </ScrollReveal>
      <Footer />
    </>
  );
}
