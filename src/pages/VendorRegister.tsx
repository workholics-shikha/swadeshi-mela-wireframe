import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const inputClassName =
  "w-full rounded-2xl border border-[color:var(--visitor-border)] bg-white px-4 py-3 text-sm text-[var(--visitor-ink)] outline-none transition focus:border-[var(--visitor-brand)] focus:ring-4 focus:ring-[var(--visitor-brand)]/10";
const selectClassName = `${inputClassName} cursor-pointer appearance-none pr-14 font-semibold bg-[linear-gradient(180deg,#ffffff_0%,#f7f1ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]`;

const vendorCategories = ["Handloom & Textile", "Handicraft", "Food & Beverage", "Home Decor", "Wellness"];
const preferredZones = ["Zone A - Textile Promenade", "Zone B - Craft Court", "Zone C - Food Street", "Zone D - Lifestyle Bazaar"];

function SelectField({ id, label, options, placeholder }: { id: string; label: string; options: string[]; placeholder: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor={id}>{label}</label>
      <select className={selectClassName} defaultValue="" id={id}>
        <option disabled value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const VendorRegister = () => {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f5ff_0%,#eef5ff_54%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-80 w-80 rounded-full bg-[rgba(157,78,221,0.12)] blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-[rgba(77,150,255,0.14)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-[rgba(255,107,107,0.08)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-[32px] border border-[color:var(--visitor-border)] bg-white/94 p-6 shadow-[0_24px_70px_rgba(77,150,255,0.12)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--visitor-brand)_0%,var(--visitor-brand-deep)_100%)] text-lg font-extrabold text-white shadow-[0_16px_32px_rgba(77,150,255,0.24)]">S</div>
              <div>
                <p className="text-lg font-extrabold text-[var(--visitor-ink)]">Swadeshi Mela</p>
                <p className="text-sm text-[var(--visitor-soft)]">Vendor registration</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center rounded-full border border-[color:var(--visitor-border)] bg-[var(--visitor-panel)] px-4 py-2 text-sm font-semibold text-[var(--visitor-soft)] transition hover:border-[var(--visitor-brand)]/30 hover:text-[var(--visitor-ink)]" onClick={() => navigate("/")} type="button">Back to site</button>
              <button className="inline-flex items-center justify-center rounded-full border border-[color:var(--visitor-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--visitor-ink)] transition hover:bg-[var(--visitor-brand-soft)]" onClick={() => navigate("/vendor/login")} type="button">Vendor sign in</button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[var(--visitor-brand)]">Registration form</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-[var(--visitor-ink)] sm:text-5xl">Register your business</h1>
              <p className="mt-4 text-sm leading-7 text-[var(--visitor-soft)] sm:text-base">Share the essential business details below to begin review and vendor onboarding for the mela.</p>
            </div>
            <div className="rounded-full border border-[color:var(--visitor-border)] bg-[var(--visitor-brand-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--visitor-brand)]">Review required</div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="businessName">Business name</label>
                <input className={inputClassName} id="businessName" placeholder="Meena Crafts Pvt Ltd" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="contactPerson">Contact person</label>
                <input className={inputClassName} id="contactPerson" placeholder="Meena Sharma" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="businessEmail">Business email</label>
                <input className={inputClassName} id="businessEmail" placeholder="hello@meenacrafts.in" type="email" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="phoneNumber">Mobile number</label>
                <input className={inputClassName} id="phoneNumber" placeholder="+91 98765 43210" type="tel" />
              </div>
              <SelectField id="businessCategory" label="Business category" options={vendorCategories} placeholder="Select category" />
              <SelectField id="preferredZone" label="Preferred mela zone" options={preferredZones} placeholder="Select preferred zone" />
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="city">City</label>
                <input className={inputClassName} id="city" placeholder="Indore" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="gstin">GSTIN / Trade license</label>
                <input className={inputClassName} id="gstin" placeholder="23ABCDE1234F1Z5" type="text" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--visitor-ink)]" htmlFor="businessSummary">Business summary</label>
              <textarea className={`${inputClassName} min-h-32 resize-none`} id="businessSummary" placeholder="Tell us about your products, price range, and what you plan to present during the mela." />
            </div>
            <div className="flex items-start gap-3 rounded-[22px] border border-[color:var(--visitor-border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f1ff_100%)] px-4 py-4 text-sm leading-7 text-[var(--visitor-soft)]">
              <input className="mt-1 accent-[var(--visitor-brand)]" defaultChecked type="checkbox" />
              <span>I confirm that the submitted business information is accurate and I agree to the mela registration, review, and communication terms.</span>
            </div>
            <div className="flex flex-col gap-4 border-t border-[color:var(--visitor-border)] pt-5">
              <p className="w-full text-sm leading-7 text-[var(--visitor-soft)]">Registration requests are reviewed before stall selection and payment activation are opened.</p>
              <button className="inline-flex self-start rounded-2xl bg-[linear-gradient(135deg,var(--visitor-brand)_0%,var(--visitor-brand-deep)_100%)] px-6 py-3 text-center text-sm font-extrabold text-white shadow-[0_18px_34px_rgba(77,150,255,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(157,78,221,0.24)]" type="submit">Submit vendor registration</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
