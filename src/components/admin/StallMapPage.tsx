import { Card, InfoList, PageHero } from "./PageScaffold";

export function StallMapPage() {
  return (
    <div className="space-y-6">
      <PageHero title="Interactive Stall Allocation" description="Zone occupancy, availability, and quick assignment tools for the mela floor." actions={["All zones", "Assign stall"]} />
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card title="Zone A - Textile" subtitle="49 of 60 stalls booked.">
          <div className="mb-5 rounded-full bg-[var(--shell-bg)] p-1">
            <div className="h-3 w-[82%] rounded-full bg-[var(--brand)]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[["A-01","Booked","bg-emerald-100 text-emerald-700"],["A-02","Booked","bg-emerald-100 text-emerald-700"],["A-03","Free","bg-sky-100 text-sky-700"],["A-04","Booked","bg-emerald-100 text-emerald-700"],["A-05","Booked","bg-emerald-100 text-emerald-700"],["A-06","Pending","bg-amber-100 text-amber-700"],["A-07","Booked","bg-emerald-100 text-emerald-700"],["A-08","Booked","bg-emerald-100 text-emerald-700"],["A-09","Free","bg-sky-100 text-sky-700"],["A-10","Booked","bg-emerald-100 text-emerald-700"]].map(([stall,status,style]) => (
              <div className={`rounded-[20px] p-4 text-center ${style}`} key={stall}>
                <p className="text-lg font-semibold">{stall}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em]">{status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Zone Summary" subtitle="Current allocation by zone.">
          <InfoList items={[["Zone A - Textile","49 / 60 booked"],["Zone B - Handicraft","38 / 55 booked"],["Zone C - Food","52 / 65 booked"],["Zone D - Electronics","39 / 60 booked"]]} />
        </Card>
      </div>
    </div>
  );
}
