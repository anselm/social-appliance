import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useState } from "react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
    setLocation("/home");
  };

  return (
    <section className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight" data-testid="text-cta-title">
            Ready to Connect?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12" data-testid="text-cta-subtitle">
            Join our waitlist and be among the first to experience real-world social networking.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white text-black border-white h-12"
                data-testid="input-email"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto min-h-12 px-8 bg-white text-black hover:bg-white"
                data-testid="button-submit"
              >
                Join Waitlist
              </Button>
            </div>
          </form>

          <div className="mt-16 pt-16 border-t border-white/20">
            <p className="text-sm text-gray-400 mb-4" data-testid="text-opensource">
              This project is open source and community driven
            </p>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              data-testid="button-github-footer"
            >
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
