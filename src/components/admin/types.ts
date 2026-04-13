export type PageId =
  | "dashboard"
  | "events"
  | "event-create"
  | "event-details"
  | "event-edit"
  | "categories"
  | "zones"
  | "stalls"
  | "bookings"
  | "booking-create"
  | "vendors"
  | "approvals"
  | "payments"
  | "reports"
  | "notifications"
  | "settings";

export type UserRole = "Admin" | "Vendor";
export type SetPage = (page: PageId) => void;
