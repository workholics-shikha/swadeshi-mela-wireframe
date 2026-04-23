import { useEffect, useMemo, useState } from "react";
import { Card, ActionList, SimpleTable, StatsRow } from "./PageScaffold";
import { getBookings, getEvents, type BookingItem, type EventItem } from "@/lib/domainApi";
import type { UserRole } from "./types";
import { getCurrentUser } from "@/lib/auth";

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
  const currentUser = getCurrentUser();

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

    const totalPending =
      bookings.reduce(
        (sum, booking) => sum + Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0),
        0,
      );  

    return [
      ["Total Stalls", totalStalls.toLocaleString()],
      ["Booked", bookedStalls.toLocaleString()],
      ["Revenue Collected", `Rs ${revenue.toLocaleString()}`],
      ["Pending amount", `Rs ${totalPending.toLocaleString()}`],
    ] as [string, string][];
  }, [bookings, events]);

  const vendorStats = useMemo(() => {
    const activeBookings = bookings.filter((booking) => booking.status !== "rejected");
    const allocatedStalls = activeBookings.reduce((sum, booking) => sum + Number(booking.quantity || 1), 0);
    const amountPaid = activeBookings.reduce((sum, booking) => sum + getPaidAmount(booking), 0);
    const approvedBookings = activeBookings.filter((booking) => booking.status === "approved").length;
    const totalPending =
      activeBookings.reduce(
        (sum, booking) => sum + Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0),
        0,
      );

    return [
      ["Allocated Stalls", allocatedStalls.toLocaleString()],
      ["Amount Paid", `Rs ${amountPaid.toLocaleString()}`],
      ["Pending amount", `Rs ${totalPending.toLocaleString()}`],
      ["Approved Bookings", approvedBookings.toLocaleString()],
    ] as [string, string][];
  }, [bookings]);

  const vendorActivity = useMemo(() => {
    if (loading) return ["Loading your vendor updates..."];
    if (bookings.length === 0) {
      return ["No bookings found yet. Your updates will appear here after your first stall booking."];
    }

    return bookings.slice(0, 4).map((booking) => {
      const eventTitle = booking.event?.title || "your event";
      const categoryName = booking.category?.name || "selected category";
      const statusText = capitalize(booking.status);
      const paymentText = `Rs ${getPaidAmount(booking).toLocaleString()}`;
      return `${statusText} booking for ${eventTitle} in ${categoryName}. Paid so far: ${paymentText}.`;
    });
  }, [bookings, loading]);

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

    return isAdmin
      ? bookings.slice(0, 10).map((b) => [
        b._id.slice(-6).toUpperCase(),
        b.vendorName,
        b.category?.name || "-",
        `Rs ${getPaidAmount(b).toLocaleString()}`,
        capitalize(b.status),
      ])
      : bookings.slice(0, 10).map((b) => [
        b._id.slice(-6).toUpperCase(),
        b.event?.title || "-",
        b.zone?.zoneName || b.allotment?.zone || "-",
        `Rs ${getPaidAmount(b).toLocaleString()}`,
        capitalize(b.status),
      ]);
  }, [bookings, isAdmin, loading]);

  const tableHeaders = isAdmin
    ? ["Booking ID", "Vendor", "Category", "Paid Amount", "Status"]
    : ["Booking ID", "Event", "Zone", "Paid Amount", "Status"];

  const tableTitle = isAdmin ? "Recent Bookings" : `My Bookings${currentUser?.name ? ` for ${currentUser.name}` : ""}`;

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
          title={tableTitle}
          headers={tableHeaders}
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
