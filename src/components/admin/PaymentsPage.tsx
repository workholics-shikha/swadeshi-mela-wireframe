import { Card, InfoList, PageHero, SimpleTable } from "./PageScaffold";

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHero title="Complete Payment - Stalls A-12 & A-13" description="Order summary, transaction history, and amount due for the connected vendor flow." actions={["Download invoice", "Retry payment"]} />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card title="Order Summary" subtitle="Payment breakdown from the wireframe payment flow.">
          <InfoList items={[["2 x Standard Stalls","Rs 19,200"],["Electricity add-on","Rs 800"],["Security deposit","Rs 2,000"],["GST @ 18%","Rs 3,960"],["Early bird discount","- Rs 500"],["Total due","Rs 25,460"]]} />
        </Card>
        <SimpleTable title="Payment history" headers={["Txn ID","Date","Stall","Amount","Status"]} rows={[["pay_RZP001","Jan 7, 2025","A-12","Rs 9,600","Paid"],["pay_RZP002","Jan 8, 2025","A-13","Rs 9,600","Paid"]]} />
      </div>
    </div>
  );
}
