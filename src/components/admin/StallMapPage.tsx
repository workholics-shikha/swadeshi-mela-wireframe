import { useState } from "react";
import { Card, InfoList } from "./PageScaffold";

type StallStatus = "Booked" | "Free" | "Pending";
type StallView = { stall: string; status: StallStatus };
type ZoneSummary = [string, string];
type EventStallData = {
  zoneTitle: string;
  zoneSubtitle: string;
  zoneProgressPercent: number;
  stalls: StallView[];
  zoneSummary: ZoneSummary[];
};

const eventOptions = [
  { id: "2026-main", label: "Swadeshi Mela 2026 - Main Ground" },
  { id: "2026-winter", label: "Swadeshi Mela 2026 - Winter Edition" },
  { id: "2025", label: "Swadeshi Mela 2025 - City Expo" },
] as const;

const eventStallData: Record<(typeof eventOptions)[number]["id"], EventStallData> = {
  "2026-main": {
    zoneTitle: "Zone A - Textile",
    zoneSubtitle: "49 of 60 stalls booked.",
    zoneProgressPercent: 82,
    stalls: [
      { stall: "A-01", status: "Booked" },
      { stall: "A-02", status: "Booked" },
      { stall: "A-03", status: "Free" },
      { stall: "A-04", status: "Booked" },
      { stall: "A-05", status: "Booked" },
      { stall: "A-06", status: "Pending" },
      { stall: "A-07", status: "Booked" },
      { stall: "A-08", status: "Booked" },
      { stall: "A-09", status: "Free" },
      { stall: "A-10", status: "Booked" },
    ],
    zoneSummary: [
      ["Zone A - Textile", "49 / 60 booked"],
      ["Zone B - Handicraft", "38 / 55 booked"],
      ["Zone C - Food", "52 / 65 booked"],
      ["Zone D - Electronics", "39 / 60 booked"],
    ],
  },
  "2026-winter": {
    zoneTitle: "Zone B - Handicraft",
    zoneSubtitle: "42 of 50 stalls booked.",
    zoneProgressPercent: 84,
    stalls: [
      { stall: "B-01", status: "Booked" },
      { stall: "B-02", status: "Booked" },
      { stall: "B-03", status: "Booked" },
      { stall: "B-04", status: "Pending" },
      { stall: "B-05", status: "Free" },
      { stall: "B-06", status: "Booked" },
      { stall: "B-07", status: "Booked" },
      { stall: "B-08", status: "Free" },
      { stall: "B-09", status: "Booked" },
      { stall: "B-10", status: "Booked" },
    ],
    zoneSummary: [
      ["Zone A - Textile", "35 / 45 booked"],
      ["Zone B - Handicraft", "42 / 50 booked"],
      ["Zone C - Food", "31 / 40 booked"],
      ["Zone D - Electronics", "27 / 35 booked"],
    ],
  },
  "2025": {
    zoneTitle: "Zone C - Food",
    zoneSubtitle: "56 of 70 stalls booked.",
    zoneProgressPercent: 80,
    stalls: [
      { stall: "C-01", status: "Booked" },
      { stall: "C-02", status: "Booked" },
      { stall: "C-03", status: "Pending" },
      { stall: "C-04", status: "Booked" },
      { stall: "C-05", status: "Free" },
      { stall: "C-06", status: "Booked" },
      { stall: "C-07", status: "Booked" },
      { stall: "C-08", status: "Booked" },
      { stall: "C-09", status: "Free" },
      { stall: "C-10", status: "Booked" },
    ],
    zoneSummary: [
      ["Zone A - Textile", "44 / 58 booked"],
      ["Zone B - Handicraft", "36 / 52 booked"],
      ["Zone C - Food", "56 / 70 booked"],
      ["Zone D - Electronics", "33 / 48 booked"],
    ],
  },
};

const statusClassMap: Record<StallStatus, string> = {
  Booked: "bg-emerald-100 text-emerald-700",
  Free: "bg-sky-100 text-sky-700",
  Pending: "bg-amber-100 text-amber-700",
};

export function StallMapPage() {
  const [selectedEventId, setSelectedEventId] = useState<(typeof eventOptions)[number]["id"]>(eventOptions[0].id);
  const selectedEventData = eventStallData[selectedEventId];

  function handleEventChange(eventId: (typeof eventOptions)[number]["id"]) {
    setSelectedEventId(eventId);
  }

  return (
    <div className="space-y-6">
      <Card title="Event selection" subtitle="Choose an event to view its stall allocation details.">
        <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-event-select">
          Event
        </label>
        <select
          className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          id="stall-event-select"
          onChange={(event) => handleEventChange(event.target.value as (typeof eventOptions)[number]["id"])}
          value={selectedEventId}
        >
          {eventOptions.map((eventOption) => (
            <option key={eventOption.id} value={eventOption.id}>
              {eventOption.label}
            </option>
          ))}
        </select>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card title={selectedEventData.zoneTitle} subtitle={selectedEventData.zoneSubtitle}>
          <div className="mb-5 rounded-full bg-[var(--shell-bg)] p-1">
            <div className="h-3 rounded-full bg-[var(--brand)]" style={{ width: `${selectedEventData.zoneProgressPercent}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {selectedEventData.stalls.map(({ stall, status }) => (
              <div className={`rounded-[20px] p-4 text-center ${statusClassMap[status]}`} key={stall}>
                <p className="text-lg font-semibold">{stall}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em]">{status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Zone Summary" subtitle="Current allocation by zone.">
          <InfoList items={selectedEventData.zoneSummary} />
        </Card>
      </div>
    </div>
  );
}
