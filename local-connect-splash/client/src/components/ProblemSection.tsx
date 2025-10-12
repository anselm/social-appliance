export default function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 tracking-tight" data-testid="text-problem-title">
            The Digital Disconnect
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6" data-testid="text-problem-description">
            Social media promised to bring us together, but instead created isolated digital bubbles. We spend hours scrolling, yet feel more disconnected than ever from our local communities.
          </p>
          <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium" data-testid="text-solution-description">
            It's time to reclaim real-world connections. To discover the hidden gems in your neighborhood. To meet people who share your passions—face to face, not just screen to screen.
          </p>
        </div>
      </div>
    </section>
  );
}
