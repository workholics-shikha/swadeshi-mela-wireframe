import { useEffect, useMemo, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import type { SetPage } from "./types";
import { getBookings, allotBooking, getZones, type BookingItem, type ZoneItem } from "@/lib/domainApi";

export function BookingOperationsPage({ setPage }: { setPage: SetPage }) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStall, setSelectedStall] = useState("");

  const loadData = () => {
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  };

  // Load zones when booking is selected
  useEffect(() => {
    if (selectedBooking?.event?._id) {
      getZones(selectedBooking.event._id)
        .then(setZones)
        .catch(() => setZones([]));
    } else {
      setZones([]);
      setSelectedZone("");
      setSelectedStall("");
    }
  }, [selectedBooking?.event?._id]);

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to approve this booking?")) return;
    
    setLoading(true);
    try {
      await allotBooking(bookingId, { 
        status: "approved", 
        zone: selectedZone,
        stallNumber: selectedStall
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

  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId);
    setSelectedStall("");
  };

  // Generate mock stalls for demonstration
  const generateStallsForZone = (zoneName: string, count: number): string[] => {
    const stalls: string[] = [];
    const prefix = zoneName.charAt(0).toUpperCase();
    
    for (let i = 1; i <= count; i++) {
      // Mix different naming patterns for variety
      const pattern = i % 3;
      let stallName: string;
      
      if (pattern === 0) {
        // Pattern: "A-1", "B-2", etc.
        stallName = `${prefix}-${i}`;
      } else if (pattern === 1) {
        // Pattern: "Zone A", "Zone B", etc.
        stallName = `Zone ${prefix}-${i}`;
      } else {
        // Pattern: "A-1", "A-2", etc. (simple)
        stallName = `${prefix}-${i}`;
      }
      
      stalls.push(stallName);
    }
    return stalls;
  };

  const availableStalls = selectedZone 
    ? generateStallsForZone(
        zones.find(z => z._id === selectedZone)?.zoneName || "Z",
        10 + Math.floor(Math.random() * 10)
      )
    : [];

  const handleViewDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
  };

  const rows = useMemo(
    () =>
      bookings.map((b) => [
        b._id.slice(-6).toUpperCase(),
        `${b.vendorName} (${b.vendorEmail})`,
        b.event?.title || "-",
        b.category?.name || "-",
        b.stallSize || "-",
        String(b.quantity || 1),
        b.status,
      ]),
    [bookings],
  );

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Booking Operations</p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">Manage all booking requests, approvals, and assignments.</p>
        </div>
        <button
          className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => setPage("booking-create")}
          type="button"
        >
          Add booking
        </button>
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
                ]} 
              />
              <InfoList 
                items={[
                  ["Event", selectedBooking.event?.title || "-"],
                  ["Category", selectedBooking.category?.name || "-"],
                  ["Stall Size", selectedBooking.stallSize || "-"],
                  ["Quantity", String(selectedBooking.quantity || 1)],
                  ["Status", selectedBooking.status],
                ]} 
              />
            </div>
            
            {selectedBooking.allotment && (
              <InfoList 
                items={[
                  ["Allotted Zone", selectedBooking.allotment.zone || "Not allotted"],
                  ["Stall Number", selectedBooking.allotment.stallNumber || "Not allotted"],
                ]} 
              />
            )}

            {/* Zone and Stall Allocation */}
            {selectedBooking.status === "pending" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="allot-zone">
                    Select Zone
                  </label>
                  <select
                    className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    id="allot-zone"
                    onChange={(e) => handleZoneChange(e.target.value)}
                    value={selectedZone}
                  >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.zoneName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="allot-stall">
                    Select Stall
                  </label>
                  <select
                    className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    id="allot-stall"
                    onChange={(e) => setSelectedStall(e.target.value)}
                    value={selectedStall}
                    disabled={!selectedZone}
                  >
                    {!selectedZone ? (
                      <option value="">Select a zone first</option>
                    ) : (
                      availableStalls.map((stall) => (
                        <option key={stall} value={stall}>
                          {stall}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[linear-gradient(135deg,hsl(var(--green-india)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                onClick={() => handleApprove(selectedBooking._id)}
                disabled={loading || selectedBooking.status === "approved" || (selectedBooking.status === "pending" && (!selectedZone || !selectedStall))}
                type="button"
              >
                {selectedBooking.status === "approved" ? "Already Approved" : "Approve & Allot"}
              </button>
              <button
                className="rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent)] disabled:opacity-50"
                onClick={() => handleReject(selectedBooking._id)}
                disabled={loading || selectedBooking.status === "rejected"}
                type="button"
              >
                {selectedBooking.status === "rejected" ? "Already Rejected" : "Reject Booking"}
              </button>
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
                {b.status === "pending" && (
                  <>
                    <button
                      className="rounded-full border border-[rgba(79,133,78,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--green-india)] disabled:opacity-50"
                      onClick={() => handleApprove(b._id)}
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
                <th className="px-4 py-3 font-semibold">Stall Size</th>
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
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{b.stallSize || "-"}</td>
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
                      {b.status === "pending" && (
                        <>
                          <button
                            className="rounded-full border border-[rgba(79,133,78,0.35)] bg-white px-4 py-2 text-sm font-semibold text-[var(--green-india)] disabled:opacity-50"
                            onClick={() => handleApprove(b._id)}
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