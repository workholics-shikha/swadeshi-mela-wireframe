import type { UserRole } from "./types";
import logo from "@/assets/logo.png";

type SidebarItem = { id: string; label: string; badge?: string };
type SidebarSection = { title: string; items: ReadonlyArray<SidebarItem> };

type SidebarProps = {
  activeItem: string;
  onSelect: (id: string) => void;
  role: UserRole;
  sections: ReadonlyArray<SidebarSection>;
};

const roleIdentity: Record<UserRole, { portalLabel: string; initials: string; name: string; title: string }> = {
  Admin: { portalLabel: "Admin Portal", initials: "RA", name: "Admin", title: "Super Admin" },
  Vendor: { portalLabel: "Vendor Portal", initials: "MC", name: "Meena Crafts", title: "Registered Vendor" },
};

export function Sidebar({ activeItem, onSelect, role, sections }: SidebarProps) {
  const identity = roleIdentity[role];
  return (
    <aside className="bg-admin-panel border-b border-[color:var(--border-soft)] lg:m-4 lg:min-h-[calc(100vh-2rem)] lg:w-80 lg:rounded-[32px] lg:border lg:border-b lg:border-r">
      <div className="border-b border-[color:var(--border-soft)] px-5 py-5 lg:flex lg:min-h-[116px] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] p-2 shadow-[0_18px_34px_-22px_rgba(136,38,63,0.75)]">
            <img src={logo} alt="Swadeshi Mela" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-[var(--text-main)]">Swadeshi Mela</div>
            <div className="text-sm font-medium text-[var(--text-soft)]">{identity.portalLabel}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto px-3 py-4 sm:px-4 sm:py-5 lg:block lg:space-y-6 lg:overflow-visible">
        {sections.map((section) => (
          <div className="min-w-44 sm:min-w-56 lg:min-w-0" key={section.title}>
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{section.title}</p>
            <div className="mt-3 space-y-1">
              {section.items.map((item) => {
                const isActive = item.id === activeItem;
                return (
                  <button className={`flex w-full items-center justify-between rounded-[20px] px-3 py-3 text-left text-sm transition ${isActive ? "bg-[linear-gradient(135deg,rgba(217,106,20,0.14),rgba(136,38,63,0.12))] text-[var(--brand)] shadow-[inset_0_0_0_1px_rgba(180,79,5,0.16)]" : "text-[var(--text-soft)] hover:bg-[var(--brand-accent)] hover:text-[var(--text-main)]"}`} key={item.id} onClick={() => onSelect(item.id)} type="button">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && <span className="rounded-full bg-[linear-gradient(135deg,hsl(var(--green-india)),hsl(var(--maroon)))] px-2 py-0.5 text-xs font-semibold text-white">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[color:var(--border-soft)] bg-[linear-gradient(180deg,transparent,rgba(217,106,20,0.05))] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(217,106,20,0.16),rgba(79,133,78,0.16))] font-semibold text-[var(--brand)]">{identity.initials}</div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-main)]">{identity.name}</p>
            <p className="text-xs text-[var(--text-soft)]">{identity.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
