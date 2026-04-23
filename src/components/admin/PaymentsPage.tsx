import { useEffect, useMemo, useState } from "react";
import { Card, SimpleTable, StatsRow } from "./PageScaffold";
import { getBookings, payBookingBalance, type BookingItem } from "@/lib/domainApi";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "@/components/ui/sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

function getPaymentRecords(booking: BookingItem) {
  if (booking.paymentRecords?.length) {
    return booking.paymentRecords;
  }

  if (Number(booking.paymentAmount || 0) > 0) {
    return [
      {
        installmentNumber: 1,
        amount: Number(booking.paymentAmount || 0),
        paymentRef: booking.paymentRef || "",
        paymentMode: booking.paymentMode || "mock",
        paymentType: "part-payment",
        paidAt: booking.createdAt,
      },
    ];
  }

  return [];
}

export function PaymentsPage() {
  const pageSize = 8;
  const currentUser = getCurrentUser();
  const isVendor = currentUser?.role === "vendor";
  const isAdmin = currentUser?.role === "admin";
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, { amount: string; paymentRef: string; paymentType: string }>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const loadBookings = () => {
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const totalDue = useMemo(
    () => bookings.reduce((sum, booking) => sum + Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0), 0),
    [bookings],
  );
  const totalPaid = useMemo(
    () => bookings.reduce((sum, booking) => sum + Number(booking.paymentAmount || 0), 0),
    [bookings],
  );
  const totalBooked = useMemo(
    () => bookings.reduce((sum, booking) => sum + Number(booking.finalAmount || 0), 0),
    [bookings],
  );

  const paymentSummary: [string, string][] = [
    ["Total booked amount", `Rs ${totalBooked.toLocaleString()}`],
    ["Total paid", `Rs ${totalPaid.toLocaleString()}`],
    ["Outstanding balance", `Rs ${totalDue.toLocaleString()}`],
    ["Bookings linked", bookings.length.toLocaleString()],
  ];

  const paymentRows = bookings.flatMap((booking) => {
    const records = getPaymentRecords(booking);
    if (!records.length) {
      return [[booking._id.slice(-6).toUpperCase(), booking.event?.title || "-", booking.allotment?.stallNumber || `${booking.quantity || 1} stall(s)`, "Rs 0", "No payment yet"]];
    }

    return records.map((record, index) => [
      `Payment ${record.installmentNumber || index + 1}`,
      booking.event?.title || "-",
      booking.allotment?.stallNumber || `${booking.quantity || 1} stall(s)`,
      `Rs ${Number(record.amount || 0).toLocaleString()}`,
      record.paidAt ? `${new Date(record.paidAt).toLocaleDateString("en-IN")} • ${record.paymentType || "part-payment"}` : booking.status,
    ]);
  });

  const totalPages = Math.max(1, Math.ceil(paymentRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPaymentRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return paymentRows.slice(startIndex, startIndex + pageSize);
  }, [pageSize, paymentRows, safeCurrentPage]);

  const payableBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        if (booking.status === "rejected") return true;
        return Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0) > 0;
      }),
    [bookings],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleDraftChange = (bookingId: string, field: "amount" | "paymentRef" | "paymentType", value: string) => {
    setPaymentDrafts((current) => ({
      ...current,
      [bookingId]: {
        amount: current[bookingId]?.amount || "",
        paymentRef: current[bookingId]?.paymentRef || "",
        paymentType: current[bookingId]?.paymentType || "part-payment",
        [field]: value,
      },
    }));
  };

  const handleCollectInstallment = async (booking: BookingItem) => {
    const draft = paymentDrafts[booking._id] || { amount: "", paymentRef: "", paymentType: "part-payment" };
    const paymentAmount = Number(draft.amount) || 0;
    const remainingAmount = Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0);

    if (paymentAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (paymentAmount > remainingAmount) {
      toast.error(`Payment cannot exceed Rs ${remainingAmount.toLocaleString()}`);
      return;
    }

    setSubmittingId(booking._id);
    try {
      await payBookingBalance(booking._id, {
        paymentAmount,
        paymentRef: draft.paymentRef.trim(),
        paymentMode: isAdmin ? "admin-collection" : "vendor-portal",
        paymentType: draft.paymentType || "part-payment",
      });
      toast.success("Part payment saved");
      setPaymentDrafts((current) => ({
        ...current,
        [booking._id]: { amount: "", paymentRef: "", paymentType: "part-payment" },
      }));
      loadBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete payment");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <StatsRow stats={paymentSummary} />

      <SimpleTable
        title="Payment History"
        headers={["Txn ID", "Event", "Stall", "Amount", "Status"]}
        rows={paginatedPaymentRows}
      />

      {paymentRows.length ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-soft)]">
            Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, paymentRows.length)} of {paymentRows.length} payment entries
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
      ) : null}

      {isVendor || isAdmin ? (
        <Card title={isAdmin ? "Collect Part Payment" : "Pay Part Payment"} subtitle="Record part payments and keep them synced in booking history.">

          <div className="space-y-4">
            {payableBookings.length ? (
              payableBookings.map((booking) => {
                const remainingAmount = Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0);
                const draft = paymentDrafts[booking._id] || { amount: "", paymentRef: "", paymentType: "part-payment" };
                const disabled = remainingAmount <= 0 || booking.status === "rejected";

                return (
                  <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={booking._id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">{booking.event?.title || "Selected event"}</p>
                        <p className="mt-1 text-sm text-[var(--text-soft)]">
                          Booking {booking._id.slice(-6).toUpperCase()} | Stall {booking.allotment?.stallNumber || `${booking.quantity || 1} unit(s)`}
                        </p>
                      </div>

                      <div className="text-sm text-[var(--text-soft)]">
                        <p>Final: <span className="font-semibold text-[var(--text-main)]">Rs {Number(booking.finalAmount || 0).toLocaleString()}</span></p>
                        <p>Paid: <span className="font-semibold text-[var(--text-main)]">Rs {Number(booking.paymentAmount || 0).toLocaleString()}</span></p>
                        <p>Remaining: <span className="font-semibold text-[var(--brand)]">Rs {remainingAmount.toLocaleString()}</span></p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]" >
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Part Payment Amount</label>
                        <input
                          className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)]"
                          disabled={disabled || submittingId === booking._id}
                          max={remainingAmount || undefined}
                          min={0}
                          onChange={(event) => handleDraftChange(booking._id, "amount", event.target.value)}
                          placeholder="Enter amount"
                          type="number"
                          value={draft.amount}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Payment Reference</label>
                        <input
                          className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)]"
                          disabled={disabled || submittingId === booking._id}
                          onChange={(event) => handleDraftChange(booking._id, "paymentRef", event.target.value)}
                          placeholder="UPI / bank / receipt reference"
                          type="text"
                          value={draft.paymentRef}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          className="w-full rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={disabled || submittingId === booking._id}
                          onClick={() => handleCollectInstallment(booking)}
                          type="button"
                        >
                          {remainingAmount <= 0 ? "Fully paid" : booking.status === "rejected" ? "Rejected" : submittingId === booking._id ? "Processing..." : isAdmin ? "Collect payment" : "Pay part payment"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--text-soft)]">No bookings with pending payment are linked to this account right now.</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
