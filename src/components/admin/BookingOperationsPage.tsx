import { Card, ActionList, JumpButton, SimpleTable } from "./PageScaffold";
import type { SetPage } from "./types";

export function BookingOperationsPage({ setPage }: { setPage: SetPage }) {
  return (
    <div className="space-y-6">
      <section className="bg-admin-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Manual booking desk</p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">Create a booking form on behalf of vendor with full profile details.</p>
        </div>
        <button
          className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => setPage("booking-create")}
          type="button"
        >
          Add booking
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <Card title="Today's Queue" subtitle="Priority actions for the booking desk.">
          <ActionList actions={[
            "Confirm 3 bookings waiting on manual verification.",
            "Release 2 stale stall locks after 30-minute timeout.",
            "Follow up with Rajan Food Corner for pending payment.",
            "Reassign premium Zone A request for Meena Crafts.",
          ]} />
        </Card>
        <Card title="Quick Links" subtitle="Jump straight into connected workflows.">
          <div className="grid gap-3">
            <JumpButton label="Open stall map" onClick={() => setPage("stalls")} />
            <JumpButton label="Review payment flow" onClick={() => setPage("payments")} />
            <JumpButton label="Check approvals desk" onClick={() => setPage("approvals")} />
          </div>
        </Card>
      </div>
      <SimpleTable title="Recent booking requests" headers={["Booking ID", "Vendor", "Zone", "Amount", "Status"]} rows={[
        ["BK-2025-0845", "Meena Crafts Pvt Ltd", "Zone A", "Rs 25,460", "Pending payment"],
        ["BK-2025-0843", "Rajan Food Corner", "Zone C", "Rs 6,000", "Awaiting approval"],
        ["BK-2025-0839", "Handloom Heritage", "Zone B", "Rs 7,500", "Confirmed"],
      ]} />
    </div>
  );
}
