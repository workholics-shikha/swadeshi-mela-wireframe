import { ActionList, Card } from "./PageScaffold";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Approval Rules" subtitle="Controls inspired by the event setup wireframe.">
          <ActionList actions={["Allow multiple stalls per vendor.","Auto-approve verified vendors after KYC validation.","Require deposit for premium zones before confirmation."]} />
        </Card>
        <Card title="Portal Preferences" subtitle="General system controls for the admin panel.">
          <ActionList actions={["Keep vendor onboarding available during active registration dates.","Send payment reminders every 24 hours for pending bookings.","Lock stalls after 30 minutes of checkout inactivity."]} />
        </Card>
      </div>
    </div>
  );
}
