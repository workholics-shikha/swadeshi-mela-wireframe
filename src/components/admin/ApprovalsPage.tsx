const approvalRows = [
  { vendor: "Meena Crafts Pvt Ltd", category: "Textile", zone: "Zone A", documents: "4 / 5", status: "Needs bank proof" },
  { vendor: "Rajan Food Corner", category: "Food", zone: "Zone C", documents: "5 / 5", status: "FSSAI verification" },
  { vendor: "Handloom Heritage", category: "Handicraft", zone: "Zone B", documents: "5 / 5", status: "Ready" },
];

export function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <section className="bg-admin-panel overflow-hidden rounded-[24px] border border-[color:var(--border-soft)]">
          <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
            <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Pending approval queue</h3>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {approvalRows.map((row) => (
              <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={row.vendor}>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Vendor</span>
                  <span className="text-right text-sm font-medium text-[var(--text-main)]">{row.vendor}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Category</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.category}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Zone</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.zone}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Documents</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.documents}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</span>
                  <span className="text-right text-sm text-[var(--text-soft)]">{row.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-2 text-xs font-semibold text-white" type="button">
                    Approve
                  </button>
                  <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-soft)]" type="button">
                    Decline
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
                {approvalRows.map((row) => (
                  <tr className="border-t border-[color:var(--border-soft)]" key={row.vendor}>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{row.vendor}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.category}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.zone}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.documents}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-soft)]">{row.status}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-3 py-1.5 text-xs font-semibold text-white" type="button">
                          Approve
                        </button>
                        <button className="rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)]" type="button">
                          Decline
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
