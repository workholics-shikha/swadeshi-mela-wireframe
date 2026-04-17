import { useEffect, useState } from "react";
import { getVendors, updateVendorStatus, type VendorItem } from "@/lib/domainApi";

export function ApprovalsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);

  async function load() {
    const vendorData = await getVendors();
    setVendors(vendorData);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function onVendorApprove(id: string, status: "approved" | "pending") {
    await updateVendorStatus(id, status);
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel overflow-hidden rounded-[24px] border border-[color:var(--border-soft)]">
        <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Vendors</h3>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {vendors.map((vendor) => (
            <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={vendor._id}>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Name</span>
                <span className="text-right text-sm font-medium text-[var(--text-main)]">{vendor.name}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Email</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{vendor.email}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Mobile</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{vendor.mobile || "-"}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</span>
                <span className="text-right text-sm text-[var(--text-soft)]">{vendor.status}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-2 text-xs font-semibold text-white" onClick={() => onVendorApprove(vendor._id, "approved")} type="button">
                  Approve
                </button>
                <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-soft)]" onClick={() => onVendorApprove(vendor._id, "pending")} type="button">
                  Mark Pending
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left">
            <thead className="bg-[linear-gradient(90deg,rgba(217,106,20,0.12),rgba(79,133,78,0.08))] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Mobile</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr className="border-t border-[color:var(--border-soft)]" key={vendor._id}>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{vendor.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{vendor.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{vendor.mobile || "-"}</td>
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
    </div>
  );
}
