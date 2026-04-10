import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const inputClassName =
  "w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.15)]";

const VendorLogin = () => {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/admin");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-festive-admin px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[hsl(var(--gold)/0.24)] blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-[hsl(var(--green-india)/0.16)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-[hsl(var(--maroon)/0.12)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
        <div className="w-full rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.92)] p-6 shadow-elevated backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] text-lg font-extrabold text-white shadow-[0_16px_32px_hsl(var(--maroon)/0.22)]">
                S
              </div>
              <div>
                <p className="text-lg font-extrabold text-[hsl(var(--foreground))]">Swadeshi Mela</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Vendor sign in</p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary)/0.45)] hover:text-[hsl(var(--foreground))]"
              onClick={() => navigate("/")}
              type="button"
            >
              Back to site
            </button>
          </div>

          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
              Vendor portal
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
              Sign in to continue
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
              Use your approved vendor account to review updates, registration progress, and next steps for the mela.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="vendorEmail">
                Business email
              </label>
              <input className={inputClassName} defaultValue="vendor@swadeshimela.in" id="vendorEmail" placeholder="business@example.com" type="email" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="vendorPassword">
                Password
              </label>
              <input className={inputClassName} defaultValue="password123" id="vendorPassword" placeholder="Enter your password" type="password" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                <input className="accent-[hsl(var(--primary))]" defaultChecked type="checkbox" />
                Keep me signed in
              </label>
              <button className="font-semibold text-[hsl(var(--primary))]" type="button">Need help?</button>
            </div>
            <button
              className="w-full rounded-2xl bg-[linear-gradient(135deg,hsl(var(--saffron))_0%,hsl(var(--maroon))_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_34px_hsl(var(--maroon)/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_hsl(var(--maroon)/0.26)]"
              type="submit"
            >
              Sign in to vendor portal
            </button>
          </form>
 
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
