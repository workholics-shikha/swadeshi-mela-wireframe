import { TrendingUp, Eye, Handshake, Award, Megaphone, MapPin } from "lucide-react";

const benefits = [
  { icon: Eye, title: "Massive Footfall", desc: "Get your brand in front of 2.5 lakh+ visitors over 8 days." },
  { icon: TrendingUp, title: "Boost Sales", desc: "Direct sales opportunity with ready-to-buy customers." },
  { icon: Handshake, title: "B2B Networking", desc: "Connect with distributors, retailers, and wholesale buyers." },
  { icon: Award, title: "Brand Recognition", desc: "Establish credibility in the Swadeshi/Made-in-India ecosystem." },
  { icon: Megaphone, title: "Marketing Support", desc: "Free promotion through our social media & print campaigns." },
  { icon: MapPin, title: "Prime Location", desc: "Strategic venue with excellent connectivity & infrastructure." },
];

const BenefitsSection = () => (
  <section className="py-20 md:py-28 bg-festive-pattern">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Why Participate</span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
          Benefits of Joining <span className="text-gradient-festive">Swadeshi Mela</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Whether you're an artisan, startup, or established brand — there's a place for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
              <b.icon className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
