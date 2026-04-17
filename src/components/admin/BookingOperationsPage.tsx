import { useEffect, useMemo, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import type { SetPage, UserRole } from "./types";
import { getBookings, allotBooking, payBookingBalance, type BookingItem } from "@/lib/domainApi";
import { buildApiUrl } from "@/lib/apiConfig";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function BookingOperationsPage({ setPage, userRole }: { setPage: SetPage; userRole: UserRole }) {
  const isAdmin = userRole === "Admin";
  const pageSize = 10;
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [paymentDraft, setPaymentDraft] = useState({ amount: "", paymentRef: "", paymentType: "part-payment" });
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

  const validateBookingZoneCategory = (booking: BookingItem) => {
    const hasCategory = Boolean(booking.category?._id || booking.category?.name);
    const hasZone = Boolean(booking.zone?._id || booking.zone?.zoneName || booking.allotment?.zone);

    if (!hasCategory) {
      alert("Category is required before proceeding.");
      return false;
    }

    if (!hasZone) {
      alert("Zone is required before proceeding.");
      return false;
    }

    return true;
  };

  const handleApprove = async (booking: BookingItem) => {
    if (!validateBookingZoneCategory(booking)) return;
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
    setPaymentDraft({ amount: "", paymentRef: "", paymentType: "part-payment" });
    setSelectedBooking(booking);
  };

  const handleAddPayment = async () => {
    if (!selectedBooking) return;
    const amount = Number(paymentDraft.amount) || 0;
    if (amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }
    if (amount > selectedBookingRemainingAmount) {
      alert(`Payment cannot exceed Rs ${selectedBookingRemainingAmount.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const updated = await payBookingBalance(selectedBooking._id, {
        paymentAmount: amount,
        paymentRef: paymentDraft.paymentRef.trim(),
        paymentMode: "admin-collection",
        paymentType: paymentDraft.paymentType,
      });
      setSelectedBooking(updated);
      setBookings((current) => current.map((booking) => (booking._id === updated._id ? updated : booking)));
      setPaymentDraft({ amount: "", paymentRef: "", paymentType: "part-payment" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to collect payment");
    } finally {
      setLoading(false);
    }
  };

  const getBookingZoneLabel = (booking: BookingItem) => {
    return booking.zone?.zoneName || booking.allotment?.zone || "Not selected";
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return bookings.slice(startIndex, startIndex + pageSize);
  }, [bookings, pageSize, safeCurrentPage]);
  const receiptUrl = selectedBooking?.receiptImage
    ? (selectedBooking.receiptImage.startsWith("http") ? selectedBooking.receiptImage : buildApiUrl(selectedBooking.receiptImage))
    : "";
  const isReceiptPdf = Boolean(receiptUrl && receiptUrl.toLowerCase().endsWith(".pdf"));

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
          subtitle="Complete booking information and vendor details.">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoList
                items={[
                  ["Booking ID", selectedBooking._id.slice(-6).toUpperCase()],
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

            {receiptUrl ? (
              <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">Payment Receipt</p>
                    <p className="mt-1 text-xs text-[var(--text-soft)]">Uploaded proof attached with this booking.</p>
                  </div>
                  <a
                    className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2 text-sm font-semibold text-white"
                    href={receiptUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open Receipt
                  </a>
                </div>
                <div className="mt-4 overflow-hidden rounded-[18px] border border-[color:var(--border-soft)] bg-[rgba(255,255,255,0.65)]">
                  {isReceiptPdf ? (
                    <iframe className="h-[420px] w-full" src={receiptUrl} title="Booking receipt preview" />
                  ) : (
                    <img
                      alt="Booking receipt"
                      className="max-h-[420px] w-full object-contain bg-white"
                      src={receiptUrl}
                    />
                  )}
                </div>
              </div>
            ) : null}

            {isAdmin && selectedBooking.status !== "rejected" && selectedBookingRemainingAmount > 0 ? (
              <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[var(--text-main)]">Collect More Payment</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    className="rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)]"
                    min={0}
                    max={selectedBookingRemainingAmount}
                    onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="Amount"
                    type="number"
                    value={paymentDraft.amount}
                  />
                  <input
                    className="rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)]"
                    onChange={(event) => setPaymentDraft((current) => ({ ...current, paymentRef: event.target.value }))}
                    placeholder="Reference"
                    type="text"
                    value={paymentDraft.paymentRef}
                  />
                  <button
                    className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={loading}
                    onClick={handleAddPayment}
                    type="button"
                  >
                    {loading ? "Saving..." : "Pay More"}
                  </button>
                </div>
              </div>
            ) : null}

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
          {paginatedBookings.map((b) => (
            <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={b._id}>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Booking ID</span>
                <span className="text-right text-sm font-medium text-[var(--text-main)]">

                  {b._id.slice(-6).toUpperCase()}</span>
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
              {paginatedBookings.map((b) => (
                <tr className="border-t border-[color:var(--border-soft)]" key={b._id}>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">
                    {b._id.slice(-6).toUpperCase()}</td>
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
        <div className="flex flex-col gap-3 border-t border-[color:var(--border-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-[var(--text-soft)]">
            Showing {bookings.length ? (safeCurrentPage - 1) * pageSize + 1 : 0}-{Math.min(safeCurrentPage * pageSize, bookings.length)} of {bookings.length} bookings
          </p>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    className="rounded-full border border-[color:var(--border-soft)] bg-white/70 text-[var(--text-soft)]"
                    href="#"
                    isActive={page === safeCurrentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  );
}
