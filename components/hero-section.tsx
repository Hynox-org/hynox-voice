import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Keeping Card import in case it's used elsewhere or for future additions
import Link from "next/link";

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
