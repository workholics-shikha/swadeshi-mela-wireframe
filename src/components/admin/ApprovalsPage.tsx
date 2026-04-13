import { useEffect, useState } from "react";
import { allotBooking, getBookings, getVendors, updateVendorStatus, type BookingItem, type VendorItem } from "@/lib/domainApi";

export function ApprovalsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [zoneById, setZoneById] = useState<Record<string, string>>({});
  const [stallById, setStallById] = useState<Record<string, string>>({});

  async function load() {
    const [vendorData, bookingData] = await Promise.all([getVendors(), getBookings()]);
    setVendors(vendorData);
    setBookings(bookingData);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  async function onVendorApprove(id: string, status: "approved" | "pending") {
    await updateVendorStatus(id, status);
    await load();
  }

  async function onBookingAction(id: string, status: "approved" | "rejected") {
    await allotBooking(id, { status, zone: zoneById[id], stallNumber: stallById[id] });
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel overflow-hidden rounded-[24px] border border-[color:var(--border-soft)]">
        <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Vendor approvals</h3>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left">
            <thead className="bg-[linear-gradient(90deg,rgba(217,106,20,0.12),rgba(79,133,78,0.08))] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr className="border-t border-[color:var(--border-soft)]" key={vendor._id}>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{vendor.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{vendor.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{vendor.status}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-1.5 text-xs font-semibold text-white" onClick={() => onVendorApprove(vendor._id, "approved")} type="button">
                        Approve
                      </button>
                      <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)]" onClick={() => onVendorApprove(vendor._id, "pending")} type="button">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="bg-admin-panel overflow-hidden rounded-[24px] border border-[color:var(--border-soft)]">
          <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
            <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Booking allotment queue</h3>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {pendingBookings.map((row) => (
              <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={row._id}>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Vendor</span>
                  <span className="text-right text-sm font-medium text-[var(--text-main)]">{row.vendorName}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Category</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.category?.name}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Zone</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{zoneById[row._id] || "-"}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Documents</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{stallById[row._id] || "-"}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input className="rounded-lg border border-[color:var(--border-soft)] px-3 py-2 text-sm" placeholder="Zone (A/B/C)" value={zoneById[row._id] || ""} onChange={(e) => setZoneById((c) => ({ ...c, [row._id]: e.target.value }))} />
                  <input className="rounded-lg border border-[color:var(--border-soft)] px-3 py-2 text-sm" placeholder="Stall no" value={stallById[row._id] || ""} onChange={(e) => setStallById((c) => ({ ...c, [row._id]: e.target.value }))} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-2 text-xs font-semibold text-white" onClick={() => onBookingAction(row._id, "approved")} type="button">
                    Approve
                  </button>
                  <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-soft)]" onClick={() => onBookingAction(row._id, "rejected")} type="button">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[linear-gradient(90deg,rgba(217,106,20,0.12),rgba(79,133,78,0.08))] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Zone</th>
                  <th className="px-4 py-3 font-semibold">Documents</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map((row) => (
                  <tr className="border-t border-[color:var(--border-soft)]" key={row._id}>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{row.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.category?.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">
                      <input className="rounded-lg border border-[color:var(--border-soft)] px-3 py-2 text-sm" placeholder="Zone" value={zoneById[row._id] || ""} onChange={(e) => setZoneById((c) => ({ ...c, [row._id]: e.target.value }))} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">
                      <input className="rounded-lg border border-[color:var(--border-soft)] px-3 py-2 text-sm" placeholder="Stall no" value={stallById[row._id] || ""} onChange={(e) => setStallById((c) => ({ ...c, [row._id]: e.target.value }))} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.status}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-1.5 text-xs font-semibold text-white" onClick={() => onBookingAction(row._id, "approved")} type="button">
                          Approve
                        </button>
                        <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)]" onClick={() => onBookingAction(row._id, "rejected")} type="button">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
