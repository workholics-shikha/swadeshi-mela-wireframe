import { useEffect, useMemo, useRef, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "./PageScaffold";
import { createZone, getZones, removeZone, updateZone, type ZoneItem } from "@/lib/domainApi";

type ZoneDraft = {
  id: string;
  zoneName: string;
  description: string;
  status: "active" | "inactive";
};

const defaultDraft: ZoneDraft = { id: "", zoneName: "", description: "", status: "active" };

export function ZoneManagementPage() {
  const pageSize = 5;
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState<ZoneDraft>(defaultDraft);
  const [zoneNameError, setZoneNameError] = useState("");
  const [highlightForm, setHighlightForm] = useState(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    const rows = await getZones();
    setZones(rows);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredZones = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return zones;
    return zones.filter((zone) => [zone.zoneName, zone.description, zone.status].join(" ").toLowerCase().includes(keyword));
  }, [zones, query]);

  const totalPages = Math.max(1, Math.ceil(filteredZones.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedZones = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredZones.slice(startIndex, startIndex + pageSize);
  }, [filteredZones, safeCurrentPage]);

  const triggerFormHighlight = () => {
    setHighlightForm(true);
    formCardRef.current?.focus();
  };

  const startCreate = () => {
    setDraft(defaultDraft);
    setZoneNameError("");
    triggerFormHighlight();
  };
  const startEdit = (zone: ZoneItem) =>
    {
      setZoneNameError("");
      setDraft({
        id: zone._id,
        zoneName: zone.zoneName,
        description: zone.description || "",
        status: zone.status,
      });
      triggerFormHighlight();
    };

  useEffect(() => {
    if (!highlightForm) return;
    const timeoutId = window.setTimeout(() => setHighlightForm(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [highlightForm]);

  const onSave = async () => {
    if (!draft.zoneName.trim()) {
      setZoneNameError("Zone name is required");
      return;
    }
    const payload = {
      zoneName: draft.zoneName.trim(),
      description: draft.description.trim(),
      status: draft.status,
    };
    if (!draft.id) await createZone(payload);
    else await updateZone(draft.id, payload);
    await load();
    startCreate();
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    await removeZone(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="bg-admin-panel rounded-[22px] border border-[color:var(--border-soft)] p-4 sm:rounded-[24px] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Zone Master List</h3>
              <p className="mt-1 text-sm text-[var(--text-soft)]">Add, edit, and delete zones from database.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2.5 text-sm font-semibold text-white" onClick={startCreate} type="button">
              <Plus className="h-4 w-4" />
              New zone
            </button>
          </div>

          <div className="mt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]" />
              <Input className="h-11 rounded-[14px] border-[color:var(--border-soft)] bg-white pl-10 text-[var(--text-main)]" onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }} placeholder="Search zones" value={query} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {paginatedZones.map((zone) => (
              <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 px-4 py-3" key={zone._id}>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--text-main)]">{zone.zoneName}</p>
                    <p className="text-xs text-[var(--text-soft)]">Status: {zone.status}</p>
                    <p className="mt-1 truncate text-xs text-[var(--text-soft)]">{zone.description || "No description"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-soft)]" onClick={() => startEdit(zone)} type="button">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent)]" onClick={() => onDelete(zone._id)} type="button">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-[var(--text-soft)]">
                  Created: {new Date(zone.createdAt).toLocaleString()} | Updated: {new Date(zone.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-soft)]">Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, filteredZones.length)} of {filteredZones.length} zones</p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink className="rounded-full border border-[color:var(--border-soft)] bg-white/70 text-[var(--text-soft)]" href="#" isActive={page === safeCurrentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <div
          className={`rounded-[24px] transition-all duration-500 ${
            highlightForm
              ? "scale-[1.01] shadow-[0_0_0_4px_rgba(211,140,34,0.12),0_18px_45px_rgba(136,38,63,0.12)]"
              : ""
          }`}
          ref={formCardRef}
          tabIndex={-1}
        >
        <Card title={!draft.id ? "Create Zone" : "Edit Zone"} subtitle="Create, update, or maintain the selected zone master.">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Zone name</p>
              <Input autoFocus={highlightForm} className={`h-12 rounded-[16px] bg-white text-[var(--text-main)] transition-all duration-500 ${zoneNameError ? "border-red-400 focus-visible:ring-red-100" : highlightForm ? "border-[color:rgba(211,140,34,0.55)] ring-4 ring-[rgba(211,140,34,0.16)]" : "border-[color:var(--border-soft)]"}`} onChange={(e) => {
                setDraft((c) => ({ ...c, zoneName: e.target.value }));
                if (zoneNameError && e.target.value.trim()) setZoneNameError("");
              }} placeholder="Enter zone name" value={draft.zoneName} />
              {zoneNameError ? <p className="mt-1 text-xs text-red-500">{zoneNameError}</p> : null}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Description (optional)</p>
              <textarea className="min-h-[110px] w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white p-3 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[rgba(211,140,34,0.25)]" onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))} placeholder="Add description" value={draft.description} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Status</p>
              <div className="flex gap-3">
                {(["active", "inactive"] as const).map((status) => (
                  <button className={`rounded-full px-4 py-2 text-sm font-semibold ${draft.status === status ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white" : "border border-[color:var(--border-soft)] bg-white text-[var(--text-soft)]"}`} key={status} onClick={() => setDraft((c) => ({ ...c, status }))} type="button">
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white" onClick={onSave} type="button">
              {!draft.id ? "Create zone" : "Update zone"}
            </button>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
