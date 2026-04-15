const categories = [
  { name: "Handicrafts & Art", size: "9×9 ft", price: "₹15,000", available: 45, color: "bg-primary/10 text-primary" },
  { name: "Textiles & Clothing", size: "9×9 ft", price: "₹18,000", available: 30, color: "bg-secondary/10 text-secondary" },
  { name: "Food & Beverages", size: "12×12 ft", price: "₹25,000", available: 20, color: "bg-accent/10 text-accent" },
  { name: "Organic & Ayurveda", size: "9×9 ft", price: "₹16,000", available: 35, color: "bg-primary/10 text-primary" },
  { name: "Jewelry & Accessories", size: "6×6 ft", price: "₹12,000", available: 50, color: "bg-secondary/10 text-secondary" },
  { name: "Electronics & Startups", size: "12×12 ft", price: "₹30,000", available: 15, color: "bg-accent/10 text-accent" },
];

import { Link } from "react-router-dom";

const StallCategoriesSection = () => (
  <section id="stalls" className="py-20 md:py-28 bg-festive-pattern">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Stall Categories</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
          Choose Your Stall
        </h2>
        <p className="text-muted-foreground">Select from a variety of stall types and sizes to suit your business needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all hover:-translate-y-1">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${c.color}`}>
              {c.available} stalls available
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">{c.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-gradient-festive">{c.price}</span>
              <span className="text-sm text-muted-foreground">/ stall</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
              <span>Size: {c.size}</span>
              <Link to="/book-stall" className="text-primary font-semibold hover:underline">
                Book Now →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StallCategoriesSection;
