import { ApprovalsPage } from "./ApprovalsPage";
import { BookingOperationsPage } from "./BookingOperationsPage";
import { DashboardPage } from "./DashboardPage";
import { EventCreatePage } from "./EventCreatePage";
import { NotificationsPage } from "./NotificationsPage";
import { PaymentsPage } from "./PaymentsPage";
import { ReportsPage } from "./ReportsPage";
import { SettingsPage } from "./SettingsPage";
import { StallMapPage } from "./StallMapPage";
import { VendorHubPage } from "./VendorHubPage";
import type { PageId, SetPage, UserRole } from "./types";

type PageMeta = { title: string; description: string };
type SidebarItem = { id: PageId; label: string; badge?: string };
type SidebarSection = { title: string; items: ReadonlyArray<SidebarItem> };
type QuickAccessItem = { id: PageId; label: string };

const roleAllowedPages: Record<UserRole, ReadonlyArray<PageId>> = {
  Admin: ["dashboard","events","stalls","bookings","vendors","approvals","payments","reports","notifications","settings"],
  Vendor: ["dashboard","bookings","vendors","payments","notifications","settings"],
};

export const pageMeta: Record<PageId, PageMeta> = {
  dashboard: { title: "Admin Dashboard", description: "Real-time oversight for stalls, vendors, payments, and daily operations." },
  events: { title: "Create / Edit Event", description: "Configure mela details, event schedule, venue, and publishing workflow." },
  stalls: { title: "Stalls & Booking", description: "Manage interactive stall allocation, occupancy, and zone-level availability." },
  bookings: { title: "Booking Operations", description: "Monitor reservation status, assignment queues, and booking support activity." },
  vendors: { title: "Vendor Hub", description: "Track vendor onboarding, applications, readiness, and account health." },
  approvals: { title: "Approvals Desk", description: "Review KYC, documents, notes, and approval decisions before confirmation." },
  payments: { title: "Payment Flow", description: "Review dues, transaction history, and payment readiness for booked stalls." },
  reports: { title: "Reports & Analytics", description: "Analyze occupancy, revenue, vendor mix, and year-over-year mela performance." },
  notifications: { title: "Notifications Center", description: "Send reminders, watch escalations, and manage operational communications." },
  settings: { title: "Platform Settings", description: "Adjust portal preferences, approval policies, and payment defaults." },
};

const adminSidebarSections: ReadonlyArray<SidebarSection> = [
  { title: "Main", items: [{ id: "dashboard", label: "Dashboard" },{ id: "events", label: "Events" },{ id: "stalls", label: "Stalls" },{ id: "bookings", label: "Bookings" }] },
  { title: "Vendors", items: [{ id: "vendors", label: "Vendor Hub" },{ id: "approvals", label: "Approvals", badge: "12" }] },
  { title: "Finance", items: [{ id: "payments", label: "Payments" },{ id: "reports", label: "Reports" }] },
  { title: "System", items: [{ id: "notifications", label: "Notifications" },{ id: "settings", label: "Settings" }] },
];

const vendorSidebarSections: ReadonlyArray<SidebarSection> = [
  { title: "Main", items: [{ id: "dashboard", label: "Dashboard" },{ id: "bookings", label: "My Bookings" }] },
  { title: "Account", items: [{ id: "vendors", label: "My Profile" },{ id: "payments", label: "Payments" }] },
  { title: "System", items: [{ id: "notifications", label: "Notifications" },{ id: "settings", label: "Settings" }] },
];

const adminQuickAccess: ReadonlyArray<QuickAccessItem> = [
  { id: "dashboard", label: "Dashboard" },{ id: "stalls", label: "Stalls" },{ id: "bookings", label: "Bookings" },{ id: "approvals", label: "Approvals" },{ id: "payments", label: "Payments" },
];

const vendorQuickAccess: ReadonlyArray<QuickAccessItem> = [
  { id: "dashboard", label: "Overview" },{ id: "bookings", label: "My Bookings" },{ id: "payments", label: "Payments" },{ id: "settings", label: "Settings" },
];

export const roleNavigation: Record<UserRole, { sidebarSections: ReadonlyArray<SidebarSection>; quickAccessPages: ReadonlyArray<QuickAccessItem>; defaultPage: PageId }> = {
  Admin: { sidebarSections: adminSidebarSections, quickAccessPages: adminQuickAccess, defaultPage: "dashboard" },
  Vendor: { sidebarSections: vendorSidebarSections, quickAccessPages: vendorQuickAccess, defaultPage: "dashboard" },
};

export function resolvePageForRole(page: PageId, role: UserRole): PageId {
  return roleAllowedPages[role].includes(page) ? page : roleNavigation[role].defaultPage;
}

export function renderPage(page: PageId, setPage: SetPage, role: UserRole) {
  switch (page) {
    case "dashboard": return <DashboardPage userRole={role} />;
    case "events": return <EventCreatePage />;
    case "stalls": return <StallMapPage />;
    case "bookings": return <BookingOperationsPage setPage={setPage} />;
    case "vendors": return <VendorHubPage setPage={setPage} />;
    case "approvals": return <ApprovalsPage />;
    case "payments": return <PaymentsPage />;
    case "reports": return <ReportsPage />;
    case "notifications": return <NotificationsPage />;
    case "settings": return <SettingsPage />;
    default: return <DashboardPage userRole={role} />;
  }
}
