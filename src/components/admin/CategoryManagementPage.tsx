import { useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, SimpleTable } from "./PageScaffold";

type CategoryRecord = {
  id: number;
  name: string;
  stalls: string;
  status: "Active" | "Draft";
  events: string[];
};

const initialCategories: CategoryRecord[] = [
  { id: 1, name: "Handloom and textile brands", stalls: "72", status: "Active", events: ["Swadeshi Mela - Indore 2026", "Winter Craft Bazaar 2025"] },
  { id: 2, name: "Handicrafts and decor", stalls: "60", status: "Active", events: ["Swadeshi Mela - Indore 2026"] },
  { id: 3, name: "Food court and regional snacks", stalls: "54", status: "Active", events: ["Swadeshi Mela - Indore 2026", "National Food Utsav 2026"] },
  { id: 4, name: "Wellness and ayurveda", stalls: "24", status: "Active", events: ["National Wellness Expo 2026"] },
  { id: 5, name: "Books and stationery", stalls: "18", status: "Active", events: ["Swadeshi Mela - Indore 2026"] },
  { id: 6, name: "Organic and village products", stalls: "32", status: "Active", events: ["Winter Craft Bazaar 2025", "National Wellness Expo 2026"] },
  { id: 7, name: "Home utility and bamboo crafts", stalls: "20", status: "Active", events: [] },
];

const linkedEvents = [
  ["Swadeshi Mela - Indore 2026", "14 May 2026", "4 categories linked"],
  ["Winter Craft Bazaar 2025", "12 Dec 2025", "2 categories linked"],
  ["National Food Utsav 2026", "21 Jun 2026", "1 category linked"],
  ["National Wellness Expo 2026", "04 Aug 2026", "1 category linked"],
];

export function CategoryManagementPage() {
  const pageSize = 3;
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number>(initialCategories[0].id);
  const [draft, setDraft] = useState<Omit<CategoryRecord, "events">>({
    id: initialCategories[0].id,
    name: initialCategories[0].name,
    stalls: initialCategories[0].stalls,
    status: initialCategories[0].status,
  });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? categories[0],
    [categories, selectedId],
  );
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return categories.slice(startIndex, startIndex + pageSize);
  }, [categories, pageSize, safeCurrentPage]);

  const totalStalls = categories.reduce((sum, category) => sum + (Number(category.stalls) || 0), 0);

  const startCreate = () => {
    setSelectedId(-1);
    setDraft({ id: -1, name: "", stalls: "", status: "Active" });
  };

  const startEdit = (category: CategoryRecord) => {
    const pageForCategory = Math.floor(categories.findIndex((item) => item.id === category.id) / pageSize) + 1;
    if (pageForCategory > 0) {
      setCurrentPage(pageForCategory);
    }
    setSelectedId(category.id);
    setDraft({
      id: category.id,
      name: category.name,
      stalls: category.stalls,
      status: category.status,
    });
  };

  const saveCategory = () => {
    if (!draft.name.trim()) return;

    if (draft.id === -1) {
      const nextCategory: CategoryRecord = {
        id: Date.now(),
        name: draft.name.trim(),
        stalls: draft.stalls || "0",
        status: draft.status,
        events: [],
      };

      setCategories((current) => [nextCategory, ...current]);
      setCurrentPage(1);
      startEdit(nextCategory);
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === draft.id
          ? {
              ...category,
              name: draft.name.trim(),
              stalls: draft.stalls || "0",
              status: draft.status,
            }
          : category,
      ),
    );
  };

  const deleteCategory = (id: number) => {
    const remaining = categories.filter((category) => category.id !== id);
    if (!remaining.length) return;

    setCategories(remaining);
    const nextTotalPages = Math.max(1, Math.ceil(remaining.length / pageSize));
    setCurrentPage((current) => Math.min(current, nextTotalPages));
    if (selectedId === id) {
      startEdit(remaining[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="bg-admin-panel rounded-[22px] border border-[color:var(--border-soft)] p-4 sm:rounded-[24px] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-main)]">Category Master List</h3>
              <p className="mt-1 text-sm text-[var(--text-soft)]">Master categories available for event mapping and stall allocation.</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-4 py-2.5 text-sm font-semibold text-white"
              onClick={startCreate}
              type="button"
            >
              <Plus className="h-4 w-4" />
              New category
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {paginatedCategories.map((category) => {
              const isSelected = category.id === selectedId;

              return (
                <div
                  className={`rounded-[18px] border px-4 py-3 transition ${
                    isSelected
                      ? "border-[rgba(180,79,5,0.24)] bg-[linear-gradient(135deg,rgba(217,106,20,0.1),rgba(136,38,63,0.06))]"
                      : "border-[color:var(--border-soft)] bg-white/70"
                  }`}
                  key={category.id}
                >
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--text-main)]">{category.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-soft)]"
                        onClick={() => startEdit(category)}
                        type="button"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(136,38,63,0.18)] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent)]"
                        onClick={() => deleteCategory(category.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-soft)]">
              Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, categories.length)} of {categories.length} categories
            </p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className={`rounded-full ${
                        page === safeCurrentPage
                          ? "border-[rgba(180,79,5,0.24)] bg-[linear-gradient(135deg,rgba(217,106,20,0.12),rgba(136,38,63,0.1))] text-[var(--brand)]"
                          : "border border-[color:var(--border-soft)] bg-white/70 text-[var(--text-soft)]"
                      }`}
                      href="#"
                      isActive={page === safeCurrentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    className={`rounded-full border border-[color:var(--border-soft)] bg-white/70 ${safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <Card title={draft.id === -1 ? "Create Category" : "Edit Category"} subtitle="Create, update, or maintain the selected master category.">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Category name</p>
              <Input
                className="h-12 rounded-[16px] border-[color:var(--border-soft)] bg-white text-[var(--text-main)]"
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter category name"
                value={draft.name}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">Status</p>
              <div className="flex gap-3">
                {(["Active"] as const).map((status) => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      draft.status === status
                        ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white"
                        : "border border-[color:var(--border-soft)] bg-white text-[var(--text-soft)]"
                    }`}
                    key={status}
                    onClick={() => setDraft((current) => ({ ...current, status }))}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
              onClick={saveCategory}
              type="button"
            >
              {draft.id === -1 ? "Create category" : "Update category"}
            </button>
          </div>
        </Card>
      </div>

      <SimpleTable
        title="Event List Using Categories"
        headers={["Event", "Start Date", "Category Usage"]}
        rows={linkedEvents}
      />
    </div>
  );
}
