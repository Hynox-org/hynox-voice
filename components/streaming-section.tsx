import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

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
