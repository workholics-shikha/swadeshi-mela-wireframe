import { Calendar, MapPin, Clock, Navigation } from "lucide-react";

const details = [
  { icon: Calendar, label: "Date", value: "15 – 22 January 2026" },
  { icon: Clock, label: "Timing", value: "10:00 AM – 9:00 PM Daily" },
  { icon: MapPin, label: "Venue", value: "Pragati Maidan, New Delhi" },
  { icon: Navigation, label: "How to Reach", value: "Metro: Supreme Court / Pragati Maidan Station" },
];

const EventDetailsSection = () => (
  <section id="event" className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Event Info</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
          Event Details
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {details.map((d, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <d.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{d.label}</p>
              <p className="font-display text-lg font-semibold text-foreground">{d.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card bg-muted min-h-[300px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0!2d77.2380!3d28.6180!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2daa9eb4d0b%3A0x717971125923e5d!2sPragati%20Maidan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 300 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Map"
          />
        </div>
      </div>
    </div>
  </section>
);

export default EventDetailsSection;
