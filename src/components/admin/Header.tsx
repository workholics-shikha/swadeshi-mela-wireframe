import { useNavigate } from "react-router-dom";

type HeaderProps = { title: string; description: string };

export function Header({ title, description }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="px-3 pt-3 sm:px-6 sm:pt-6 lg:px-8">
      <div className="bg-admin-panel border border-[color:var(--border-soft)] px-4 py-4 sm:rounded-[28px] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between lg:min-h-[96px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Festival operations console</p>
            <h1 className="mt-2 font-display text-2xl text-[var(--text-main)] sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-soft)]">{description}</p>
          </div>
          <button className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 sm:w-auto" onClick={() => navigate("/")} type="button">Back to site</button>
        </div>
      </div>
    </header>
  );
}
