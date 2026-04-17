import { apiFetch } from "@/lib/auth";
import { buildApiUrl } from "@/lib/apiConfig";

export type Category = { _id: string; name: string; type: "event" | "stall"; status: "active" | "inactive" };
export type ZoneItem = {
  _id: string;
  zoneName: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
export type EventItem = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  openingTime: string;
  closingTime: string;
  venueName: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  bannerImage: string;
  galleryImages: string[];
  totalStalls: number;
  bookingEnabled: boolean;
  status: "active" | "inactive";
  description: string;
  category: Category;
  zones?: ZoneItem[];
  categoryZoneMappings?: Array<{
    categoryName: string;
    zoneId?: string | null;
    stalls?: number;
    amount?: number;
  }>;
};
export type BookingItem = {
  _id: string;
  vendorName: string;
  vendorEmail: string;
  mobile: string;
  businessName: string;
  ownerName?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  note?: string;
  event: { _id: string; title: string; startDate: string; venueName: string };
  zone?: { _id: string; zoneName: string };
  category: { _id: string; name: string };
  stallSize: string;
  quantity: number;
  paymentMode?: string;
  paymentRef?: string;
  receiptImage?: string;
  paymentAmount?: number;
  finalAmount?: number;
  paymentOption?: "full" | "partial";
  paymentRecords?: Array<{
    installmentNumber?: number;
    amount: number;
    paymentRef?: string;
    paymentMode?: string;
    paymentType?: string;
    paidAt?: string;
  }>;
  status: "pending" | "approved" | "rejected";
  allotment?: { zone?: string; stallNumber?: string };
  createdAt: string;
};
export type VendorItem = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: "vendor";
  status: "pending" | "approved" | "active";
  createdAt: string;
};
export type BookingAvailability = {
  totalStalls: number;
  reservedCount: number;
  availableCount: number;
  availableStallNumbers: string[];
  reservedStallNumbers: string[];
};

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(buildApiUrl("/api/categories"));
  return res.json();
}

export async function createCategory(data: { name: string; type: "event" | "stall"; status: "active" | "inactive" }) {
  const res = await apiFetch("/api/categories", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function updateCategory(id: string, data: { name: string; type: "event" | "stall"; status: "active" | "inactive" }) {
  const res = await apiFetch(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
  return res.json();
}

export async function removeCategory(id: string) {
  const res = await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
  return res.json();
}

export async function getEvents(): Promise<EventItem[]> {
  const res = await fetch(buildApiUrl("/api/events"));
  return res.json();
}

export async function createEvent(data: {
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  openingTime: string;
  closingTime: string;
  venueName: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  totalStalls: string;
  bookingEnabled: boolean;
  status: "active" | "inactive";
  bannerImage?: File | null;
  galleryImages?: File[];
  categoryZoneMappings?: Array<{ categoryName: string; zoneId: string; stalls: number; amount: number }>;
}) {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("category", data.category);
  fd.append("description", data.description);
  fd.append("startDate", data.startDate);
  fd.append("endDate", data.endDate);
  fd.append("openingTime", data.openingTime);
  fd.append("closingTime", data.closingTime);
  fd.append("venueName", data.venueName);
  fd.append("fullAddress", data.fullAddress);
  fd.append("city", data.city);
  fd.append("state", data.state);
  fd.append("pincode", data.pincode);
  fd.append("totalStalls", data.totalStalls);
  fd.append("bookingEnabled", String(data.bookingEnabled));
  fd.append("status", data.status);
  if (data.categoryZoneMappings?.length) {
    fd.append("categoryZoneMappings", JSON.stringify(data.categoryZoneMappings));
  }
  if (data.bannerImage) fd.append("bannerImage", data.bannerImage);
  for (const file of data.galleryImages || []) fd.append("galleryImages", file);
  const res = await apiFetch("/api/events", { method: "POST", body: fd, headers: {} });
  return res.json();
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    category: string;
    description: string;
    startDate: string;
    endDate: string;
    openingTime: string;
    closingTime: string;
    venueName: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    totalStalls: number;
    bookingEnabled: boolean;
    status: "active" | "inactive";
    categoryZoneMappings: Array<{ categoryName: string; zoneId?: string; stalls: number; amount: number }>;
  }>,
) {
  const res = await apiFetch(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await apiFetch(`/api/events/${id}`, { method: "DELETE" });
  return res.json();
}



export async function createBooking(data: Record<string, unknown> | FormData) {
  const isFormData = data instanceof FormData;
  const res = await fetch(buildApiUrl("/api/bookings"), {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || "Failed to create booking");
  }
  return payload;
}

export async function getBookingAvailability(params: {
  eventId: string;
  zoneId: string;
  categoryId: string;
}): Promise<BookingAvailability> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(buildApiUrl(`/api/bookings/availability?${query}`));
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || "Failed to fetch booking availability");
  }
  return payload;
}

export async function getBookings(): Promise<BookingItem[]> {
  const res = await apiFetch("/api/bookings");
  return res.json();
}

export async function allotBooking(id: string, data: { status: "pending" | "approved" | "rejected"; zone?: string; stallNumber?: string }) {
  const res = await apiFetch(`/api/bookings/${id}/allot`, { method: "PATCH", body: JSON.stringify(data) });
  return res.json();
}

export async function payBookingBalance(
  id: string,
  data: { paymentAmount: number; paymentRef?: string; paymentMode?: string; paymentType?: string },
): Promise<BookingItem> {
  const res = await apiFetch(`/api/bookings/${id}/pay-balance`, { method: "PATCH", body: JSON.stringify(data) });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || "Failed to complete payment");
  }
  return payload;
}

export async function getVendors(): Promise<VendorItem[]> {
  const res = await apiFetch("/api/vendors");
  return res.json();
}

export async function updateVendorStatus(id: string, status: "pending" | "approved" | "active") {
  const res = await apiFetch(`/api/vendors/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  return res.json();
}

export async function getZones(eventId?: string): Promise<ZoneItem[]> {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  const res = await fetch(buildApiUrl(`/api/zones${query}`));
  return res.json();
}

export async function createZone(data: { zoneName: string; description: string; status: "active" | "inactive" }) {
  const res = await apiFetch("/api/zones", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function updateZone(id: string, data: Partial<{ zoneName: string; description: string; status: "active" | "inactive" }>) {
  const res = await apiFetch(`/api/zones/${id}`, { method: "PUT", body: JSON.stringify(data) });
  return res.json();
}

export async function removeZone(id: string) {
  const res = await apiFetch(`/api/zones/${id}`, { method: "DELETE" });
  return res.json();
}

