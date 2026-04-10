import { ActionList, Card, FormGrid, JumpButton, PageHero, StatsRow } from "./PageScaffold";
import type { SetPage } from "./types";

export function VendorHubPage({ setPage }: { setPage: SetPage }) {
  return (
    <div className="space-y-6">
      <PageHero title="Vendor Dashboard & Application" description="Combines the vendor dashboard and application screen into one connected admin view." actions={["Open approvals", "View public directory"]} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Vendor Dashboard Snapshot" subtitle="Performance and readiness for a typical vendor account.">
          <StatsRow stats={[["Allocated stalls","2"],["Amount paid","Rs 19,200"],["Documents","4 / 5"]]} />
          <ActionList actions={["Profile completeness at 82% with KYC nearly finished.","Zone A textile stalls A-12 and A-13 currently reserved.","Promotional banner upload still pending for storefront listing."]} />
        </Card>
        <Card title="Vendor Application Review" subtitle="Captured from the original registration flow.">
          <FormGrid fields={[["Business Name","Meena Crafts Pvt Ltd"],["Contact Person","Meena Sharma"],["Category","Textile"],["Requested Stalls","2"],["GSTIN","23ABCDE1234F1Z5"],["Preferred Zone","Zone A"]]} />
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <JumpButton label="Approve this vendor" onClick={() => setPage("approvals")} />
        <JumpButton label="Open payment summary" onClick={() => setPage("payments")} />
        <JumpButton label="Review booking status" onClick={() => setPage("bookings")} />
      </div>
    </div>
  );
}
