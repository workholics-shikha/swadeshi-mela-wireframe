import { useEffect, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import { getEvents, getZones, type EventItem, type ZoneItem } from "@/lib/domainApi";

type StallStatus = "Booked" | "Free" | "Pending";
type StallView = { stall: string; status: StallStatus };
type ZoneSummary = [string, string];

const statusClassMap: Record<StallStatus, string> = {
  Booked: "bg-emerald-100 text-emerald-700",
  Free: "bg-sky-100 text-sky-700",
  Pending: "bg-amber-100 text-amber-700",
};

// Generate mock stalls for demonstration (in real app, this would come from API)
function generateStalls(zoneName: string, count: number): StallView[] {
  const stalls: StallView[] = [];
  const prefix = zoneName.charAt(0).toUpperCase();
  const statuses: StallStatus[] = ["Booked", "Free", "Pending"];
  
  for (let i = 1; i <= count; i++) {
    // Mix different naming patterns for variety
    const pattern = i % 3;
    let stallName: string;
    
    if (pattern === 0) {
      // Pattern: "A-1", "B-2", etc.
      stallName = `${prefix}-${i}`;
    } else if (pattern === 1) {
      // Pattern: "Zone A", "Zone B", etc.
      stallName = `Zone ${prefix}-${i}`;
    } else {
      // Pattern: "A-1", "A-2", etc. (simple)
      stallName = `${prefix}-${i}`;
    }
    
    // Random status with weighted probability (more booked than free/pending)
    const rand = Math.random();
    const status = rand < 0.6 ? "Booked" : rand < 0.85 ? "Free" : "Pending";
    stalls.push({ stall: stallName, status });
  }
  return stalls;
}

export function StallMapPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stalls, setStalls] = useState<StallView[]>([]);
  const [zoneSummary, setZoneSummary] = useState<ZoneSummary[]>([]);

  // Fetch events on mount
  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0]._id);
        }
      })
      .catch(() => setEvents([]));
  }, []);

  // Fetch zones when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setZones([]);
      setSelectedZoneId("");
      setStalls([]);
      setZoneSummary([]);
      return;
    }

    setLoading(true);
    getZones(selectedEventId)
      .then((data) => {
        setZones(data);
        if (data.length > 0) {
          setSelectedZoneId(data[0]._id);
        } else {
          setSelectedZoneId("");
          setStalls([]);
          setZoneSummary([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setZones([]);
        setSelectedZoneId("");
        setStalls([]);
        setZoneSummary([]);
        setLoading(false);
      });
  }, [selectedEventId]);

  // Load stalls when zone changes
  useEffect(() => {
    if (!selectedZoneId || !zones.length) {
      setStalls([]);
      return;
    }

    const zone = zones.find((z) => z._id === selectedZoneId);
    if (zone) {
      // Generate stalls based on zone (mock data - in real app, fetch from API)
      const stallCount = 10 + Math.floor(Math.random() * 15); // 10-25 stalls
      const generatedStalls = generateStalls(zone.zoneName, stallCount);
      setStalls(generatedStalls);

      // Calculate zone summary
      const booked = generatedStalls.filter((s) => s.status === "Booked").length;
      const summary: ZoneSummary[] = [[`${zone.zoneName}`, `${booked} / ${stallCount} booked`]];
      
      // Add other zones to summary
      zones.forEach((z) => {
        if (z._id !== selectedZoneId) {
          const otherCount = 10 + Math.floor(Math.random() * 15);
          const otherBooked = Math.floor(otherCount * 0.7);
          summary.push([z.zoneName, `${otherBooked} / ${otherCount} booked`]);
        }
      });
      
      setZoneSummary(summary);
    }
  }, [selectedZoneId, zones]);

  const selectedZone = zones.find((z) => z._id === selectedZoneId);
  const bookedCount = stalls.filter((s) => s.status === "Booked").length;
  const progressPercent = stalls.length > 0 ? Math.round((bookedCount / stalls.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <Card title="Event selection" subtitle="Choose an event to view its stall allocation details.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-event-select">
              Event
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="stall-event-select"
              onChange={(e) => setSelectedEventId(e.target.value)}
              value={selectedEventId}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Zone Selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-zone-select">
              Zone
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="stall-zone-select"
              disabled={!zones.length || loading}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              value={selectedZoneId}
            >
              <option value="">Select a zone</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.zoneName}
                </option>
              ))}
            </select>
            {loading && <p className="mt-2 text-sm text-[var(--text-soft)]">Loading zones...</p>}
          </div>
        </div>
      </Card>

      {/* Stall Grid and Zone Summary */}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        {/* Stall Grid */}
        <Card 
          title={selectedZone ? selectedZone.zoneName : "Select a Zone"} 
          subtitle={selectedZone ? `${bookedCount} of ${stalls.length} stalls booked.` : "Choose an event and zone to view stalls."}
        >
          {stalls.length > 0 ? (
            <>
              <div className="mb-5 rounded-full bg-[var(--shell-bg)] p-1">
                <div 
                  className="h-3 rounded-full bg-[var(--brand)]" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {stalls.map(({ stall, status }) => (
                  <div 
                    className={`rounded-[20px] p-4 text-center transition hover:scale-105 cursor-pointer ${statusClassMap[status]}`} 
                    key={stall}
                    title={`Stall ${stall}: ${status}`}
                  >
                    <p className="text-lg font-semibold">{stall}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]">{status}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-soft)]">
                {!selectedEventId 
                  ? "Please select an event to view zones and stalls." 
                  : !selectedZoneId 
                    ? "Please select a zone to view its stalls." 
                    : "No stalls available for this zone."}
              </p>
            </div>
          )}
        </Card>

        {/* Zone Summary */}
        <Card title="Zone Summary" subtitle="Current allocation by zone.">
          {zoneSummary.length > 0 ? (
            <InfoList items={zoneSummary} />
          ) : (
            <p className="text-sm text-[var(--text-soft)]">Select an event to see zone summary.</p>
          )}
        </Card>
      </div>

      {/* Legend */}
      <Card title="Legend" subtitle="Stall status indicators.">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-100" />
            <span className="text-sm text-[var(--text-main)]">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-100" />
            <span className="text-sm text-[var(--text-main)]">Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-100" />
            <span className="text-sm text-[var(--text-main)]">Pending</span>
          </div>
        </div>
      </Card>
    </div>
  );
}