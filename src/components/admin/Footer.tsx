export function Footer({ pageLabel }: { pageLabel: string }) {
  return (
    <footer className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
      <div className="bg-admin-panel rounded-[24px] border border-[color:var(--border-soft)] px-4 py-4 text-sm text-[var(--text-soft)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>{pageLabel}.</p>
          <p>Indore, Madhya Pradesh | Event window: May 14-21, 2026</p>
        </div>
      </div>
    </footer>
  );
}
