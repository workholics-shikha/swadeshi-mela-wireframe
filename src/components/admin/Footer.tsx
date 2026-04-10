export function Footer({ pageLabel }: { pageLabel: string }) {
  return (
    <footer className="border-t border-[color:var(--border-soft)] bg-[var(--panel)] px-4 py-4 text-sm text-[var(--text-soft)] sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p>{pageLabel}.</p>
        <p>Indore, Madhya Pradesh | Event window: May 14-21, 2026</p>
      </div>
    </footer>
  );
}
