import { ActionList, Card, PageHero, StatsRow } from "./PageScaffold";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHero title="Reports & Analytics" description="Revenue, occupancy, and season-over-season insights for event decision-making." actions={["Export PDF", "Compare years"]} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card title="Yearly Comparison" subtitle="Quick benchmark from the reports wireframe.">
          <StatsRow stats={[["2024 Revenue","Rs 6.9L"],["2025 Revenue","Rs 8.4L"],["2026 Goal","Rs 10.5L"]]} />
        </Card>
        <Card title="Top Indicators" subtitle="Most important current signals.">
          <ActionList actions={["Occupancy improved 22% vs last season.","Textile zone remains the strongest revenue contributor.","Food category has the fastest booking velocity."]} />
        </Card>
      </div>
    </div>
  );
}
