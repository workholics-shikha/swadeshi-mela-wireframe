export type PageId =
  | "dashboard"
  | "events"
  | "event-create"
  | "categories"
  | "stalls"
  | "bookings"
  | "vendors"
  | "approvals"
  | "payments"
  | "reports"
  | "notifications"
  | "settings";

export type UserRole = "Admin" | "Vendor";
export type SetPage = (page: PageId) => void;
