import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { WhatWeMeasureSection } from "@/components/home/what-we-measure-section";
import { WhyBuildersSection } from "@/components/home/why-builders-section";

export default function HomePage() {
  return (
    <div className="space-y-24">
      <HeroSection />
      <HowItWorksSection />
      <WhatWeMeasureSection />
      <WhyBuildersSection />
    </div>
  );
}
