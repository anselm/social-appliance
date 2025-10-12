import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <a href="/" className="text-xl font-display font-bold" data-testid="link-home">
              Connect
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover-elevate px-3 py-2" data-testid="link-features">
                Features
              </a>
              <a href="#community" className="text-sm font-medium hover-elevate px-3 py-2" data-testid="link-community">
                Community
              </a>
              <a href="#trust" className="text-sm font-medium hover-elevate px-3 py-2" data-testid="link-trust">
                Trust & Safety
              </a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" data-testid="button-github">
              Open Source
            </Button>
            <Button size="sm" onClick={() => setLocation("/home")} data-testid="button-join">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <a href="#features" className="px-3 py-2 text-sm font-medium hover-elevate" data-testid="link-features-mobile">
                Features
              </a>
              <a href="#community" className="px-3 py-2 text-sm font-medium hover-elevate" data-testid="link-community-mobile">
                Community
              </a>
              <a href="#trust" className="px-3 py-2 text-sm font-medium hover-elevate" data-testid="link-trust-mobile">
                Trust & Safety
              </a>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="ghost" size="sm" className="w-full" data-testid="button-github-mobile">
                  Open Source
                </Button>
                <Button size="sm" className="w-full" onClick={() => setLocation("/home")} data-testid="button-join-mobile">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
