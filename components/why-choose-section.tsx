import { Check } from "lucide-react"

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
            <div className="text-xl sm:text-2xl font-bold text-foreground">HVOX</div>
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
