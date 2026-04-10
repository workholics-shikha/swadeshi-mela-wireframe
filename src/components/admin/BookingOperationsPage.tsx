import { Card, ActionList, JumpButton, SimpleTable } from "./PageScaffold";
import type { SetPage } from "./types";

export function BookingOperationsPage({ setPage }: { setPage: SetPage }) {
  return (
    <div className="space-y-6">
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
