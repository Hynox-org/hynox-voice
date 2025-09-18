import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">
      <div className="flex-1 space-y-6 sm:space-y-8 animate-fade-in-left">
        <div className="space-y-2 sm:space-y-4">
          <p className="text-accent text-xs sm:text-sm font-medium tracking-wider uppercase animate-fade-in-up delay-100">
            Ultimate AI Voice Agent
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in-up delay-200">
            <span className="gradient-text">JOIN THE FUTURE OF</span>
            <br />
            <span className="text-white">VOICE AI</span>
          </h1>
        </div>

        <p className="text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed animate-fade-in-up delay-300">
          Empower your business with Hynox Vox — a multilingual AI voice assistant that listens, understands, and acts
          in real time.
        </p>

        <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 rounded-lg neon-glow hover-scale animate-fade-in-up delay-400">
          Request a Demo
        </Button>
      </div>

      <div className="flex-1 relative mt-8 sm:mt-12 lg:mt-0 animate-fade-in-right delay-300">
        <div className="relative animate-float">
          <img
            src="/futuristic-person-with-ai-robot-and-phone-interfac.jpg"
            alt="AI Voice Technology"
            className="w-full max-w-sm sm:max-w-lg mx-auto hero-image hover-scale"
          />

          <Card className="absolute top-2 sm:top-4 right-2 sm:right-4 p-3 sm:p-4 bg-card/90 backdrop-blur-sm card-glow hover-glow animate-pulse-slow">
            <div className="text-center space-y-2">
              <p className="text-primary font-semibold text-sm">JOIN US NOW</p>
              <p className="text-xs text-muted-foreground">Follow Us</p>
              <div className="flex space-x-2 justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-cyan flex items-center justify-center hover-scale">
                  <span className="text-xs text-white">f</span>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-magenta flex items-center justify-center hover-scale">
                  <span className="text-xs text-white">t</span>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-green flex items-center justify-center hover-scale">
                  <span className="text-xs text-white">in</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
