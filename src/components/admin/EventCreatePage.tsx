import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleDot, Plus, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, FormGrid, InfoList, TextArea } from "./PageScaffold";
import type { SetPage } from "./types";

const eventSteps = [
  { label: "Basic Info", sub: "Name, dates, venue" },
  { label: "Categories", sub: "Select category and stall count" },
  { label: "Review", sub: "Check layout, categories, and publish" },
] as const;

const basicInfoFields: [string, string][] = [
  ["Event Name", "Swadeshi Mela - Indore 2026"],
  ["Venue", "Indore Sports Complex, Pologround"],
  ["City", "Indore"],
  ["State", "Madhya Pradesh"],
  ["Start Date", "2026-05-14"],
  ["End Date", "2026-05-21"],
  ["Public Registration", "2026-04-18"],
  ["Organizer Contact", "info@swadeshimela.in"],
];

const layoutItems: [string, string][] = [
  ["Zone A", "Handloom and textile brands | 72 stalls"],
  ["Zone B", "Handicrafts and decor | 60 stalls"],
  ["Zone C", "Food court and regional snacks | 54 stalls"],
  ["Zone D", "Wellness, books, and specialty retail | 54 stalls"],
];

const categoryOptions = [
  "Handloom and textile brands",
  "Handicrafts and decor",
  "Food court and regional snacks",
  "Wellness and ayurveda",
  "Books and stationery",
  "Organic and village products",
] as const;

const progressCopy = [
  "Capture the core mela details and publishing information for the event.",
  "Create category-wise allocation by selecting category names and entering stalls available.",
  "Review the stall layout and category setup before publishing the mela event.",
];

const publishingNotes =
  "Publishing this mela event will make the listing available for registrations and use the configured category-wise stall allocation for vendor onboarding.";

