import { useEffect, useMemo, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import type { SetPage, UserRole } from "./types";
import { getBookings, allotBooking, type BookingItem } from "@/lib/domainApi";

export function BookingOperationsPage({ setPage, userRole }: { setPage: SetPage; userRole: UserRole }) {
  const isAdmin = userRole === "Admin";
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const selectedBookingRemainingAmount = selectedBooking
    ? Math.max(Number(selectedBooking.finalAmount || 0) - Number(selectedBooking.paymentAmount || 0), 0)
    : 0;

  const loadData = () => {
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (booking: BookingItem) => {
    if (!window.confirm("Are you sure you want to approve this booking?")) return;
    
    setLoading(true);
    try {
      await allotBooking(booking._id, { 
        status: "approved", 
        zone: booking.zone?._id || booking.allotment?.zone,
        stallNumber: booking.allotment?.stallNumber,
      });
      loadData();
      setSelectedBooking(null);
    } catch (error) {
      alert("Failed to approve booking");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    
    setLoading(true);
    try {
      await allotBooking(bookingId, { status: "rejected" });
      loadData();
      setSelectedBooking(null);
    } catch (error) {
      alert("Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
  };

  const getBookingZoneLabel = (booking: BookingItem) => {
    return booking.zone?.zoneName || booking.allotment?.zone || "Not selected";
  };

  const rows = useMemo(
    () =>
      bookings.map((b) => [
        b._id.slice(-6).toUpperCase(),
        `${b.vendorName} (${b.vendorEmail})`,
        b.event?.title || "-",
        b.category?.name || "-",
        String(b.quantity || 1),
        b.status,
      ]),
    [bookings],
  );

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{isAdmin ? "Booking Operations" : "My Bookings"}</p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {isAdmin ? "Manage all booking requests, approvals, and assignments." : "Track your booking status, allotment details, and payment progress."}
          </p>
        </div>
        {isAdmin ? (
          <button
            className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => setPage("booking-create")}
            type="button"
          >
            Add booking
          </button>
        ) : null}
      </section>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Card 
          title={`Booking Details - ${selectedBooking._id.slice(-6).toUpperCase()}`}
          subtitle="Complete booking information and vendor details."
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoList 
                items={[
                  ["Booking ID", selectedBooking._id],
                  ["Vendor Name", selectedBooking.vendorName],
                  ["Vendor Email", selectedBooking.vendorEmail],
                  ["Mobile", selectedBooking.mobile],
                  ["Business Name", selectedBooking.businessName],
                  ["Selected Zone", getBookingZoneLabel(selectedBooking)],
                  ["Stall Number", selectedBooking.allotment.stallNumber || "Not allotted"],
                ]} 
              />
              <InfoList 
                items={[
                  ["Event", selectedBooking.event?.title || "-"],
                  ["Category", selectedBooking.category?.name || "-"],
                  ["Quantity", String(selectedBooking.quantity || 1)],
                  ["Status", selectedBooking.status],
                  ["Final Amount", `Rs ${Number(selectedBooking.finalAmount || 0).toLocaleString()}`],
                  ["Paid Amount", `Rs ${Number(selectedBooking.paymentAmount || 0).toLocaleString()}`],
                  ["Remaining Amount", selectedBookingRemainingAmount > 0 ? `Rs ${selectedBookingRemainingAmount.toLocaleString()}` : "Fully paid"],
                ]} 
              />
            </div>
             
            <div className="flex flex-wrap gap-3">
              {isAdmin ? (
                <>
                  <button
                    className="rounded-full bg-[linear-gradient(135deg,hsl(var(--green-india)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    onClick={() => handleApprove(selectedBooking)}
                    disabled={loading || selectedBooking.status === "approved"}
                    type="button"
                  >
                    {selectedBooking.status === "approved" ? "Already Approved" : "Approve"}
                  </button>
                  <button
                    className="rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent)] disabled:opacity-50"
                    onClick={() => handleReject(selectedBooking._id)}
                    disabled={loading || selectedBooking.status === "rejected"}
                    type="button"
                  >
                    {selectedBooking.status === "rejected" ? "Already Rejected" : "Reject Booking"}
                  </button>
                </>
              ) : null}
              <button
                className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--text-soft)]"
                onClick={() => setSelectedBooking(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </Card>
      )}

      <section className="bg-admin-panel overflow-hidden rounded-[24px] border border-[color:var(--border-soft)]">
        <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Recent booking requests</h3>
        </div>
        
        {/* Mobile View */}
        <div className="grid gap-3 p-4 md:hidden">
          {bookings.map((b) => (
            <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={b._id}>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Booking ID</span>
                <span className="text-right text-sm font-medium text-[var(--text-main)]">{b._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Vendor</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{b.vendorName} ({b.vendorEmail})</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Event</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{b.event?.title || "-"}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Category</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{b.category?.name || "-"}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{b.status}</span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => handleViewDetails(b)}
                  type="button"
                >
                  View Details
                </button>
                {isAdmin && b.status === "pending" && (
                  <>
                    <button
                      className="rounded-full border border-[rgba(79,133,78,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--green-india)] disabled:opacity-50"
                      onClick={() => handleApprove(b)}
                      disabled={loading}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="rounded-full border border-[rgba(136,38,63,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)] disabled:opacity-50"
                      onClick={() => handleReject(b._id)}
                      disabled={loading}
                      type="button"
                      >
                        Reject
                      </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left">
            <thead className="bg-[linear-gradient(90deg,rgba(217,106,20,0.12),rgba(79,133,78,0.08))] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Vendor details</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr className="border-t border-[color:var(--border-soft)]" key={b._id}>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{b._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.vendorName} ({b.vendorEmail})</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.event?.title || "-"}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.category?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.quantity || 1}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.status}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => handleViewDetails(b)}
                        type="button"
                      >
                        View
                      </button>
                      {isAdmin && b.status === "pending" && (
                        <>
                          <button
                            className="rounded-full border border-[rgba(79,133,78,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--green-india)] disabled:opacity-50"
                            onClick={() => handleApprove(b)}
                            disabled={loading}
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            className="rounded-full border border-[rgba(136,38,63,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)] disabled:opacity-50"
                            onClick={() => handleReject(b._id)}
                            disabled={loading}
                            type="button"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
