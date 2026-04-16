import { useEffect, useMemo, useRef, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "./PageScaffold";
import { createCategory, getCategories, removeCategory, updateCategory, type Category } from "@/lib/domainApi";

export function CategoryManagementPage() {
  const pageSize = 5;
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState<{ id: string; name: string; status: "active" | "inactive" }>({
    id: "",
    name: "",
    status: "active",
  });
  const [highlightForm, setHighlightForm] = useState(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return categories.slice(startIndex, startIndex + pageSize);
  }, [categories, safeCurrentPage]);

  async function load() {
    const rows = await getCategories();
    setCategories(rows);
  }

  useEffect(() => {
    load();
  }, []);

  const [draftType, setDraftType] = useState<"event" | "stall">("stall");
  const [draftStatus, setDraftStatus] = useState<"active" | "inactive">("active");

  const triggerFormHighlight = () => {
    setHighlightForm(true);
    formCardRef.current?.focus();
  };

  const startCreate = () => {
    setDraft({ id: "", name: "", status: "active" });
    setDraftType("stall");
    setDraftStatus("active");
    triggerFormHighlight();
  };
  const startEdit = (category: Category) => {
    setDraft({ id: category._id, name: category.name, status: category.status });
    setDraftType(category.type);
    setDraftStatus(category.status);
    triggerFormHighlight();
  };

  useEffect(() => {
    if (!highlightForm) return;
    const timeoutId = window.setTimeout(() => setHighlightForm(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [highlightForm]);

  const onSave = async () => {
    if (!draft.name.trim()) return;
    if (!draft.id) await createCategory({ name: draft.name.trim(), type: draftType, status: draftStatus });
    else await updateCategory(draft.id, { name: draft.name.trim(), type: draftType, status: draftStatus });
    await load();
    startCreate();
  };

  const onDelete = async (id: string) => {
    await removeCategory(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="bg-admin-panel rounded-[22px] border border-[color:var(--border-soft)] p-4 sm:rounded-[24px] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Category Master List</h3>
              <p className="mt-1 text-sm text-[var(--text-soft)]">Add, edit, and delete categories from database.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2.5 text-sm font-semibold text-white" onClick={startCreate} type="button">
              <Plus className="h-4 w-4" />
              New category
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {paginatedCategories.map((category) => (
              <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-white/70 px-4 py-3" key={category._id}>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--text-main)]">{category.name}</p>
                    <p className="text-xs text-[var(--text-soft)]">Type: {category.type} | Status: {category.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-soft)]" onClick={() => startEdit(category)} type="button">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent)]" onClick={() => onDelete(category._id)} type="button">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-soft)]">Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, categories.length)} of {categories.length} categories</p>
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
        <Card title={!draft.id ? "Create Category" : "Edit Category"} subtitle="Create, update, or maintain the selected master category.">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category name</p>
              <Input autoFocus={highlightForm} className={`h-12 rounded-[16px] bg-white text-[var(--text-main)] transition-all duration-500 ${highlightForm ? "border-[color:rgba(211,140,34,0.55)] ring-4 ring-[rgba(211,140,34,0.16)]" : "border-[color:var(--border-soft)]"}`} onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))} placeholder="Enter category name" value={draft.name} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category type</p>
              <div className="flex gap-3">
                {(["stall", "event"] as const).map((type) => (
                  <button className={`rounded-full px-4 py-2 text-sm font-semibold ${draftType === type ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white" : "border border-[color:var(--border-soft)] bg-white text-[var(--text-soft)]"}`} key={type} onClick={() => setDraftType(type)} type="button">
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Status</p>
              <div className="flex gap-3">
                {(["active", "inactive"] as const).map((status) => (
                  <button className={`rounded-full px-4 py-2 text-sm font-semibold ${draftStatus === status ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white" : "border border-[color:var(--border-soft)] bg-white text-[var(--text-soft)]"}`} key={status} onClick={() => setDraftStatus(status)} type="button">
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white" onClick={onSave} type="button">
              {!draft.id ? "Create category" : "Update category"}
            </button>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
