import { SiGithub } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-xl font-display font-bold" data-testid="text-footer-brand">
              Connect
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left" data-testid="text-footer-tagline">
              Real connections in the real world
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover-elevate px-3 py-2" data-testid="link-footer-features">
              Features
            </a>
            <a href="#community" className="text-sm text-muted-foreground hover-elevate px-3 py-2" data-testid="link-footer-community">
              Community
            </a>
            <a href="#trust" className="text-sm text-muted-foreground hover-elevate px-3 py-2" data-testid="link-footer-trust">
              Trust & Safety
            </a>
            <a href="#" className="text-sm text-muted-foreground hover-elevate px-3 py-2 flex items-center gap-2" data-testid="link-footer-github">
              <SiGithub className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © {currentYear} Connect. Open source and community driven.
          </p>
        </div>
      </div>
    </footer>
  );
}
