import { Plus } from "lucide-react";
import { Card, InfoList, JumpButton, SimpleTable } from "./PageScaffold";
import type { SetPage } from "./types";

const eventListRows = [
  ["Swadeshi Mela - Indore 2026", "14 May 2026", "Draft", "240 stalls"],
  ["Winter Craft Bazaar 2025", "12 Dec 2025", "Published", "120 stalls"],
  ["National Food Utsav 2026", "21 Jun 2026", "Scheduled", "90 stalls"],
];

export function EventListPage({ setPage }: { setPage: SetPage }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <SimpleTable
          title="Event List"
          headers={["Event", "Start Date", "Status", "Capacity"]}
          rows={eventListRows}
        />

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
            ["Draft events", "1"],
            ["Published events", "1"],
            ["Scheduled events", "1"],
            ["Next opening", "Swadeshi Mela - Indore 2026"],
          ]}
        />
      </Card>
    </div>
  );
}
