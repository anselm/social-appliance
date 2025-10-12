import { MapPin, Users, Shield } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Hyper-Local Discovery",
    description: "Find hidden gems, events, and activities happening right in your neighborhood. Connect with your community, not the whole world."
  },
  {
    icon: Users,
    title: "Group Connections",
    description: "Join groups around shared interests and passions. Meet people who love what you love, and do it together in real life."
  },
  {
    icon: Shield,
    title: "Trust-Based Safety",
    description: "Built on social trust graphs and decentralized identity. Your community vouches for you, filtering out bad actors naturally."
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight" data-testid="text-features-title">
            Built for Real Connection
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-subtitle">
            Everything you need to discover, connect, and thrive in your local community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background p-8 border border-border" data-testid={`card-feature-${index}`}>
              <feature.icon className="w-12 h-12 mb-6" data-testid={`icon-feature-${index}`} />
              <h3 className="text-2xl font-bold mb-4" data-testid={`text-feature-title-${index}`}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid={`text-feature-description-${index}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
