import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const inputClassName =
  "w-full rounded-2xl border border-[color:var(--visitor-border)] bg-white px-4 py-3 text-sm text-[var(--visitor-ink)] outline-none transition focus:border-[var(--visitor-brand)] focus:ring-4 focus:ring-[var(--visitor-brand)]/10";

const VendorLogin = () => {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/admin");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f5ff_0%,#eef5ff_54%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[rgba(157,78,221,0.12)] blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-[rgba(77,150,255,0.14)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-[rgba(255,107,107,0.09)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
        <div className="w-full rounded-[32px] border border-[color:var(--visitor-border)] bg-white/92 p-6 shadow-[0_24px_70px_rgba(77,150,255,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--visitor-brand)_0%,var(--visitor-brand-deep)_100%)] text-lg font-extrabold text-white shadow-[0_16px_32px_rgba(77,150,255,0.24)]">
                S
              </div>
              <div>
                <p className="text-lg font-extrabold text-[var(--visitor-ink)]">Swadeshi Mela</p>
                <p className="text-sm text-[var(--visitor-soft)]">Vendor sign in</p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--visitor-border)] bg-[var(--visitor-panel)] px-4 py-2 text-sm font-semibold text-[var(--visitor-soft)] transition hover:border-[var(--visitor-brand)]/30 hover:text-[var(--visitor-ink)]"
              onClick={() => navigate("/")}
              type="button"
            >
              Back to site
            </button>
          </div>

          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[var(--visitor-brand)]">
              Vendor portal
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-[var(--visitor-ink)] sm:text-5xl">
              Sign in to continue
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--visitor-soft)] sm:text-base">
              Use your approved vendor account to review updates, registration progress, and next steps for the mela.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="vendorEmail">
                Business email
              </label>
              <input className={inputClassName} defaultValue="vendor@swadeshimela.in" id="vendorEmail" placeholder="business@example.com" type="email" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="vendorPassword">
                Password
              </label>
              <input className={inputClassName} defaultValue="password123" id="vendorPassword" placeholder="Enter your password" type="password" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-[var(--visitor-soft)]">
                <input className="accent-[var(--visitor-brand)]" defaultChecked type="checkbox" />
                Keep me signed in
              </label>
              <button className="font-semibold text-[var(--visitor-brand)]" type="button">Need help?</button>
            </div>
            <button
              className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--visitor-brand)_0%,var(--visitor-brand-deep)_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_34px_rgba(77,150,255,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(157,78,221,0.24)]"
              type="submit"
            >
              Sign in to vendor portal
            </button>
          </form>

          <div className="mt-6 rounded-[24px] border border-[color:var(--visitor-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f1ff_100%)] px-5 py-4">
            <p className="text-sm font-semibold text-[var(--visitor-ink)]">New to the mela?</p>
            <p className="mt-1 text-sm leading-6 text-[var(--visitor-soft)]">
              Create a vendor registration to begin approval and stall onboarding.
            </p>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--visitor-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--visitor-ink)] transition hover:bg-[var(--visitor-brand-soft)]"
              onClick={() => navigate("/vendor/register")}
              type="button"
            >
              Open registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
