import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-mela-1.jpg";
import hero2 from "@/assets/hero-mela-2.jpg";

const slides = [
  {
    image: hero1,
    title: "Swadeshi Mela 2026",
    subtitle: "India's Grandest Cultural & Trade Fair",
    cta1: { label: "Book a Stall", href: "/book-stall" },
    cta2: { label: "Explore Mela", href: "#about" },
  },
  {
    image: hero2,
    title: "Celebrate Indian Heritage",
    subtitle: "500+ Stalls · Handicrafts · Food · Culture · Commerce",
    cta1: { label: "Register Now", href: "/book-stall" },
    cta2: { label: "View Gallery", href: "#gallery" },
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative h-[85vh] md:h-screen overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
            width={1920}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/10" />
        </div>
      ))}

      <div className="relative z-10 container h-full flex flex-col justify-end pb-20 md:pb-32">
        <div className="max-w-2xl animate-slide-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold mb-4 tracking-wide uppercase">
            15–22 Jan 2026 · New Delhi
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-4 leading-tight">
            {slide.title}
          </h1>
          <p className="text-cream/80 text-lg md:text-xl mb-8 font-body">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={slide.cta1.href}
              className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {slide.cta1.label}
            </Link>
            <a
              href={slide.cta2.href}
              className="px-8 py-3.5 rounded-lg border-2 border-cream/60 text-cream font-semibold text-base hover:bg-cream/10 transition-colors"
            >
              {slide.cta2.label}
            </a>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-primary w-8" : "bg-cream/50"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
