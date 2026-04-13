import { useEffect, useMemo, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import type { SetPage } from "./types";
import { getEvents, type EventItem } from "@/lib/domainApi";

const SELECTED_EVENT_KEY = "admin_selected_event_id";

export function EventDetailsPage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    getEvents().then((rows) => {
      setEvents(rows);
      const saved = localStorage.getItem(SELECTED_EVENT_KEY) || "";
      setSelectedId(saved || rows[0]?._id || "");
    });
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedId) || events[0],
    [events, selectedId],
  );

  return (
    <div className="space-y-6">
      <Card title="Event Details" subtitle="View complete event information.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event</p>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)]"
              value={selectedEvent?._id || ""}
              onChange={(e) => {
                setSelectedId(e.target.value);
                localStorage.setItem(SELECTED_EVENT_KEY, e.target.value);
              }}
            >
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title={selectedEvent?.title || "Event"} subtitle="Summary and configuration">
        <InfoList
          items={[
            ["Category", selectedEvent?.category?.name || "-"],
            ["Date Range", selectedEvent ? `${new Date(selectedEvent.startDate).toLocaleDateString()} - ${new Date(selectedEvent.endDate).toLocaleDateString()}` : "-"],
            ["Timing", selectedEvent ? `${selectedEvent.openingTime} - ${selectedEvent.closingTime}` : "-"],
            ["Venue", selectedEvent?.venueName || "-"],
            ["Address", selectedEvent ? `${selectedEvent.fullAddress}, ${selectedEvent.city}, ${selectedEvent.state} - ${selectedEvent.pincode}` : "-"],
            ["Total Stalls", selectedEvent ? String(selectedEvent.totalStalls) : "-"],
            ["Booking Enabled", selectedEvent?.bookingEnabled ? "Yes" : "No"],
            ["Status", selectedEvent?.status || "-"],
          ]}
        />
        <div className="mt-5 flex gap-3">
          <button className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--text-soft)]" onClick={() => setPage("events")} type="button">
            Back to events
          </button>
          <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white" onClick={() => setPage("event-edit")} type="button">
            Edit event
          </button>
        </div>
      </Card>
    </div>
  );
}
