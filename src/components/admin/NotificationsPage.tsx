import { useEffect, useMemo, useState } from "react";
import { SimpleTable } from "./PageScaffold";
import { getBookings, getEvents, getVendors, type BookingItem, type EventItem, type VendorItem } from "@/lib/domainApi";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type NotificationRow = {
  type: string;
  target: string;
  message: string;
  status: string;
  timestamp: string;
  sortTime: number;
  priority: number;
};

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
}

function getRemainingAmount(booking: BookingItem) {
  return Math.max(Number(booking.finalAmount || 0) - Number(booking.paymentAmount || 0), 0);
}

function formatTimestamp(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString("en-IN")} ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

function getSortTime(value: string | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function NotificationsPage() {
  const pageSize = 12;
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([getBookings(), getEvents(), getVendors()])
      .then(([bookingRows, eventRows, vendorRows]) => {
        setBookings(bookingRows);
        setEvents(eventRows);
        setVendors(vendorRows);
      })
      .catch(() => {
        setBookings([]);
        setEvents([]);
        setVendors([]);
      });
  }, []);

  const notifications = useMemo<NotificationRow[]>(() => {
    const bookingNotifications = bookings.flatMap((booking) => {
      const remainingAmount = getRemainingAmount(booking);
      const rows: NotificationRow[] = [
        {
          type: "Booking",
          target: booking.vendorName,
          message: `Booking ${booking._id.slice(-6).toUpperCase()} is ${booking.status} for ${booking.category?.name || "unmapped category"} in ${booking.zone?.zoneName || booking.allotment?.zone || "unassigned zone"}.`,
          status: capitalize(booking.status),
          timestamp: formatTimestamp(booking.createdAt),
          sortTime: getSortTime(booking.createdAt),
          priority: booking.status === "rejected" ? 1 : 2,
        },
      ];

      if (remainingAmount > 0) {
        rows.push({
          type: "Payment",
          target: booking.vendorName,
          message: `Rs ${remainingAmount.toLocaleString()} is still pending for booking ${booking._id.slice(-6).toUpperCase()}.`,
          status: "Pending",
          timestamp: formatTimestamp(booking.createdAt),
          sortTime: getSortTime(booking.createdAt),
          priority: 1,
        });
      }

      if ((booking.paymentRecords?.length || 0) > 0) {
        const latestPayment = booking.paymentRecords?.[booking.paymentRecords.length - 1];
        rows.push({
          type: "Payment",
          target: booking.vendorName,
          message: `${booking.paymentRecords?.length || 1} payment update(s) recorded for booking ${booking._id.slice(-6).toUpperCase()}.`,
          status: "Recorded",
          timestamp: formatTimestamp(latestPayment?.paidAt || booking.createdAt),
          sortTime: getSortTime(latestPayment?.paidAt || booking.createdAt),
          priority: 2,
        });
      }

      return rows;
    });

    const vendorNotifications = vendors.map((vendor) => ({
      type: "Vendor",
      target: vendor.name,
      message: `${vendor.name} is currently marked as ${vendor.status}.`,
      status: capitalize(vendor.status),
      timestamp: formatTimestamp(vendor.createdAt),
      sortTime: getSortTime(vendor.createdAt),
      priority: vendor.status === "pending" ? 1 : 3,
    }));

    const eventNotifications = events.map((event) => ({
      type: "Event",
      target: event.title,
      message: `${event.title} booking is ${event.bookingEnabled ? "enabled" : "disabled"} with ${event.status} status.`,
      status: `${capitalize(event.status)} / ${event.bookingEnabled ? "Open" : "Closed"}`,
      timestamp: formatTimestamp(event.startDate),
      sortTime: getSortTime(event.startDate),
      priority: event.bookingEnabled ? 3 : 2,
    }));

    return [...bookingNotifications, ...vendorNotifications, ...eventNotifications]
      .sort((a, b) => b.sortTime - a.sortTime || a.priority - b.priority || a.type.localeCompare(b.type))
      .slice(0, 30);
  }, [bookings, events, vendors]);

  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedNotifications = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return notifications.slice(startIndex, startIndex + pageSize);
  }, [notifications, pageSize, safeCurrentPage]);

  const notificationRows = useMemo(
    () => paginatedNotifications.map((item) => [item.type, item.target, item.message, item.status, item.timestamp]),
    [paginatedNotifications],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SimpleTable
          title="Notifications"
          headers={["Type", "Target", "Message", "Status", "Date & Time"]}
          rows={notificationRows}
        />
        <div className="flex flex-col gap-3 border-t border-[color:var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-soft)]">
            Showing {notifications.length ? (safeCurrentPage - 1) * pageSize + 1 : 0}-{Math.min(safeCurrentPage * pageSize, notifications.length)} of {notifications.length} notifications
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
      </div>
    </div>
  );
}
