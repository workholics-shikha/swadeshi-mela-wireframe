import { ApprovalsPage } from "./ApprovalsPage";
import { BookingCreatePage } from "./BookingCreatePage";
import { BookingOperationsPage } from "./BookingOperationsPage";
import { CategoryManagementPage } from "./CategoryManagementPage";
import { DashboardPage } from "./DashboardPage";
import { EventCreatePage } from "./EventCreatePage";
import { EventDetailsPage } from "./EventDetailsPage";
import { EventEditPage } from "./EventEditPage";
import { EventListPage } from "./EventListPage";
import { NotificationsPage } from "./NotificationsPage";
import { PaymentsPage } from "./PaymentsPage";
import { ReportsPage } from "./ReportsPage";
import { SettingsPage } from "./SettingsPage";
import { StallMapPage } from "./StallMapPage";
import { VendorHubPage } from "./VendorHubPage";
import { ZoneManagementPage } from "./ZoneManagementPage";
import type { PageId, SetPage, UserRole } from "./types";

type PageMeta = { title: string; description: string };
type HeaderOverview = { eyebrow?: string; title?: string; description?: string; actions?: string[] };
type SidebarItem = { id: PageId; label: string; badge?: string };
type SidebarSection = { title: string; items: ReadonlyArray<SidebarItem> };
type QuickAccessItem = { id: PageId; label: string };

const roleAllowedPages: Record<UserRole, ReadonlyArray<PageId>> = {
  Admin: ["dashboard", "events", "event-create", "event-details", "event-edit", "categories", "zones", "stalls", "bookings", "booking-create", "vendors", "approvals", "payments", "reports", "notifications", "settings"],
  Vendor: ["dashboard", "bookings", "vendors", "payments", "settings"],
};

export const pageMeta: Record<PageId, PageMeta> = {
  dashboard: { title: "Admin Dashboard", description: "Real-time oversight for stalls, vendors, payments, and daily operations." },
  events: { title: "Event Management", description: "Review existing mela events, statuses, and create new event records." },
  "event-create": { title: "Create New Mela Event", description: "Configure mela details, event schedule, categories, and publishing workflow." },
  "event-details": { title: "Event Details", description: "Inspect complete event metadata, timing, venue, and status." },
  "event-edit": { title: "Edit Event", description: "Modify an existing event and save changes to the system." },
  categories: { title: "Category Management", description: "Manage event and stall categories, capacities, and category-wise availability." },
  zones: { title: "Zone Management", description: "Manage reusable zone master records with status and descriptions." },
  stalls: { title: "Stalls & Booking", description: "Manage interactive stall allocation, occupancy, and zone-level availability." },
  bookings: { title: "Booking Operations", description: "Monitor reservation status, assignment queues, and booking support activity." },
  "booking-create": { title: "Create Booking", description: "Create a booking on behalf of vendor and capture booking plus vendor details." },
  vendors: { title: "Vendor Hub", description: "Track vendor onboarding, applications, readiness, and account health." },
  approvals: { title: "Vendors", description: "View registered vendors and manage their current account status." },
  payments: { title: "Payment Flow", description: "Review dues, transaction history, and payment readiness for booked stalls." },
  reports: { title: "Reports & Analytics", description: "Analyze occupancy, revenue, vendor mix, and year-over-year mela performance." },
  notifications: { title: "Notifications Center", description: "Send reminders, watch escalations, and manage operational communications." },
  settings: { title: "Platform Settings", description: "Adjust portal preferences, approval policies, and payment defaults." },
};

const adminSidebarSections: ReadonlyArray<SidebarSection> = [
  { title: "Main", items: [{ id: "dashboard", label: "Dashboard" }, { id: "zones", label: "Zones" }, { id: "categories", label: "Categories" }, { id: "events", label: "Events" }, { id: "stalls", label: "Stalls" }, { id: "bookings", label: "Bookings" }] },
  { title: "Vendors", items: [{ id: "approvals", label: "Vendors" }] },
  { title: "Finance", items: [{ id: "payments", label: "Payments" }] },
  { title: "System", items: [{ id: "notifications", label: "Notifications" }] },
];

const vendorSidebarSections: ReadonlyArray<SidebarSection> = [
  { title: "Main", items: [{ id: "dashboard", label: "Dashboard" }, { id: "bookings", label: "My Bookings" }] },
  { title: "Account", items: [{ id: "vendors", label: "My Profile" }, { id: "payments", label: "Payments" }] },
];

const adminQuickAccess: ReadonlyArray<QuickAccessItem> = [
  { id: "dashboard", label: "Dashboard" }, { id: "categories", label: "Categories" }, { id: "zones", label: "Zones" }, { id: "stalls", label: "Stalls" }, { id: "bookings", label: "Bookings" }, { id: "payments", label: "Payments" },
];

const vendorQuickAccess: ReadonlyArray<QuickAccessItem> = [
  { id: "dashboard", label: "Overview" }, { id: "bookings", label: "My Bookings" }, { id: "payments", label: "Payments" },
];

export const roleNavigation: Record<UserRole, { sidebarSections: ReadonlyArray<SidebarSection>; quickAccessPages: ReadonlyArray<QuickAccessItem>; defaultPage: PageId }> = {
  Admin: { sidebarSections: adminSidebarSections, quickAccessPages: adminQuickAccess, defaultPage: "dashboard" },
  Vendor: { sidebarSections: vendorSidebarSections, quickAccessPages: vendorQuickAccess, defaultPage: "dashboard" },
};

