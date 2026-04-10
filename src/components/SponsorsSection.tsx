const sponsors = [
  "Ministry of MSME",
  "Make in India",
  "FICCI",
  "CII",
  "KVIC",
  "India Post",
  "SBI",
  "NABARD",
];

const SponsorsSection = () => (
  <section className="py-16 bg-festive-pattern">
    <div className="container">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Our Partners</span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-3">
          Sponsors & Partners
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {sponsors.map((s, i) => (
          <div
            key={i}
            className="bg-card rounded-xl px-8 py-5 shadow-card flex items-center justify-center min-w-[160px]"
          >
            <span className="font-display text-sm font-semibold text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SponsorsSection;
