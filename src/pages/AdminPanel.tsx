import { useState } from "react";
import { Footer } from "@/components/admin/Footer";
import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { getPageHeaderOverview, pageMeta, resolvePageForRole, renderPage, roleNavigation } from "@/components/admin/AppPages";
import type { PageId, UserRole } from "@/components/admin/types";
import { getBookings, type BookingItem } from "@/lib/domainApi";
import { getCurrentUser } from "@/lib/auth";

type AdminPanelProps = {
  userRole: UserRole;
};

function downloadFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function toCsvRow(values: string[]) {
  return values.map((value) => `"${value.replace(/"/g, "\"\"")}"`).join(",");
}

function buildBookingsCsv(bookings: BookingItem[]) {
  const header = ["Booking ID", "Vendor Name", "Vendor Email", "Event", "Zone", "Category", "Quantity", "Paid Amount", "Final Amount", "Status"];
  const rows = bookings.map((booking) => [
    booking._id.slice(-6).toUpperCase(),
    booking.vendorName || "",
    booking.vendorEmail || "",
    booking.event?.title || "",
    booking.zone?.zoneName || booking.allotment?.zone || "",
    booking.category?.name || "",
    String(booking.quantity || 0),
    String(Number(booking.paymentAmount || 0)),
    String(Number(booking.finalAmount || 0)),
    booking.status || "",
  ]);

  return [toCsvRow(header), ...rows.map(toCsvRow)].join("\n");
}

function buildInvoiceText(bookings: BookingItem[], accountName: string) {
  const lines = [
    "Swadeshi Mela Invoice Summary",
    `Account: ${accountName}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
  ];

  let totalPaid = 0;
  let totalFinal = 0;

  for (const booking of bookings) {
    const paid = Number(booking.paymentAmount || 0);
    const finalAmount = Number(booking.finalAmount || 0);
    totalPaid += paid;
    totalFinal += finalAmount;
    lines.push(
      `${booking._id.slice(-6).toUpperCase()} | ${booking.event?.title || "-"} | ${booking.category?.name || "-"} | Paid Rs ${paid.toLocaleString()} | Final Rs ${finalAmount.toLocaleString()} | ${booking.status}`,
    );
  }

  lines.push("");
  lines.push(`Total Paid: Rs ${totalPaid.toLocaleString()}`);
  lines.push(`Total Final Amount: Rs ${totalFinal.toLocaleString()}`);
  lines.push(`Outstanding Balance: Rs ${Math.max(totalFinal - totalPaid, 0).toLocaleString()}`);

  return lines.join("\n");
}

const AdminPanel = ({ userRole }: AdminPanelProps) => {
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  const navigation = roleNavigation[userRole];
  const resolvedPage = resolvePageForRole(activePage, userRole);
  const activeSidebarItem: PageId =
    resolvedPage === "event-create"
      ? "events"
      : resolvedPage === "event-details"
        ? "events"
        : resolvedPage === "event-edit"
          ? "events"
      : resolvedPage === "booking-create"
        ? "bookings"
        : resolvedPage;
  const activeMeta = pageMeta[resolvedPage];
  const headerOverview = getPageHeaderOverview(resolvedPage, userRole);
  const currentUser = getCurrentUser();

  const handleHeaderAction = async (action: string) => {
    switch (action) {
      case "My bookings":
        setActivePage(resolvePageForRole("bookings", userRole));
        return;
      case "Payment summary":
        setActivePage(resolvePageForRole("payments", userRole));
        return;
      case "Back to events":
        setActivePage(resolvePageForRole("events", userRole));
        return;
      case "Edit event":
        setActivePage(resolvePageForRole("event-edit", userRole));
        return;
      case "Back to bookings":
        setActivePage(resolvePageForRole("bookings", userRole));
        return;
      case "Create booking":
        setActivePage(resolvePageForRole("booking-create", userRole));
        return;
      case "Retry payment":
        setActivePage(resolvePageForRole("payments", userRole));
        return;
      case "Compare years":
        setActivePage(resolvePageForRole("reports", userRole));
        return;
      case "Export bookings": {
        const bookings = await getBookings();
        downloadFile(`swadeshi-bookings-${new Date().toISOString().slice(0, 10)}.csv`, buildBookingsCsv(bookings), "text/csv;charset=utf-8");
        return;
      }
      case "Download invoice": {
        const bookings = await getBookings();
        const accountName = currentUser?.name || (userRole === "Vendor" ? "Vendor Account" : "Admin");
        downloadFile(`swadeshi-invoice-${new Date().toISOString().slice(0, 10)}.txt`, buildInvoiceText(bookings, accountName));
        return;
      }
      case "Export PDF":
        window.print();
        return;
      default:
        return;
    }
  };

  return (
    <div className="bg-festive-admin min-h-screen text-[var(--text-main)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col lg:flex-row">
        <Sidebar
          activeItem={activeSidebarItem}
          onSelect={(id) => setActivePage(resolvePageForRole(id as PageId, userRole))}
          role={userRole}
          sections={navigation.sidebarSections}
        />
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(217,106,20,0.14),transparent)]" />
          <Header description={activeMeta.description} onAction={handleHeaderAction} overview={headerOverview} title={activeMeta.title} />
          <main className="relative flex-1 px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            {renderPage(resolvedPage, (page) => setActivePage(resolvePageForRole(page, userRole)), userRole)}
          </main>
          <Footer pageLabel={activeMeta.title} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
