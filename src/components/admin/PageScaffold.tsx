import type { ReactNode } from "react";

export function PageHero({ title, description, actions }: { title: string; description: string; actions: string[] }) {
  return (
    <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--panel)] p-4 shadow-[0_10px_30px_rgba(26,23,20,0.04)] sm:rounded-[28px] sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-display text-3xl text-[var(--text-main)] sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)]">{description}</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {actions.map((action, index) => (
            <button className={`rounded-full px-4 py-2 text-sm font-semibold sm:w-auto ${index === actions.length - 1 ? "bg-[var(--brand)] text-white" : "border border-[color:var(--border-soft)] bg-[var(--shell-bg)] text-[var(--text-soft)]"}`} key={action} type="button">{action}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--panel)] p-4 sm:rounded-[24px] sm:p-6">
      <h3 className="text-xl font-semibold text-[var(--text-main)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-soft)]">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function FormGrid({ fields }: { fields: [string, string][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label}>
          <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">{label}</p>
          <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] px-4 py-3 text-sm text-[var(--text-soft)]">{value}</div>
        </div>
      ))}
    </div>
  );
}

export function TextArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-semibold text-[var(--text-main)]">{label}</p>
      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] px-4 py-4 text-sm leading-7 text-[var(--text-soft)]">{value}</div>
    </div>
  );
}

export function InfoList({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-3">
      {items.map(([label, value]) => (
        <div className="flex flex-col gap-1 rounded-[18px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={label}>
          <span className="text-sm text-[var(--text-soft)]">{label}</span>
          <span className="text-sm font-semibold text-[var(--text-main)]">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ActionList({ actions }: { actions: string[] }) {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] px-4 py-4 text-sm leading-7 text-[var(--text-soft)]" key={action}>{action}</div>
      ))}
    </div>
  );
}

export function StatsRow({ stats }: { stats: [string, string][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(([label, value]) => (
        <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] p-4" key={label}>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function SimpleTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[var(--panel)]">
      <div className="border-b border-[color:var(--border-soft)] px-4 py-4 sm:px-6 sm:py-5">
        <h3 className="text-xl font-semibold text-[var(--text-main)]">{title}</h3>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div className="rounded-[18px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] p-4" key={rowIndex}>
            {headers.map((header, index) => (
              <div className="flex items-start justify-between gap-4 py-1.5" key={index}>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{header}</span>
                <span className={`text-right text-sm ${index === 0 ? "font-medium text-[var(--text-main)]" : "text-[var(--text-soft)]"}`}>{row[index]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left">
          <thead className="bg-[var(--shell-bg)] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <tr>{headers.map((h) => <th className="px-4 py-3 font-semibold" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr className="border-t border-[color:var(--border-soft)]" key={i}>
                {row.map((cell, j) => <td className={`px-4 py-3 text-sm ${j === 0 ? "font-medium text-[var(--text-main)]" : "text-[var(--text-soft)]"}`} key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function JumpButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="w-full rounded-[20px] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] px-4 py-4 text-left text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]" onClick={onClick} type="button">{label}</button>
  );
}
