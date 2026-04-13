import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "./PageScaffold";
import type { SetPage } from "./types";
import { getCategories, getEvents, updateEvent, type Category, type EventItem } from "@/lib/domainApi";

const SELECTED_EVENT_KEY = "admin_selected_event_id";

export function EventEditPage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    openingTime: "",
    closingTime: "",
    venueName: "",
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    totalStalls: 0,
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    Promise.all([getEvents(), getCategories()]).then(([eventRows, categoryRows]) => {
      setEvents(eventRows);
      setCategories(categoryRows.filter((c) => c.type === "event"));
      const saved = localStorage.getItem(SELECTED_EVENT_KEY) || "";
      const first = saved || eventRows[0]?._id || "";
      setSelectedId(first);
    });
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedId) || events[0],
    [events, selectedId],
  );

  useEffect(() => {
    if (!selectedEvent) return;
    setForm({
      title: selectedEvent.title || "",
      category: selectedEvent.category?._id || "",
      description: selectedEvent.description || "",
      startDate: selectedEvent.startDate?.slice(0, 10) || "",
      endDate: selectedEvent.endDate?.slice(0, 10) || "",
      openingTime: selectedEvent.openingTime || "",
      closingTime: selectedEvent.closingTime || "",
      venueName: selectedEvent.venueName || "",
      fullAddress: selectedEvent.fullAddress || "",
      city: selectedEvent.city || "",
      state: selectedEvent.state || "",
      pincode: selectedEvent.pincode || "",
      totalStalls: selectedEvent.totalStalls || 0,
      status: selectedEvent.status || "active",
    });
  }, [selectedEvent]);

  const update = (field: keyof typeof form, value: string | number) =>
    setForm((current) => ({ ...current, [field]: value }));

  const onSave = async () => {
    if (!selectedEvent?._id) return;
    setSaving(true);
    setMessage("");
    try {
      await updateEvent(selectedEvent._id, form);
      setMessage("Event updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Edit Event" subtitle="Update event details and configuration.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event</p>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)]"
              value={selectedEvent?._id || ""}
              onChange={(e) => {
                setSelectedId(e.target.value);
                localStorage.setItem(SELECTED_EVENT_KEY, e.target.value);
              }}
            >
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Event Title</p>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category</p>
            <Select value={form.category} onValueChange={(value) => update("category", value)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Venue</p><Input value={form.venueName} onChange={(e) => update("venueName", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Start Date</p><Input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">End Date</p><Input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Opening Time</p><Input type="time" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Closing Time</p><Input type="time" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">City</p><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">State</p><Input value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Pincode</p><Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} /></div>
          <div><p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Total Stalls</p><Input type="number" min={0} value={String(form.totalStalls)} onChange={(e) => update("totalStalls", Number(e.target.value) || 0)} /></div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Full Address</p>
          <textarea className="min-h-24 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)] outline-none" value={form.fullAddress} onChange={(e) => update("fullAddress", e.target.value)} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Description</p>
          <textarea className="min-h-24 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--text-main)] outline-none" value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="mt-5 flex gap-3">
          <button className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--text-soft)]" onClick={() => setPage("event-details")} type="button">
            Back to details
          </button>
          <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white" onClick={onSave} type="button" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-[var(--text-soft)]">{message}</p> : null}
      </Card>
    </div>
  );
}
