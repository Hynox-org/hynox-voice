import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StreamingSection } from "@/components/streaming-section"
import { FeaturesSection } from "@/components/features-section"
import { WhyChooseSection } from "@/components/why-choose-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <Header />
        <HeroSection />
        <StreamingSection />
        <FeaturesSection />
        <WhyChooseSection />
      </div>
    </main>
  )
}