export function getPageHeaderOverview(page: PageId, role: UserRole): HeaderOverview {
  if (page === "dashboard") {
    return role === "Admin"
      ? {
        eyebrow: "Swadeshi Mela control room",
        title: "Executive Overview",
        description: "A fast read on occupancy, revenue, approvals, and operational momentum across the mela.",
      }
      : {
        eyebrow: "Vendor command center",
        title: "Business Snapshot",
        description: "Track your stalls, application status, payments, and visibility before the mela opens.",
        actions: ["My bookings"],
      };
  }

  const overviewByPage: Partial<Record<PageId, HeaderOverview>> = {
    events: {
      eyebrow: "Swadeshi Mela control room",
      title: "Event Management",
      description: "Review existing mela events, statuses, and create new event records.",
    },
    "event-create": {
      eyebrow: "Swadeshi Mela control room",
      title: "Create New Mela Event",
      description: "Basic event details, category allocation, and final review before publishing.",
    },
    "event-details": {
      eyebrow: "Swadeshi Mela control room",
      title: "Event Details",
      description: "Review full event configuration including timing, venue and operational settings.",
      actions: ["Back to events", "Edit event"],
    },
    "event-edit": {
      eyebrow: "Swadeshi Mela control room",
      title: "Edit Event",
      description: "Update event metadata and operational settings while keeping existing structure.",
    },
    categories: {
      eyebrow: "Swadeshi Mela control room",
      title: "Category Management",
      description: "Create and manage stall and event categories from one dedicated admin section.",
    },
    zones: {
      eyebrow: "Swadeshi Mela control room",
      title: "Zone Management",
      description: "Create and maintain zone masters for consistent operational planning.",
    },
    stalls: {
      eyebrow: "Swadeshi Mela control room",
      title: "Interactive Stall Allocation",
      description: "Zone occupancy, availability, and quick assignment tools for the mela floor.",
    },
    bookings: {
      eyebrow: role === "Admin" ? "Swadeshi Mela control room" : "Vendor command center",
      title: role === "Admin" ? "Booking Operations" : "My Bookings",
      description: role === "Admin"
        ? "A central place to handle reservations, payment status, and assignment escalations."
        : "Review your booking progress, stall allotment, and latest status updates.",
      actions: role === "Admin" ? ["Export bookings"] : ["My bookings"],
    },
    "booking-create": {
      eyebrow: "Swadeshi Mela control room",
      title: "Create Booking On Behalf",
      description: "Add booking details, vendor profile fields, and notes from the admin support desk.",
      actions: ["Back to bookings", "Create booking"],
    },
    vendors: {
      eyebrow: role === "Admin" ? "Swadeshi Mela control room" : "Vendor command center",
      title: role === "Admin" ? "Vendor Dashboard & Application" : "My Vendor Profile",
      description: role === "Admin"
        ? "Combines the vendor dashboard and application screen into one connected admin view."
        : "View your vendor profile, linked booking details, and account status in one place.",
    },
    approvals: {
      eyebrow: "Swadeshi Mela control room",
      title: "Vendors",
      description: "Browse vendor accounts and update their approval status from one place.",
    },
    payments: {
      eyebrow: role === "Admin" ? "Swadeshi Mela control room" : "Vendor command center",
      title: role === "Admin" ? "Payment Flow" : "My Payments",
      description: role === "Admin"
        ? "Review dues, transaction history, and payment readiness for booked stalls."
        : "Track paid amounts, pending balances, and payment references linked to your bookings.",
      actions: role === "Admin" ? ["Download invoice", "Retry payment"] : ["Payment summary"],
    },
    reports: {
      eyebrow: "Swadeshi Mela control room",
      title: "Reports & Analytics",
      description: "Revenue, occupancy, and season-over-season insights for event decision-making.",
      actions: ["Export PDF", "Compare years"],
    },
    notifications: {
      eyebrow: "Swadeshi Mela control room",
      title: "Notifications Center",
      description: "Compose reminders, review escalations, and manage operational communications.",
    },
    settings: {
      eyebrow: "Swadeshi Mela control room",
      title: "Platform Settings",
      description: "Administrative defaults for approvals, pricing behavior, and portal visibility.",
    },
  };

  return overviewByPage[page] ?? {};
}

export function resolvePageForRole(page: PageId, role: UserRole): PageId {
  return roleAllowedPages[role].includes(page) ? page : roleNavigation[role].defaultPage;
}

export function renderPage(page: PageId, setPage: SetPage, role: UserRole) {
  switch (page) {
    case "dashboard": return <DashboardPage userRole={role} />;
    case "events": return <EventListPage setPage={setPage} />;
    case "event-create": return <EventCreatePage setPage={setPage} />;
    case "event-details": return <EventDetailsPage setPage={setPage} />;
    case "event-edit": return <EventEditPage setPage={setPage} />;
    case "categories": return <CategoryManagementPage />;
    case "zones": return <ZoneManagementPage />;
    case "stalls": return <StallMapPage />;
    case "bookings": return <BookingOperationsPage setPage={setPage} userRole={role} />;
    case "booking-create": return <BookingCreatePage setPage={setPage} />;
    case "vendors": return <VendorHubPage setPage={setPage} />;
    case "approvals": return <ApprovalsPage />;
    case "payments": return <PaymentsPage />;
    case "reports": return <ReportsPage />;
    case "notifications": return <NotificationsPage />;
    case "settings": return <SettingsPage />;
    default: return <DashboardPage userRole={role} />;
  }
}
