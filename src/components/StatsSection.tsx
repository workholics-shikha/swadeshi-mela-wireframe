import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 250000, suffix: "+", label: "Visitors", icon: "👥" },
  { value: 500, suffix: "+", label: "Stalls", icon: "🏪" },
  { value: 8, suffix: " Days", label: "Duration", icon: "📅" },
  { value: 1200, suffix: "+", label: "Vendors", icon: "🤝" },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const StatCard = ({ value, suffix, label, icon, inView }: { value: number; suffix: string; label: string; icon: string; inView: boolean }) => {
  const count = useCountUp(value, 2000, inView);
  return (
    <div className="bg-card rounded-2xl p-8 shadow-card text-center">
      <span className="text-4xl mb-3 block">{icon}</span>
      <div className="font-display text-4xl md:text-5xl font-bold text-gradient-festive">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="mt-2 text-muted-foreground font-medium">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-background" ref={ref}>
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">By The Numbers</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
            Mela at a Glance
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
