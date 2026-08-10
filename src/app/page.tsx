import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { BusinessTypes } from "@/components/landing/business-types";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BusinessTypes />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
