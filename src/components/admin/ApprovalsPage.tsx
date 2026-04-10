import { Card, PageHero, SimpleTable, TextArea } from "./PageScaffold";

export function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHero title="Vendor Approval Desk" description="Review KYC, bank details, internal notes, and make final approval decisions." actions={["Bulk approve", "Export list"]} />
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <SimpleTable title="Pending approval queue" headers={["Vendor", "Category", "Zone", "Documents", "Status"]} rows={[
          ["Meena Crafts Pvt Ltd", "Textile", "Zone A", "4 / 5", "Needs bank proof"],
          ["Rajan Food Corner", "Food", "Zone C", "5 / 5", "FSSAI verification"],
          ["Handloom Heritage", "Handicraft", "Zone B", "5 / 5", "Ready"],
        ]} />
        <Card title="Reviewer Notes" subtitle="Current note from the original approvals wireframe.">
          <TextArea label="Internal note" value="Aadhaar and bank details missing. Sending reminder to vendor via SMS." />
        </Card>
      </div>
    </div>
  );
}
