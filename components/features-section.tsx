import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto section-padding">
      <div className="text-center space-y-4 mb-12 sm:mb-16 animate-fade-in-up">
        <p className="text-brand-green text-xs sm:text-sm font-medium tracking-wider uppercase">
          Ultimate AI Voice Agent
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          <span className="gradient-text">YOUR NEW HOME FOR SMART</span>
          <br />
          <span className="text-white">VOICE AUTOMATION</span>
        </h2>
      </div>

      <div className="space-y-6">
        <Card className="p-6 sm:p-8 bg-card card-glow hover-glow animate-fade-in-up delay-100">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-cyan animate-pulse-slow">01.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">Real-time Transcript & Summaries</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Capture, transcribe, and summarize conversations instantly with intelligent natural language
                  understanding for instant, actionable insights.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-white bg-transparent hover-scale w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 bg-card card-glow hover-glow animate-fade-in-up delay-200">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-magenta animate-pulse-slow">02.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">Multilingual Voice Assistant</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  HVOX's localized personas deliver speaking AI assistants that adapt to cultural nuances and
                  communication styles across global markets.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-magenta text-brand-magenta hover:bg-brand-magenta hover:text-white bg-transparent hover-scale w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 bg-card card-glow hover-glow animate-fade-in-up delay-300">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-brand-green animate-pulse-slow">03.</div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">Retrieval-Augmented Answers</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Vector search + Generative OpenAI intelligent responses powered by your knowledge base with fast,
                  cost-efficient AI inference.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white bg-transparent hover-scale w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
