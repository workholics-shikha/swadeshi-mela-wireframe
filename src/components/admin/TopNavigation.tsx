type TopNavigationProps = {
  activeItem: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onSelect: (id: string) => void;
};

export function TopNavigation({ activeItem, items, onSelect }: TopNavigationProps) {
  return (
    <nav className="px-3 py-3 sm:px-6 lg:px-8">
      <div className="bg-admin-soft flex flex-wrap gap-2 rounded-[24px] border border-[color:var(--border-soft)] px-3 py-3 sm:px-4">
        {items.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <button className={`rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${isActive ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white shadow-[0_18px_26px_-22px_rgba(136,38,63,0.9)]" : "bg-white/70 text-[var(--text-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"}`} key={item.id} onClick={() => onSelect(item.id)} type="button">{item.label}</button>
          );
        })}
      </div>
    </nav>
  );
}
