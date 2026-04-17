import { useEffect, useMemo, useState } from "react";
import { ActionList, Card, FormGrid, JumpButton, StatsRow } from "./PageScaffold";
import type { SetPage } from "./types";
import { getBookings, type BookingItem } from "@/lib/domainApi";
import { getCurrentUser } from "@/lib/auth";

export function VendorHubPage({ setPage }: { setPage: SetPage }) {
  const currentUser = getCurrentUser();
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== "rejected"),
    [bookings],
  );

  const totalPaid = useMemo(
    () => activeBookings.reduce((sum, booking) => sum + Number(booking.paymentAmount || 0), 0),
    [activeBookings],
  );

  const latestBooking = bookings[0];
  const profileFields: [string, string][] = [
    ["Vendor Name", currentUser?.name || latestBooking?.vendorName || "-"],
    ["Email", currentUser?.email || latestBooking?.vendorEmail || "-"],
    ["Mobile", latestBooking?.mobile || currentUser?.mobile || "-"],
    ["Business Name", latestBooking?.businessName || currentUser?.name || "-"],
    ["GSTIN", latestBooking?.gstNumber || "-"],
    ["City", latestBooking?.city || "-"],
  ];

  const vendorUpdates = activeBookings.length
    ? activeBookings.slice(0, 3).map((booking) => {
        const eventName = booking.event?.title || "your selected event";
        const zoneName = booking.zone?.zoneName || booking.allotment?.zone || "zone not assigned yet";
        return `${eventName}: ${booking.status} booking for ${booking.quantity} stall(s) in ${zoneName}.`;
      })
    : ["No bookings are linked to this vendor account yet."];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Vendor Dashboard Snapshot" subtitle="Live summary for the logged-in vendor account.">
          <StatsRow
            stats={[
              ["Allocated stalls", activeBookings.reduce((sum, booking) => sum + Number(booking.quantity || 1), 0).toLocaleString()],
              ["Amount paid", `Rs ${totalPaid.toLocaleString()}`],
              ["Bookings", bookings.length.toLocaleString()],
            ]}
          />
          <ActionList actions={vendorUpdates} />
        </Card>
        <Card title="Vendor Profile" subtitle="Profile and application details attached to this vendor account.">
          <FormGrid fields={profileFields} />
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <JumpButton label="Review my bookings" onClick={() => setPage("bookings")} />
        <JumpButton label="Open payment summary" onClick={() => setPage("payments")} />
        <JumpButton label="Refresh my profile view" onClick={() => setPage("vendors")} />
      </div>
    </div>
  );
}
