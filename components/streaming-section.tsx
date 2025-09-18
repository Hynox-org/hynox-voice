import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function StreamingSection() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto section-padding">
      <div className="text-center space-y-4 mb-12 sm:mb-16 animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          <span className="gradient-text">STREAM YOUR FAVORITES</span>
          <br />
          <span className="text-white">ANYTIME UNLIMITED ACCESS</span>
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
            className="w-full rounded-2xl hover-scale"
          />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 card-glow animate-pulse-slow">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse delay-200"></div>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">2.6K</span>
            </div>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-card card-glow hover-glow animate-fade-in-right delay-300">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-cyan/20 flex items-center justify-center hover-scale">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-brand-cyan"></div>
              </div>
              <div>
                <p className="text-brand-green text-xs sm:text-sm font-medium">AI VOICE ASSISTANT</p>
                <h3 className="text-lg sm:text-xl font-bold text-white">Multilingual AI Voice Assistant</h3>
              </div>
            </div>

            <p className="text-muted-foreground text-sm sm:text-base">
              Deliver exceptional customer experiences in multiple languages with advanced transcription, translation,
              and smart response insights.
            </p>

            <Button className="bg-brand-cyan hover:bg-brand-cyan/90 text-white px-6 py-2 rounded-lg neon-glow hover-scale w-full sm:w-auto">
              Request a Demo
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
