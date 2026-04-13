import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, InfoList, JumpButton } from "./PageScaffold";
import type { SetPage } from "./types";
import { deleteEvent, getEvents, type EventItem } from "@/lib/domainApi";

export function EventListPage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);

  async function load() {
    const data = await getEvents();
    setEvents(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="bg-admin-panel rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-6">
          <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Event List</h3>
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <div key={event._id} className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">{event.title}</p>
                    <p className="text-sm text-[var(--text-soft)]">
                      {new Date(event.startDate).toLocaleDateString()} - {event.venueName}
                    </p>
                    <p className="text-xs text-[var(--text-soft)]">
                      Category: {event.category?.name || "-"} | Status: {event.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-full border border-[color:var(--border-soft)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-soft)]"
                      onClick={() => {
                        localStorage.setItem("admin_selected_event_id", event._id);
                        setPage("event-details");
                      }}
                      type="button"
                    >
                      Details
                    </button>
                    <button
                      className="rounded-full border border-[color:var(--border-soft)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-soft)]"
                      onClick={() => {
                        localStorage.setItem("admin_selected_event_id", event._id);
                        setPage("event-edit");
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent)]"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${event.title}"?`)) return;
                        try {
                          await deleteEvent(event._id);
                          await load();
                        } catch (error) {
                          window.alert(error instanceof Error ? error.message : "Cannot delete event");
                        }
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card title="Event Actions" subtitle="Create a new mela event or continue work on an existing one.">
          <div className="grid gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-3 text-sm font-semibold text-white"
              onClick={() => setPage("event-create")}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create New Mela Event
            </button>
            <JumpButton label="Open draft event builder" onClick={() => setPage("event-create")} />
            <JumpButton label="Manage event categories" onClick={() => setPage("categories")} />
          </div>
        </Card>
      </div>

      <Card title="Event Summary" subtitle="Current visibility of active and upcoming mela events.">
        <InfoList
          items={[
            ["Total events", String(events.length)],
            ["Upcoming", String(events.filter((e) => new Date(e.startDate) >= new Date()).length)],
            ["Past events", String(events.filter((e) => new Date(e.startDate) < new Date()).length)],
            ["Next opening", events[0]?.title || "-"],
          ]}
        />
      </Card>
    </div>
  );
}
