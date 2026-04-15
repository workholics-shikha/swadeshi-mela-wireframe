import { useEffect, useMemo, useState } from "react";
import { Card, ActionList, SimpleTable, StatsRow } from "./PageScaffold";
import { getBookings, type BookingItem } from "@/lib/domainApi";
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

const vendorActivity = [
  "Your Zone A stall reservation remains active until final balance payment.",
  "Bank proof is still required to complete verification.",
  "Public directory draft was refreshed with your product summary.",
  "Organizer shared the vendor reporting schedule for opening day.",
];

function deriveAmount(stallSize: string | undefined, quantity: number): number {
  const prices: Record<string, number> = { small: 6000, medium: 7500, large: 8500, s: 6000, m: 7500, l: 8500 };
  const sizeKey = (stallSize || 'medium').toLowerCase() as keyof typeof prices;
  return (prices[sizeKey] || 7000) * quantity;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DashboardPage({ userRole }: DashboardPageProps) {
  const isAdmin = userRole === "Admin";
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const recentActivity = useMemo(() => {
    if (loading) return ["Loading recent activity..."];
    return bookings.slice(0, 5).map((b) => {
      const statusText = capitalize(b.status);
      const amount = deriveAmount(b.stallSize, b.quantity || 1).toLocaleString();
      const zoneText = b.zone?.zoneName ? ` in ${b.zone.zoneName}` : '';
      return `${b.vendorName} ${statusText.toLowerCase()} booking ${b._id.slice(-6).toUpperCase()} for Rs ${amount}${zoneText}.`;
    });
  }, [bookings, loading]);

  const recentBookings = useMemo(() => {
    if (loading) return [];
    return bookings.slice(0, 10).map((b) => [
      b._id.slice(-6).toUpperCase(),
      b.vendorName,
      b.zone?.zoneName || '-',
      `Rs ${deriveAmount(b.stallSize, b.quantity || 1).toLocaleString()}`,
      capitalize(b.status)
    ]);
  }, [bookings, loading]);

  useEffect(() => {
    setLoading(true);
    getBookings()
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <StatsRow stats={isAdmin ? adminStats : vendorStats} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <SimpleTable title="Recent Bookings" headers={["Booking ID", "Vendor", "Zone", "Amount", "Status"]} rows={recentBookings} />
        <Card title={isAdmin ? "Recent Activity" : "Vendor Updates"} subtitle="Latest platform actions and alerts.">
          <ActionList actions={isAdmin ? recentActivity : vendorActivity} />
        </Card>
      </div>
    </div>
  );
}
