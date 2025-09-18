import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StreamingSection } from "@/components/streaming-section"
import { FeaturesSection } from "@/components/features-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { SiteFooter } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
              <Header />
      <div className="relative overflow-hidden">
        <HeroSection />
        <StreamingSection />
        <FeaturesSection />
        <WhyChooseSection />
        <SiteFooter />
      </div>
    </main>
  )
}
