import { Card, FormGrid, InfoList, PageHero, TextArea } from "./PageScaffold";

export function EventCreatePage() {
  return (
    <div className="space-y-6">
      <PageHero title="Create New Mela Event" description="Basic event details, layout planning, categories, and launch readiness." actions={["Save draft", "Publish event"]} />
      <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--panel)] p-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[["1","Basic Info","Name, dates, venue"],["2","Stall Layout","Zones and pricing"],["3","Categories","Vendor segments"],["4","Review","Confirm and publish"]].map(([step,label,sub], index) => (
            <div className={`rounded-[20px] border p-4 ${index === 1 ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[color:var(--border-soft)] bg-[var(--shell-bg)]"}`} key={label}>
              <p className="text-sm font-semibold text-[var(--brand)]">{step}</p>
              <p className="mt-2 font-semibold text-[var(--text-main)]">{label}</p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">{sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card title="Event Details" subtitle="Core information from the original event setup wireframe.">
          <FormGrid fields={[["Event Name","Swadeshi Mela - Indore 2025"],["Venue","Indore Sports Complex, Pologround"],["City","Indore"],["State","Madhya Pradesh"],["Start Date","2025-02-14"],["End Date","2025-02-21"]]} />
          <TextArea label="Event Description" value="Annual Swadeshi Mela celebrating local artisans, food, textile, and handicraft vendors from across Madhya Pradesh." />
        </Card>
        <Card title="Planning Snapshot" subtitle="High-level readiness before publishing.">
          <InfoList items={[["Proposed zones","Textile, Handicraft, Food, Electronics"],["Capacity target","240 stalls"],["Organizer contact","info@swadeshimela.in"],["Status","Draft review in progress"]]} />
        </Card>
      </div>
    </div>
  );
}
