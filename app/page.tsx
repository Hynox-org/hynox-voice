import { Header } from "@/components/header"
import { SiteFooter } from "@/components/footer"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content Block */}
        <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8">
          <p className="text-primary text-sm md:text-base font-medium tracking-wider uppercase">
            Next-Gen Voice Intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="gradient-text">Unlock Insights</span>
            <br />
            from Every Conversation
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Hynox Vox transforms raw voice data into actionable intelligence,
            empowering businesses to understand customers, optimize operations,
            and drive growth.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4 pt-4">
            <Link
              href="https://www.hynox.in/contact"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Button className="cursor-pointer bg-primary text-primary-foreground px-8 py-3 rounded-full text-lg font-semibold hover-scale">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Image/Visual Block */}
        <div className="flex-1 relative mt-12 lg:mt-0 flex justify-center items-center animate-fade-in-right delay-500">
          <img
            src="/futuristic-person-with-ai-robot-and-phone-interfac.jpg" // Reusing existing image
            alt="AI Voice Analytics Technology"
            className="w-full max-w-md md:max-w-lg lg:max-w-xl rounded-xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out hero-image-redesign animate-float-subtle"
          />
          {/* Optional: Add a subtle overlay or interactive element here if needed */}
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-transparent rounded-xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* Background elements for visual flair */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
}

export function StreamingSection() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-12 sm:mb-16 animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          <span className="gradient-text">STREAM YOUR FAVORITES</span>
          <br />
          <span className="text-foreground">ANYTIME UNLIMITED ACCESS</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Whether it's sales support or scheduling, Hynox Vox transforms conversations into actions with intelligent
          transcription, natural language understanding, and CRM integration.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="relative animate-fade-in-left delay-200">
          <img
            src="/futuristic-woman-with-headset-customer-service-ai-.jpg"
            alt="AI Customer Service"
            className="w-full rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-md rounded-xl p-3 shadow-xl animate-pulse-slow">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse delay-100"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-brand-magenta animate-pulse delay-200"></div>
              </div>
              <span className="text-foreground font-semibold text-sm">2.6K Live Viewers</span>
            </div>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-card shadow-2xl border border-border/50">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-brand-cyan/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <div className="w-6 h-6 rounded-full bg-brand-cyan shadow-lg"></div>
              </div>
              <div>
                <p className="text-brand-green text-sm font-medium uppercase tracking-wider">AI VOICE ASSISTANT</p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">Multilingual AI Voice Assistant</h3>
              </div>
            </div>

            <p className="text-muted-foreground text-base">
              Deliver exceptional customer experiences in multiple languages with advanced transcription, translation,
              and smart response insights. Our AI voice assistant seamlessly integrates with your existing CRM,
              providing real-time support and enhancing customer satisfaction.
            </p>
                <Link href="https://www.hynox.in/contact" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Button className="bg-brand-cyan cursor-pointer hover:bg-brand-cyan/80 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl w-full sm:w-auto">
              Request a Demo
            </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-12 sm:mb-16 animate-fade-in-up">
        <p className="text-brand-green text-xs sm:text-sm font-medium tracking-wider uppercase">
          Ultimate AI Voice Agent
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          <span className="gradient-text">YOUR NEW HOME FOR SMART</span>
          <br />
          <span className="text-foreground">VOICE AUTOMATION</span>
        </h2>
      </div>

      <div className="space-y-6">
        <Card className="p-6 sm:p-8 bg-card shadow-lg border border-border/50">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-cyan animate-pulse-slow">01.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Real-time Transcript & Summaries</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Capture, transcribe, and summarize conversations instantly with intelligent natural language
                  understanding for instant, actionable insights.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-cyan cursor-pointer text-brand-cyan hover:bg-brand-cyan hover:text-white bg-transparent transition-transform duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 bg-card shadow-lg border border-border/50">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-magenta animate-pulse-slow">02.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Multilingual Voice Assistant</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  HYNOX Voice's localized personas deliver speaking AI assistants that adapt to cultural nuances and
                  communication styles across global markets.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-magenta cursor-pointer text-brand-magenta hover:bg-brand-magenta hover:text-white bg-transparent transition-transform duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 bg-card shadow-lg border border-border/50">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-green animate-pulse-slow">03.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Retrieval-Augmented Answers</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Vector search + Generative OpenAI intelligent responses powered by your knowledge base with fast,
                  cost-efficient AI inference.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-green cursor-pointer text-brand-green hover:bg-brand-green hover:text-white bg-transparent transition-transform duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export function WhyChooseSection() {
  const features = [
    "Multilingual AI that speaks 20+ languages fluently",
    "Lightning-fast transcription with Google Speech-to-Text",
    "Smart CRM web updates and follow-up suggestions",
    "Enterprise-grade security and compliance",
  ]

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="relative animate-fade-in-left delay-100">
          <img
            src="/diverse-team-of-people-working-with-ai-robots-in-m.jpg"
            alt="Team with AI Technology"
            className="w-full rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-md rounded-xl p-3 shadow-xl">
            <div className="text-xl sm:text-2xl font-bold text-foreground">Voice</div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8 animate-fade-in-right delay-200">
          <div className="space-y-4">
            <p className="text-brand-green text-xs sm:text-sm font-medium tracking-wider uppercase animate-fade-in-up delay-300">
              Ultimate AI Voice Agent
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground animate-fade-in-up delay-400">
              <span className="gradient-text">WHY CHOOSE US YOUR</span>
              <br />
              <span className="text-foreground">HYNOX VOX</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Scale your conversational AI and empower your team. With Hynox Vox, you get multilingual support, faster
              response times, and real-time actionable insights.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 animate-fade-in-up delay-${(index + 6) * 100}`}
              >
                <div
                  className={`w-6 h-6 rounded-full ${
                    index === 0
                      ? "bg-brand-cyan"
                      : index === 1
                        ? "bg-brand-magenta"
                        : index === 2
                          ? "bg-brand-green"
                          : "bg-brand-yellow"
                  } flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-foreground text-sm sm:text-base">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

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
