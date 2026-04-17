import { useEffect, useMemo, useState } from "react";
import { Card, InfoList, SimpleTable } from "./PageScaffold";
import { getBookings, payBookingBalance, type BookingItem } from "@/lib/domainApi";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "@/components/ui/sonner";

function getPaymentRecords(booking: BookingItem) {
  if (booking.paymentRecords?.length) {
    return booking.paymentRecords;
  }

  if (Number(booking.paymentAmount || 0) > 0) {
    return [
      {
        amount: Number(booking.paymentAmount || 0),
        paymentRef: booking.paymentRef || "",
        paymentMode: booking.paymentMode || "mock",
        paidAt: booking.createdAt,
      },
    ];
  }

  return [];
}

export function PaymentsPage() {
  const currentUser = getCurrentUser();
  const isVendor = currentUser?.role === "vendor";
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, { amount: string; paymentRef: string }>>({});

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
      record.paymentRef || `${booking._id.slice(-6).toUpperCase()}-${index + 1}`,
      booking.event?.title || "-",
      booking.allotment?.stallNumber || `${booking.quantity || 1} stall(s)`,
      `Rs ${Number(record.amount || 0).toLocaleString()}`,
      record.paidAt ? new Date(record.paidAt).toLocaleDateString("en-IN") : booking.status,
    ]);
  });

  const handleDraftChange = (bookingId: string, field: "amount" | "paymentRef", value: string) => {
    setPaymentDrafts((current) => ({
      ...current,
      [bookingId]: {
        amount: current[bookingId]?.amount || "",
        paymentRef: current[bookingId]?.paymentRef || "",
        [field]: value,
      },
    }));
  };

  const handlePayRemaining = async (booking: BookingItem) => {
    const draft = paymentDrafts[booking._id] || { amount: "", paymentRef: "" };
    const paymentAmount = Number(draft.amount) || 0;
    const remainingAmount = Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0);

    if (paymentAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (paymentAmount !== remainingAmount) {
      toast.error(`Remaining payment must be Rs ${remainingAmount.toLocaleString()}`);
      return;
    }

    setSubmittingId(booking._id);
    try {
      await payBookingBalance(booking._id, {
        paymentAmount,
        paymentRef: draft.paymentRef.trim(),
        paymentMode: "vendor-portal",
      });
      toast.success("Remaining payment received");
      setPaymentDrafts((current) => ({
        ...current,
        [booking._id]: { amount: "", paymentRef: "" },
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
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card title="Payment Summary" subtitle="Live payment totals calculated from your bookings.">
          <InfoList items={paymentSummary} />
        </Card>
        <SimpleTable title="Payment history" headers={["Txn ID","Event","Stall","Amount","Status"]} rows={paymentRows} />
      </div>

      {isVendor ? (
        <Card title="Pay Remaining Balance" subtitle="Complete pending booking balances directly from the vendor portal.">
          <div className="space-y-4">
            {bookings.length ? (
              bookings.map((booking) => {
                const remainingAmount = Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0);
                const draft = paymentDrafts[booking._id] || { amount: remainingAmount ? String(remainingAmount) : "", paymentRef: "" };
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

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Amount</label>
                        <input
                          className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)]"
                          disabled={disabled || submittingId === booking._id}
                          max={remainingAmount || undefined}
                          min={0}
                          onChange={(event) => handleDraftChange(booking._id, "amount", event.target.value)}
                          placeholder="Remaining balance"
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
                          onClick={() => handlePayRemaining(booking)}
                          type="button"
                        >
                          {remainingAmount <= 0 ? "Fully paid" : booking.status === "rejected" ? "Rejected" : submittingId === booking._id ? "Processing..." : "Pay remaining"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--text-soft)]">No vendor bookings are linked to this account yet.</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
