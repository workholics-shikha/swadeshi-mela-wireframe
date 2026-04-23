import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents, getZones, type EventItem, type ZoneItem } from "@/lib/domainApi";

type StallCategoryCard = {
  key: string;
  name: string;
  price: number;
  zone: string;
  size: string;
  stalls: number;
  color: string;
};

const cardColors = [
  "bg-primary/10 text-primary",
  "bg-secondary/10 text-secondary",
  "bg-accent/10 text-accent",
];

function shuffleItems<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function getFeaturedEvent(events: EventItem[]) {
  if (!events.length) return null;

  const today = new Date();
  const upcomingBookableEvent = events.find(
    (event) =>
      event.status === "active" &&
      event.bookingEnabled &&
      new Date(event.endDate) >= today,
  );

  if (upcomingBookableEvent) return upcomingBookableEvent;

  return events.find((event) => event.status === "active") || events[0];
}

function extractZoneSize(zone?: ZoneItem) {
  const zoneText = `${zone?.zoneName || ""} ${zone?.description || ""}`;
  const match = zoneText.match(/(\d+)\s*[xX]\s*(\d+)/);

  if (!match) return "Standard";

  return `${match[1]} x ${match[2]}`;
}

const StallCategoriesSection = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zoneMasters, setZoneMasters] = useState<ZoneItem[]>([]);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]));

    getZones()
      .then((rows) => setZoneMasters(rows.filter((zone) => zone.status === "active")))
      .catch(() => setZoneMasters([]));
  }, []);

  const featuredEvent = useMemo(() => getFeaturedEvent(events), [events]);

  const categories = useMemo(() => {
    if (!featuredEvent?.categoryZoneMappings?.length) return [];

    const zoneMap = new Map(zoneMasters.map((zone) => [zone._id.toString(), zone]));

    const mappedCards: StallCategoryCard[] = featuredEvent.categoryZoneMappings
      .map((mapping) => {
        const zone = mapping.zoneId ? zoneMap.get(mapping.zoneId.toString()) : undefined;

        return {
          key: `${mapping.categoryName}-${mapping.zoneId || "no-zone"}`,
          name: mapping.categoryName?.trim() || "Unnamed Category",
          price: Number(mapping.amount) || 0,
          zone: zone?.zoneName || "Zone not mapped",
          size: extractZoneSize(zone),
          stalls: Number(mapping.stalls) || 0,
          color: "",
        };
      })
      .filter((item) => item.name);

    return shuffleItems(mappedCards)
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        color: cardColors[index % cardColors.length],
      }));
  }, [featuredEvent, zoneMasters]);

  return (
    <section id="stalls" className="py-20 md:py-28 bg-festive-pattern">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Stall Categories</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Choose Your Stall
          </h2>
          <p className="text-muted-foreground">
            Explore featured stall categories from the current event with live pricing, zones, and capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length ? categories.map((category) => (
            <div key={category.key} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all hover:-translate-y-1">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${category.color}`}>
                {category.stalls} stall{category.stalls === 1 ? "" : "s"}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{category.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-gradient-festive">Rs {category.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ stall</span>
              </div>
              <div className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <p>Zone: {category.zone}</p>
                <p>Size: {category.size}</p>
                <div className="flex items-center justify-between pt-2">
                  <span>Count: {category.stalls}</span>
                  <Link to="/book-stall" className="text-primary font-semibold hover:underline">
                    {"Book Now ->"}
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-card rounded-2xl p-8 shadow-card text-center text-muted-foreground">
              No stall category mappings are available for the current event yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StallCategoriesSection;
