import { Sparkles, Users, ShoppingBag, Globe } from "lucide-react";

const AboutSection = () => (
  <section id="about" className="py-20 md:py-28 bg-festive-pattern">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">About Us</span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-6">
          What is <span className="text-gradient-festive">Swadeshi Mela</span>?
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Swadeshi Mela is India's premier cultural and trade fair bringing together artisans, entrepreneurs,
          and consumers under one roof. We celebrate the spirit of "Make in India" by showcasing authentic
          Indian handicrafts, textiles, food, and innovation to thousands of visitors every year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Sparkles, title: "Cultural Heritage", desc: "Celebrating India's rich traditions through art, craft, and performance." },
          { icon: ShoppingBag, title: "Trade & Commerce", desc: "A marketplace connecting vendors with lakhs of eager buyers." },
          { icon: Users, title: "Community", desc: "Building bridges between artisans, MSMEs, and consumers." },
          { icon: Globe, title: "National Reach", desc: "Vendors and visitors from across all 28 states of India." },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow group"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <item.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
