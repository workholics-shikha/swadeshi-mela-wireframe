import { useNavigate } from "react-router-dom";

type HeaderProps = { title: string; description: string };

export function Header({ title, description }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="border-b border-[color:var(--border-soft)] bg-[var(--panel)]/95 px-3 py-2 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between lg:min-h-[84px]">
        <div className="min-w-0">
          <h1 className="font-display text-xl text-[var(--text-main)] sm:text-2xl">{title}</h1>
          <p className="text-sm leading-6 text-[var(--text-soft)]">{description}</p>
        </div>
        <button className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] sm:w-auto" onClick={() => navigate("/")} type="button">Back to site</button>
      </div>
    </header>
  );
}
