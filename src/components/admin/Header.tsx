import { useNavigate } from "react-router-dom";
import { clearAuth } from "@/lib/auth";

type HeaderProps = {
  title: string;
  description: string;
  onAction?: (action: string) => void;
  overview?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    actions?: string[];
  };
};

export function Header({ title, description, overview, onAction }: HeaderProps) {
  const navigate = useNavigate();
  const displayEyebrow = overview?.eyebrow ?? "Festival operations console";
  const displayTitle = overview?.title ?? title;
  const displayDescription = overview?.description ?? description;
  const displayActions = overview?.actions ?? [];
  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="px-3 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-6 lg:px-8">
      <div className="bg-admin-panel border border-[color:var(--border-soft)] px-4 py-4 sm:rounded-[28px] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{displayEyebrow}</p>
            <h1 className="mt-2 font-display text-[2rem] leading-none text-[var(--text-main)] sm:text-[2.6rem]">{displayTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-soft)]">{displayDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {displayActions.map((action, index) => (
              <button
                className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                  index === displayActions.length - 1
                    ? "bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] text-white"
                    : "border border-[color:var(--border-soft)] bg-white/70 text-[var(--text-soft)]"
                }`}
                key={action}
                onClick={() => onAction?.(action)}
                type="button"
              >
                {action}
              </button>
            ))}
            <button
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--text-soft)] transition hover:bg-white"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95" onClick={() => navigate("/")} type="button">Back to site</button>
          </div>
        </div>
      </div>
    </header>
  );
}
