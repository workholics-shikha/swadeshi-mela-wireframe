import { useEffect, useMemo, useState } from "react";
import { Card, ActionList, SimpleTable, StatsRow } from "./PageScaffold";
import { getBookings, getEvents, type BookingItem, type EventItem } from "@/lib/domainApi";
import type { UserRole } from "./types";

type DashboardPageProps = { userRole: UserRole };

function deriveAmount(stallSize: string | undefined, quantity: number): number {
  const prices: Record<string, number> = {
    small: 6000,
    medium: 7500,
    large: 8500,
    s: 6000,
    m: 7500,
    l: 8500,
  };
  const sizeKey = (stallSize || "medium").toLowerCase() as keyof typeof prices;
  return (prices[sizeKey] || 7000) * quantity;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCollectedAmount(booking: BookingItem): number {
  if (typeof booking.paymentAmount === "number" && booking.paymentAmount > 0) {
    return booking.paymentAmount;
  }

  if (booking.status === "approved") {
    return deriveAmount(booking.stallSize, Number(booking.quantity || 1));
  }

  return 0;
}

function getBookingAmount(booking: BookingItem): number {
  if (typeof booking.finalAmount === "number" && booking.finalAmount > 0) {
    return booking.finalAmount;
  }

  if (typeof booking.paymentAmount === "number" && booking.paymentAmount > 0) {
    return booking.paymentAmount;
  }

  return deriveAmount(booking.stallSize, Number(booking.quantity || 1));
}

function getPaidAmount(booking: BookingItem): number {
  if (typeof booking.paymentAmount === "number" && booking.paymentAmount > 0) {
    return booking.paymentAmount;
  }

  if (booking.status === "approved") {
    return getBookingAmount(booking);
  }

  return 0;
}

export function DashboardPage({ userRole }: DashboardPageProps) {
  const isAdmin = userRole === "Admin";

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Admin Stats (moved inside component)
  const adminStats = useMemo(() => {
    const totalStalls = events.reduce((sum, event) => {
      const eventTotal = Number(event.totalStalls || 0);
      if (eventTotal > 0) {
        return sum + eventTotal;
      }

      const mappedTotal = (event.categoryZoneMappings || []).reduce(
        (mappingSum, mapping) => mappingSum + Number(mapping.stalls || 0),
        0,
      );

      return sum + mappedTotal;
    }, 0);

    const bookedStalls = bookings
      .filter((b) => b.status !== "rejected")
      .reduce((sum, b) => sum + Number(b.quantity || 1), 0);

    const revenue = bookings
      .filter((b) => b.status !== "rejected")
      .reduce((sum, b) => sum + getCollectedAmount(b), 0);

    return [
      ["Total Stalls", totalStalls.toLocaleString()],
      ["Booked", bookedStalls.toLocaleString()],
      ["Revenue Collected", `Rs ${revenue.toLocaleString()}`],
    ] as [string, string][];
  }, [bookings, events]);

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

  const recentActivity = useMemo(() => {
    if (loading) return ["Loading recent activity..."];

    return bookings.slice(0, 5).map((b) => {
      const statusText = capitalize(b.status);
      const paidAmount = getPaidAmount(b).toLocaleString();
      const zoneText = b.zone?.zoneName || "-";
      const categoryText = b.category?.name || "-";

      return `${b.vendorName} ${statusText.toLowerCase()} booking ${b._id
        .slice(-6)
        .toUpperCase()} in ${zoneText} for ${categoryText} with paid amount Rs ${paidAmount}.`;
    });
  }, [bookings, loading]);

  const recentBookings = useMemo(() => {
    if (loading) return [];

    return bookings.slice(0, 10).map((b) => [
      b._id.slice(-6).toUpperCase(),
      b.vendorName, 
      b.category?.name || "-",
      `Rs ${getPaidAmount(b).toLocaleString()}`,
      capitalize(b.status),
    ]);
  }, [bookings, loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [bookingData, eventData] = await Promise.all([
          getBookings(),
          getEvents(), // 👈 ADD HERE
        ]);

        setBookings(bookingData);
        setEvents(eventData); // 👈 ADD THIS
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setBookings([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <StatsRow stats={isAdmin ? adminStats : vendorStats} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <SimpleTable
          title="Recent Bookings"
          headers={["Booking ID", "Vendor", "Category", "Paid Amount", "Status"]}
          rows={recentBookings}
        />

        <Card
          title={isAdmin ? "Recent Activity" : "Vendor Updates"}
          subtitle="Latest platform actions and alerts."
        >
          <ActionList
            actions={isAdmin ? recentActivity : vendorActivity}
          />
        </Card>
      </div>
    </div>
  );
}
