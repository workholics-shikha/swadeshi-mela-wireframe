import { useMemo, useState } from "react";
import { Card } from "./PageScaffold";
import type { SetPage } from "./types";

const eventOptions = [
  { id: "2026-main", label: "Swadeshi Mela 2026 - Main Ground" },
  { id: "2026-winter", label: "Swadeshi Mela 2026 - Winter Edition" },
  { id: "2025", label: "Swadeshi Mela 2025 - City Expo" },
] as const;

const stallOptionsByEvent: Record<(typeof eventOptions)[number]["id"], string[]> = {
  "2026-main": ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06"],
  "2026-winter": ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06"],
  "2025": ["C-01", "C-02", "C-03", "C-04", "C-05", "C-06"],
};

export function BookingCreatePage({ setPage }: { setPage: SetPage }) {
  const [selectedEventId, setSelectedEventId] = useState<(typeof eventOptions)[number]["id"]>(eventOptions[0].id);
  const [selectedStall, setSelectedStall] = useState(stallOptionsByEvent[eventOptions[0].id][0]);
  const [vendorName, setVendorName] = useState("Meena Crafts Pvt Ltd");
  const [ownerName, setOwnerName] = useState("Meena Sharma");
  const [email, setEmail] = useState("meena@crafts.in");
  const [phone, setPhone] = useState("+91 98XXXXXXXX");
  const [gstNumber, setGstNumber] = useState("23ABCDE1234F1Z5");
  const [city, setCity] = useState("Indore");
  const [note, setNote] = useState("Vendor called support desk and requested assisted booking for premium textile stalls.");
  const stallsForSelectedEvent = useMemo(() => stallOptionsByEvent[selectedEventId], [selectedEventId]);

  function handleEventChange(value: (typeof eventOptions)[number]["id"]) {
    setSelectedEventId(value);
    setSelectedStall(stallOptionsByEvent[value][0]);
  }

  return (
    <div className="space-y-6">
      <section className="bg-admin-panel rounded-[24px] border border-[color:var(--border-soft)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Create booking</p>
            <h3 className="mt-1 font-display text-3xl text-[var(--text-main)]">Admin Booking Form</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">Create a booking on behalf of vendor and capture complete vendor details.</p>
          </div>
          <button
            className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--text-soft)]"
            onClick={() => setPage("bookings")}
            type="button"
          >
            Back to bookings
          </button>
        </div>
      </section>

      <Card title="Booking details" subtitle="Select event and stall allocation details for this booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-event">
              Event
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="create-booking-event"
              onChange={(event) => handleEventChange(event.target.value as (typeof eventOptions)[number]["id"])}
              value={selectedEventId}
            >
              {eventOptions.map((eventOption) => (
                <option key={eventOption.id} value={eventOption.id}>
                  {eventOption.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-stall">
              Stall
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="create-booking-stall"
              onChange={(event) => setSelectedStall(event.target.value)}
              value={selectedStall}
            >
              {stallsForSelectedEvent.map((stall) => (
                <option key={stall} value={stall}>
                  {stall}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-type">
              Booking Type
            </label>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              id="create-booking-type"
              readOnly
              type="text"
              value="Admin booking on behalf of vendor"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-payment">
              Payment Plan
            </label>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              id="create-booking-payment"
              readOnly
              type="text"
              value="Manual invoice settlement"
            />
          </div>
        </div>
      </Card>

      <Card title="Vendor details" subtitle="Store vendor profile and contact details for this booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-vendor">
              Vendor Name
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-vendor" onChange={(event) => setVendorName(event.target.value)} type="text" value={vendorName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-owner">
              Business Owner
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-owner" onChange={(event) => setOwnerName(event.target.value)} type="text" value={ownerName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-email">
              Email
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-phone">
              Phone
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-phone" onChange={(event) => setPhone(event.target.value)} type="text" value={phone} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-gst">
              GST Number
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-gst" onChange={(event) => setGstNumber(event.target.value)} type="text" value={gstNumber} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-city">
              City
            </label>
            <input className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none" id="create-booking-city" onChange={(event) => setCity(event.target.value)} type="text" value={city} />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-note">
            Booking Note
          </label>
          <textarea
            className="min-h-24 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            id="create-booking-note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>
      </Card>

      <section className="bg-admin-panel flex flex-wrap items-center justify-end gap-3 rounded-[24px] border border-[color:var(--border-soft)] p-5">
        <button
          className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--text-soft)]"
          onClick={() => setPage("bookings")}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white"
          type="button"
        >
          Create booking
        </button>
      </section>
    </div>
  );
}
