import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleDot, Plus, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, InfoList } from "./PageScaffold";
import type { SetPage } from "./types";
import { createEvent, getCategories, getZones, type Category, type ZoneItem } from "@/lib/domainApi";

const eventSteps = [
  { label: "Basic Info", sub: "Title, category, venue, timing" },
  { label: "Media & Settings", sub: "Images and total stalls" },
  { label: "Review", sub: "Check all event details" },
] as const;

const progressCopy = [
  "Capture event title, category, location and timing details.",
  "Upload event media and configure total stalls.",
  "Review all entered values before publishing.",
];

export function EventCreatePage({ setPage }: { setPage: SetPage }) {
  const [eventCategories, setEventCategories] = useState<Category[]>([]);
  const [stallCategories, setStallCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([
    { id: 1, category: "", zoneId: "", stalls: "0", amount: "0" }
  ]);
  const [form, setForm] = useState({
    eventName: "",
    venue: "",
    city: "",
    state: "",
    startDate: "",
    endDate: "",
    publicRegistration: "",
    organizerContact: "",
    contactEmail: "",
    eventDescription: "",
    note: "",
    eventCategory: "",
    openingTime: "",
    closingTime: "",
    fullAddress: "",
    pincode: "",
    bannerImage: null as File | null,
    galleryImages: [] as File[],
    totalStalls: "",
  });

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === eventSteps.length - 1;

  const goNext = () => setActiveStep((current) => Math.min(current + 1, eventSteps.length - 1));
  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));

  useEffect(() => {
    getCategories()
      .then((rows) => {
        setEventCategories(rows.filter((c) => c.type === "event"));
        setStallCategories(rows.filter((c) => c.type === "stall"));
      })
      .catch(() => {
        setEventCategories([]);
        setStallCategories([]);
      });

    getZones()
      .then((rows) => setZones(rows.filter((z) => z.status === "active")))
      .catch(() => setZones([]));
  }, []);

  interface CategoryRow {
    id: number;
    category: string;
    zoneId: string;
    stalls: string;
    amount: string;
  }

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const stallCategoryOptions = stallCategories.map((c) => c.name);
  const totalCategoryStalls = categoryRows.reduce((sum, row) => sum + (Number(row.stalls) || 0), 0);
  const totalRevenue = categoryRows.reduce((sum, row) => sum + (Number(row.stalls || 0) * Number(row.amount || 0)), 0);

  const addCategoryRow = () => {
    setCategoryRows((current) => [...current, { id: Date.now(), category: stallCategoryOptions[0] || "", zoneId: "", stalls: "", amount: "0" }]);
  };

  const updateCategoryRow = (id: number, field: "category" | "zoneId" | "stalls" | "amount", value: string) => {
    setCategoryRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeCategoryRow = (id: number) => {
    setCategoryRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const publishEvent = async () => {
    setSubmitMessage("");
    if (!form.eventName || !form.eventCategory || !form.eventDescription || !form.startDate || !form.endDate || !form.openingTime || !form.closingTime || !form.venue || !form.city || !form.state || !form.pincode || categoryRows.some(row => row.category && (!row.stalls || !row.amount))) {
      setSubmitMessage("Please fill all required event fields, including category rows (stalls and amount required when category selected) before publishing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        title: form.eventName,
        category: form.eventCategory,
        description: form.eventDescription,
        note: form.note,
        startDate: form.startDate,
        endDate: form.endDate,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        venueName: form.venue,
        fullAddress: form.fullAddress || form.venue,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        totalStalls: form.totalStalls || String(totalCategoryStalls || 0),
        bookingEnabled: true,
        status: "active",
        bannerImage: form.bannerImage,
        galleryImages: form.galleryImages,
        categoryZoneMappings: categoryRows
          .filter((row) => row.category.trim())
          .map((row) => ({
            categoryName: row.category,
            zoneId: row.zoneId || "",
            stalls: Number(row.stalls) || 0,
            amount: Number(row.amount) || 0,
          })),
      });
      setSubmitMessage("Event published successfully.");
      setPage("events");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to publish event.");
    } finally {
      setIsSubmitting(false);
    }
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
                className={`rounded-[22px] border p-4 text-left transition ${isCurrent
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
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isCurrent
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event Title</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.eventName} onChange={(e) => update("eventName", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Venue</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.venue} onChange={(e) => update("venue", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">City</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">State</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Start Date</p>
              <Input type="date" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">End Date</p>
              <Input type="date" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Public Registration</p>
              <Input type="date" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.publicRegistration} onChange={(e) => update("publicRegistration", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Organizer Contact</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.organizerContact} onChange={(e) => update("organizerContact", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Contact Email</p>
              <Input type="email" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event Category</p>
              <Select value={form.eventCategory} onValueChange={(value) => update("eventCategory", value)}>
                <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]">
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Opening Time</p>
              <Input type="time" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Closing Time</p>
              <Input type="time" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Pincode</p>
              <Input className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event Description</p>
            <textarea
              className="min-h-24 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              value={form.eventDescription}
              onChange={(e) => update("eventDescription", e.target.value)}
            />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Note</p>
            <textarea
              className="min-h-24 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Optional note to show at the end of the stall booking form"
            />
          </div>
        </Card>
      )}

      {activeStep === 1 && (
        <Card title="Media & Settings" subtitle="Upload event media and configure stalls.">
          <div className="space-y-4 mb-5">
            {categoryRows.map((row, index) => (
              <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4" key={row.id}>
                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-end">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category {index + 1}</p>
                    <Select value={row.category} onValueChange={(value) => updateCategoryRow(row.id, "category", value)}>
                      <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {stallCategoryOptions.map((option) => (
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
                      className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]"
                      min="0"
                      onChange={(event) => updateCategoryRow(row.id, "stalls", event.target.value)}
                      placeholder="Enter stall count"
                      type="number"
                      value={row.stalls}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Amount (₹/stall)</p>
                    <Input
                      className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)] w-full"
                      min="0.01"
                      step="0.01"
                      onChange={(event) => updateCategoryRow(row.id, "amount", event.target.value)}
                      placeholder="5000"
                      type="number"
                      value={row.amount}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Zone</p>
                    <Select value={row.zoneId} onValueChange={(value) => updateCategoryRow(row.id, "zoneId", value)}>
                      <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone._id} value={zone._id}>
                            {zone.zoneName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[rgba(180,79,5,0.18)] bg-[linear-gradient(135deg,rgba(217,106,20,0.08),rgba(136,38,63,0.06))] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Total category stalls</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-main)]">{totalCategoryStalls} stalls</p>
                <p className="text-xs text-[var(--text-muted)]">across {categoryRows.length} categories</p>
                <p className="text-sm font-semibold text-[var(--text-main)] mt-2">Est. total revenue</p>
                <p className="text-sm font-medium text-[var(--brand)]">₹{totalRevenue.toLocaleString()}</p>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Banner Image Upload</p>
              <Input type="file" accept="image/*" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" onChange={(e) => setForm((current) => ({ ...current, bannerImage: e.target.files?.[0] || null }))} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Gallery Images Upload (multiple)</p>
              <Input type="file" multiple accept="image/*" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" onChange={(e) => setForm((current) => ({ ...current, galleryImages: Array.from(e.target.files || []) }))} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Total Stalls</p>
              <Input type="number" min="0" className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]" value={form.totalStalls} onChange={(e) => update("totalStalls", e.target.value)} />
            </div>
          </div>
        </Card>
      )}

      {activeStep === 2 && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card title="Review Event" subtitle="Confirm event data before publish.">
            <InfoList
              items={[
                ["Event Title", form.eventName || "-"],
                ["Event Category", eventCategories.find((c) => c._id === form.eventCategory)?.name || "-"],
                ["Venue", form.venue || "-"],
                ["City", form.city || "-"],
                ["State", form.state || "-"],
                ["Start Date", form.startDate || "-"],
                ["End Date", form.endDate || "-"],
                ["Opening - Closing", form.openingTime && form.closingTime ? `${form.openingTime} - ${form.closingTime}` : "-"],
                ["Full Address", form.fullAddress || "-"],
                ["Pincode", form.pincode || "-"],
                ["Public Registration", form.publicRegistration || "-"],
                ["Organizer Contact", form.organizerContact || "-"],
                ["Contact Email", form.contactEmail || "-"],
                ["Note", form.note || "-"],
                ["Banner", form.bannerImage ? form.bannerImage.name : "Not selected"],
                ["Gallery Images", form.galleryImages.length ? `${form.galleryImages.length} file(s)` : "Not selected"],
                ["Total Stalls", form.totalStalls || "0"],
                ["Category Rows", String(categoryRows.length)],
                ["Category Stall Total", String(totalCategoryStalls)],
                ["Est. Revenue", `₹${totalRevenue.toLocaleString()}`],
                ["Zone Mapping", `${categoryRows.filter((row) => row.zoneId).length} row(s) mapped`],
              ]}
            />
            {submitMessage ? <p className="mt-3 text-sm font-semibold text-[var(--text-soft)]">{submitMessage}</p> : null}
          </Card>

          <Card title="Ready to Publish" subtitle="All requested fields are present in this form.">
            <InfoList items={[["Form Mode", "Event Create"], ["Design", "Unchanged"], ["Validation", "Required fields enforced"]]} />
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
            onClick={isLastStep ? publishEvent : goNext}
            type="button"
            disabled={isSubmitting}
          >
            {isLastStep ? (isSubmitting ? "Publishing..." : "Publish mela event") : "Next step"}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
