import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import heroImage from "@assets/stock_images/friends_meeting_at_l_81e65481.jpg";

export default function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative bg-black text-white pt-32 pb-24 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8" data-testid="text-hero-title">
            Real People.<br />Real Places.<br />Real Connections.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            The hyper-local social network that brings people together over shared passions—in person, in the real world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto min-h-12 px-8 text-base bg-white text-black hover:bg-white" 
              onClick={() => setLocation("/home")}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto min-h-12 px-8 text-base border-white text-white backdrop-blur-sm bg-white/10" 
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 lg:mt-24">
        <div className="relative overflow-hidden" data-testid="img-hero">
          <img 
            src={heroImage} 
            alt="People connecting at a local cafe" 
            className="w-full h-[400px] lg:h-[600px] object-cover grayscale contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
