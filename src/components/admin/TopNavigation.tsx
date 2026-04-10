type TopNavigationProps = {
  activeItem: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onSelect: (id: string) => void;
};

export function TopNavigation({ activeItem, items, onSelect }: TopNavigationProps) {
  return (
    <nav className="border-b border-[color:var(--border-soft)] bg-[var(--panel)] px-3 py-1.5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <button className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--shell-bg)] text-[var(--text-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"}`} key={item.id} onClick={() => onSelect(item.id)} type="button">{item.label}</button>
          );
        })}
      </div>
    </nav>
  );
}
