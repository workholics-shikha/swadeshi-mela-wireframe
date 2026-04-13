import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Navigation } from "lucide-react";
import { getEvents, type EventItem } from "@/lib/domainApi";

const EventDetailsSection = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  return (
    <section id="event" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Event Info</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
            Event Details
          </h2>
        </div>

        <div className="space-y-8">
          {events.map((event) => (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" key={event._id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}` },
                  { icon: Clock, label: "Time", value: `${event.openingTime} - ${event.closingTime}` },
                  { icon: MapPin, label: "Venue", value: event.venueName },
                  { icon: Navigation, label: "Category", value: event.category?.name || "-" },
                ].map((d, i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <d.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{d.label}</p>
                    <p className="font-display text-lg font-semibold text-foreground">{d.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden shadow-card bg-muted min-h-[300px] p-6">
                <h3 className="font-display text-2xl font-semibold text-foreground">{event.title}</h3>
                <p className="mt-3 text-muted-foreground">{event.description}</p>
                <p className="mt-3 text-sm text-muted-foreground">{event.fullAddress}, {event.city}, {event.state} - {event.pincode}</p>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Zones</p>
                  <div className="flex flex-wrap gap-2">
                    {(event.zones || []).length ? (event.zones || []).map((zone) => (
                      <span key={zone._id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{zone.zoneName}</span>
                    )) : <span className="text-sm text-muted-foreground">No zones configured</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
