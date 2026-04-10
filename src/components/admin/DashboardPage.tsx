import { Card, ActionList, PageHero, SimpleTable, StatsRow } from "./PageScaffold";
import type { UserRole } from "./types";

type DashboardPageProps = { userRole: UserRole };

const adminStats: [string, string][] = [
  ["Total Stalls", "240"],
  ["Booked", "178"],
  ["Revenue Collected", "Rs 8.4L"],
];

const vendorStats: [string, string][] = [
  ["Allocated Stalls", "2"],
  ["Amount Paid", "Rs 19,200"],
  ["Profile Completion", "82%"],
];

const adminActivity = [
  "Stall B-14 payment confirmed for Rs 6,000.",
  "Rajan Food Corner booking is pending payment confirmation.",
  "Zone C layout was updated for improved queue flow.",
  "Handloom Heritage vendor registration was approved.",
];

const vendorActivity = [
  "Your Zone A stall reservation remains active until final balance payment.",
  "Bank proof is still required to complete verification.",
  "Public directory draft was refreshed with your product summary.",
  "Organizer shared the vendor reporting schedule for opening day.",
];

const adminBookings = [
  ["BK-2025-0841", "Meena Crafts Pvt Ltd", "Zone A", "Rs 8,500", "Confirmed"],
  ["BK-2025-0840", "Rajan Food Corner", "Zone C", "Rs 6,000", "Pending"],
  ["BK-2025-0838", "Handloom Heritage", "Zone B", "Rs 7,500", "Confirmed"],
];

export function DashboardPage({ userRole }: DashboardPageProps) {
  const isAdmin = userRole === "Admin";
  return (
    <div className="space-y-6">
      <PageHero
        title={isAdmin ? "Executive Overview" : "Business Snapshot"}
        description={isAdmin ? "A fast read on occupancy, revenue, approvals, and operational momentum across the mela." : "Track your stalls, application status, payments, and visibility before the mela opens."}
        actions={isAdmin ? ["View reports", "Manage vendors"] : ["View payments", "My bookings"]}
      />
      <StatsRow stats={isAdmin ? adminStats : vendorStats} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <SimpleTable title="Recent Bookings" headers={["Booking ID", "Vendor", "Zone", "Amount", "Status"]} rows={adminBookings} />
        <Card title={isAdmin ? "Recent Activity" : "Vendor Updates"} subtitle="Latest platform actions and alerts.">
          <ActionList actions={isAdmin ? adminActivity : vendorActivity} />
        </Card>
      </div>
    </div>
  );
}
