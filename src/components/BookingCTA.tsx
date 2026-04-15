import { Link } from "react-router-dom";

const BookingCTA = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-95" />
    <div className="container relative z-10 text-center">
      <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
        Don't Miss Out — Book Your Stall Today!
      </h2>
      <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
        Limited stalls available. Early bird discounts ending soon. Secure your spot at India's biggest Swadeshi fair.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/book-stall"
          className="px-8 py-4 rounded-lg bg-card text-foreground font-bold text-base hover:bg-card/90 transition-colors"
        >
          Book a Stall Now
        </Link>
        <a
          href="tel:+911234567890"
          className="px-8 py-4 rounded-lg border-2 border-primary-foreground/60 text-primary-foreground font-bold text-base hover:bg-primary-foreground/10 transition-colors"
        >
          Call: +91 12345 67890
        </a>
      </div>
    </div>
  </section>
);

export default BookingCTA;
