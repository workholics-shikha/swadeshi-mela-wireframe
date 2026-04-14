import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "./PageScaffold";
import type { SetPage } from "./types";
import { getCategories, getEvents, getZones, updateEvent, type Category, type EventItem, type ZoneItem } from "@/lib/domainApi";

const SELECTED_EVENT_KEY = "admin_selected_event_id";

export function EventEditPage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventCategories, setEventCategories] = useState<Category[]>([]);
  const [stallCategories, setStallCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);

  interface CategoryRow {
    id: number;
    category: string;
    zoneId: string;
    stalls: string;
    amount: string;
  }

  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
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
    categoryZoneMappings: [] as Array<{
      categoryName: string;
      zoneId?: string;
      stalls: number;
      amount: number;
    }>,
  });

  useEffect(() => {
    Promise.all([getEvents(), getCategories(), getZones()]).then(([eventRows, categoryRows, zoneRows]) => {
      setEvents(eventRows);
      setEventCategories(categoryRows.filter((c) => c.type === "event"));
      setStallCategories(categoryRows.filter((c) => c.type === "stall"));
      setZones(zoneRows);
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
      categoryZoneMappings: selectedEvent.categoryZoneMappings || [],
    });
    // Pre-fill categoryRows from event data
    if (selectedEvent.categoryZoneMappings && selectedEvent.categoryZoneMappings.length > 0) {
      setCategoryRows(
        selectedEvent.categoryZoneMappings.map((mapping: any, index: number) => ({
          id: index + 1,
          category: mapping.categoryName || "",
          zoneId: mapping.zoneId || "",
          stalls: (mapping.stalls || 0).toString(),
          amount: (mapping.amount || 0).toString(),
        }))
      );
    } else {
      setCategoryRows([{ id: 1, category: "", zoneId: "", stalls: "0", amount: "0" }]);
    }
  }, [selectedEvent]);

  const update = (field: keyof typeof form, value: string | number) =>
    setForm((current) => ({ ...current, [field]: value }));

  // Category rows helpers - reuse from CreatePage logic
  const stallCategoryOptions = stallCategories.map((c) => c.name);
  const totalCategoryStalls = categoryRows.reduce((sum, row) => sum + (Number(row.stalls) || 0), 0);
  const totalRevenue = categoryRows.reduce((sum, row) => sum + (Number(row.stalls || 0) * Number(row.amount || 0)), 0);

  const addCategoryRow = () => {
    setCategoryRows((current) => [...current, { id: Date.now(), category: stallCategoryOptions[0] || "", zoneId: "", stalls: "0", amount: "0" }]);
  };

  const updateCategoryRow = (id: number, field: "category" | "zoneId" | "stalls" | "amount", value: string) => {
    setCategoryRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeCategoryRow = (id: number) => {
    setCategoryRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };


  const onSave = async () => {
    if (!selectedEvent?._id) return;
    console.log('categoryRows before save:', categoryRows);
    const mappings = categoryRows
      .filter((row) => row.category.trim())
      .map((row) => ({
        categoryName: row.category,
        zoneId: row.zoneId || "",
        stalls: Number(row.stalls) || 0,
        amount: Number(row.amount) || 0,
      }));
    console.log('payload mappings:', mappings);
    const payload = { ...form, categoryZoneMappings: mappings };
    console.log('final payload:', payload);
    setSaving(true);
    setMessage("");
    try {
      await updateEvent(selectedEvent._id, payload);
      setMessage("Event updated successfully.");
    } catch (error) {
      console.error('Save error:', error);
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
                {eventCategories.map((category) => (
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
        {/* Category Rows Section */}
        <div className="space-y-4 mt-6">
          {categoryRows.map((row, index) => (
            <div key={row.id} className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-end">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category {index + 1}</p>
                  <Select value={row.category} onValueChange={(value) => updateCategoryRow(row.id, "category", value)}>
                    <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {stallCategoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Stalls</p>
                  <Input type="number" min="0" value={row.stalls} onChange={(e) => updateCategoryRow(row.id, "stalls", e.target.value)} className="h-12" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Amount ₹</p>
                  <Input type="number" min="0" value={row.amount} onChange={(e) => updateCategoryRow(row.id, "amount", e.target.value)} className="h-12" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Zone</p>
                  <Select value={row.zoneId} onValueChange={(value) => updateCategoryRow(row.id, "zoneId", value)}>
                    <SelectTrigger className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone._id} value={zone._id}>{zone.zoneName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => removeCategoryRow(row.id)}
                  disabled={categoryRows.length === 1}
                  className="h-12 flex items-center gap-2 px-4 bg-white border rounded-[16px] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--brand-soft)] disabled:opacity-50"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="p-4 border rounded-[20px] border-[rgba(180,79,5,0.18)] bg-gradient-to-r from-orange-50/50 to-red-50/50">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Total: {totalCategoryStalls} stalls</p>
                <p className="text-sm font-bold text-[hsl(var(--saffron))]">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <button
                onClick={addCategoryRow}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[hsl(var(--saffron))] to-[hsl(var(--maroon))] text-white rounded-full text-sm font-semibold"
                type="button"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setPage("event-details")}
            className="px-6 py-2.5 border border-[color:var(--border-soft)] bg-white/70 rounded-full text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--brand-soft)]"
            type="button"
          >
            Back
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[hsl(var(--saffron))] to-[hsl(var(--maroon))] text-white rounded-full text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {message && (
          <p className="mt-4 p-3 rounded-[16px] bg-green-50 border border-green-200 text-sm font-semibold text-green-800">
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}

