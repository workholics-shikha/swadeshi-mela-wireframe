import { ActionList, Card, SimpleTable } from "./PageScaffold";

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <SimpleTable title="Recent notifications" headers={["Type", "Recipient", "Message", "Status"]} rows={[
          ["Payment reminder", "Meena Crafts", "Final balance due in 3 days", "Sent"],
          ["KYC follow-up", "Rajan Food Corner", "Bank proof still required", "Pending"],
          ["Event update", "All vendors", "Reporting schedule published", "Sent"],
        ]} />
        <Card title="Escalations" subtitle="Items requiring immediate attention.">
          <ActionList actions={[
            "2 vendors have not responded to payment reminders in 48 hours.",
            "Zone C power setup confirmation overdue by 1 day.",
            "Premium stall lock expiring for 3 vendors tomorrow.",
          ]} />
        </Card>
      </div>
    </div>
  );
}
