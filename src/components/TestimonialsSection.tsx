import { Play } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Handicraft Vendor, Jaipur",
    quote: "Swadeshi Mela gave my small business a platform I could never afford otherwise. Sales were phenomenal!",
    videoId: "dQw4w9WgXcQ",
  },
  {
    name: "Rajesh Kumar",
    role: "Organic Food Startup, Lucknow",
    quote: "The footfall is incredible. We gained 500+ new customers in just 8 days.",
    videoId: "dQw4w9WgXcQ",
  },
  {
    name: "Anita Desai",
    role: "Textile Exporter, Surat",
    quote: "Great B2B networking. I signed 3 distribution deals during the mela.",
    videoId: "dQw4w9WgXcQ",
  },
];

const TestimonialsSection = () => (
  <section className="py-20 md:py-28 bg-festive-pattern">
    <div className="container">
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Testimonials</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
          Hear from Our Vendors
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <img
                src={`https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`}
                alt={`${t.name} testimonial`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-foreground/30 hover:bg-foreground/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-7 h-7 text-primary-foreground ml-1" />
                </div>
              </button>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm italic leading-relaxed mb-4">"{t.quote}"</p>
              <p className="font-display font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