export function EventCreatePage({ setPage }: { setPage: SetPage }) {
  const [activeStep, setActiveStep] = useState(0);
  const [categoryRows, setCategoryRows] = useState([
    { id: 1, category: "Handloom and textile brands", stalls: "72" },
    { id: 2, category: "Handicrafts and decor", stalls: "60" },
    { id: 3, category: "Food court and regional snacks", stalls: "54" },
  ]);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === eventSteps.length - 1;

  const goNext = () => setActiveStep((current) => Math.min(current + 1, eventSteps.length - 1));
  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));

  const totalCategoryStalls = categoryRows.reduce((sum, row) => sum + (Number(row.stalls) || 0), 0);

  const addCategoryRow = () => {
    setCategoryRows((current) => [
      ...current,
      { id: Date.now(), category: categoryOptions[0], stalls: "" },
    ]);
  };

  const updateCategoryRow = (id: number, field: "category" | "stalls", value: string) => {
    setCategoryRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeCategoryRow = (id: number) => {
    setCategoryRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Event form progress</p>
            <h3 className="mt-1.5 font-display text-[1.7rem] leading-none text-[var(--text-main)] sm:text-[1.9rem]">
              Step {activeStep + 1} of {eventSteps.length}: {eventSteps[activeStep].label}
            </h3>
            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--text-soft)]">{progressCopy[activeStep]}</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-[linear-gradient(135deg,rgba(217,106,20,0.12),rgba(136,38,63,0.12))] px-3.5 py-2 text-[13px] font-semibold text-[var(--brand)]">
            <Sparkles className="h-3.5 w-3.5" />
            {isLastStep ? "Ready for publishing review" : "Step-by-step event builder"}
          </div>
        </div>

        <div className="mt-3">
          <button
            className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--text-soft)]"
            onClick={() => setPage("events")}
            type="button"
          >
            Back to event list
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {eventSteps.map((item, index) => {
            const isCurrent = index === activeStep;
            const isComplete = index < activeStep;

            return (
              <button
                className={`rounded-[22px] border p-4 text-left transition ${
                  isCurrent
                    ? "border-[rgba(180,79,5,0.28)] bg-[linear-gradient(135deg,rgba(217,106,20,0.12),rgba(136,38,63,0.1))]"
                    : isComplete
                      ? "border-[rgba(79,133,78,0.22)] bg-[linear-gradient(135deg,rgba(79,133,78,0.12),rgba(255,255,255,0.82))]"
                      : "border-[color:var(--border-soft)] bg-white/70 hover:bg-[var(--brand-soft)]"
                }`}
                key={item.label}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-sm font-bold text-white">
                    {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isCurrent
                        ? "bg-white/70 text-[var(--brand)]"
                        : isComplete
                          ? "bg-[var(--brand-accent)] text-[var(--text-main)]"
                          : "bg-[rgba(255,255,255,0.7)] text-[var(--text-soft)]"
                    }`}
                  >
                    {isCurrent ? <CircleDot className="h-3.5 w-3.5" /> : isComplete ? <Check className="h-3.5 w-3.5" /> : null}
                    {isCurrent ? "Current" : isComplete ? "Complete" : "Upcoming"}
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-semibold text-[var(--text-main)]">{item.label}</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--text-soft)]">{item.sub}</p>
              </button>
            );
          })}
        </div>
      </section>

      {activeStep === 0 && (
        <Card title="Basic Event Details" subtitle="Enter the main information for the mela event.">
          <FormGrid fields={basicInfoFields} />
          <TextArea
            label="Event Description"
            value="Annual Swadeshi Mela celebrating local artisans, food, textile, wellness, and handicraft vendors from across Madhya Pradesh."
          />
        </Card>
      )}

      {activeStep === 1 && (
        <div className="space-y-6">
          <Card title="Category Section" subtitle="Select event categories and enter stalls available for each category.">
            <div className="space-y-4">
              {categoryRows.map((row, index) => (
                <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={row.id}>
                  <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_auto] lg:items-end">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category {index + 1}</p>
                      <Select value={row.category} onValueChange={(value) => updateCategoryRow(row.id, "category", value)}>
                        <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)] focus:ring-[var(--brand)]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Stalls available</p>
                      <Input
                        className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)] focus-visible:ring-[var(--brand)]"
                        min="0"
                        onChange={(event) => updateCategoryRow(row.id, "stalls", event.target.value)}
                        placeholder="Enter stall count"
                        type="number"
                        value={row.stalls}
                      />
                    </div>

                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 text-sm font-semibold text-[var(--text-soft)] transition hover:bg-[var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={categoryRows.length === 1}
                      onClick={() => removeCategoryRow(row.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[rgba(180,79,5,0.18)] bg-[linear-gradient(135deg,rgba(217,106,20,0.08),rgba(136,38,63,0.06))] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Total category stalls</p>
                <p className="mt-1 text-sm text-[var(--text-soft)]">{totalCategoryStalls} stalls configured from the selected categories.</p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2.5 text-sm font-semibold text-white"
                onClick={addCategoryRow}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Add category
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeStep === 2 && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card title="Review Categories" subtitle="Confirm the category-wise stall allocation before publishing.">
            <InfoList
              items={categoryRows.map((row) => [
                row.category,
                `${row.stalls || "0"} stalls`,
              ])}
            />
            <TextArea label="Publishing Notes" value={publishingNotes} />
          </Card>

          <Card title="Stall Layout Review" subtitle="Review the final stall layout summary as part of the publishing step.">
            <InfoList items={layoutItems} />
          </Card>
        </div>
      )}

      <section className="bg-admin-panel flex flex-col gap-4 rounded-[24px] border border-[color:var(--border-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-main)]">{eventSteps[activeStep].label}</p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">{eventSteps[activeStep].sub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFirstStep}
            onClick={goBack}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous step
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
            onClick={goNext}
            type="button"
          >
            {isLastStep ? "Publish mela event" : "Next step"}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
