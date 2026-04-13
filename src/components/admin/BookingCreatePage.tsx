import { useEffect, useMemo, useState } from "react";
import { Card } from "./PageScaffold";
import type { SetPage } from "./types";
import { getEvents, getZones, getCategories, createBooking, type EventItem, type ZoneItem, type Category } from "@/lib/domainApi";

// Generate mock stalls for a zone (in real app, this would come from API)
function generateStallsForZone(zoneName: string, count: number): string[] {
  const stalls: string[] = [];
  const prefix = zoneName.charAt(0).toUpperCase();
  
  for (let i = 1; i <= count; i++) {
    // Mix different naming patterns for variety
    const pattern = i % 3;
    let stallName: string;
    
    if (pattern === 0) {
      // Pattern: "A-1", "B-2", etc.
      stallName = `${prefix}-${i}`;
    } else if (pattern === 1) {
      // Pattern: "Zone A", "Zone B", etc.
      stallName = `Zone ${prefix}-${i}`;
    } else {
      // Pattern: "A-1", "A-2", etc. (simple)
      stallName = `${prefix}-${i}`;
    }
    
    stalls.push(stallName);
  }
  return stalls;
}

export function BookingCreatePage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStall, setSelectedStall] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [vendorName, setVendorName] = useState("Meena Crafts Pvt Ltd");
  const [ownerName, setOwnerName] = useState("Meena Sharma");
  const [email, setEmail] = useState("meena@crafts.in");
  const [phone, setPhone] = useState("+91 98XXXXXXXX");
  const [gstNumber, setGstNumber] = useState("23ABCDE1234F1Z5");
  const [city, setCity] = useState("Indore");
  const [stallSize, setStallSize] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState("manual");
  const [paymentRef, setPaymentRef] = useState("");
  const [note, setNote] = useState("Vendor called support desk and requested assisted booking for premium textile stalls.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEvents().then((rows) => {
      setEvents(rows);
      if (rows[0]) setSelectedEventId(rows[0]._id);
    });
    
    // Fetch categories for stall categories
    getCategories().then((data) => {
      const stallCategories = data.filter(cat => cat.type === "stall" && cat.status === "active");
      setCategories(stallCategories);
      if (stallCategories[0]) setSelectedCategory(stallCategories[0]._id);
    }).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    getZones(selectedEventId).then((rows) => {
      setZones(rows);
      if (rows[0]) {
        setSelectedZone(rows[0]._id);
        // Set default stall for the first zone
        const zone = rows[0];
        const stalls = generateStallsForZone(zone.zoneName, 10);
        if (stalls.length > 0) setSelectedStall(stalls[0]);
      }
    });
  }, [selectedEventId]);

  function handleEventChange(value: string) {
    setSelectedEventId(value);
    setSelectedZone("");
    setSelectedStall("");
  }

  function handleZoneChange(value: string) {
    setSelectedZone(value);
    // Generate stalls for the selected zone
    const zone = zones.find(z => z._id === value);
    if (zone) {
      const stalls = generateStallsForZone(zone.zoneName, 10 + Math.floor(Math.random() * 10)); // 10-20 stalls
      if (stalls.length > 0) {
        setSelectedStall(stalls[0]);
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedEventId || !selectedZone || !selectedStall || !selectedCategory || !vendorName || !email || !phone || !gstNumber || !city) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        vendorName,
        vendorEmail: email,
        mobile: phone,
        businessName: vendorName,
        eventId: selectedEventId,
        zoneId: selectedZone,
        categoryId: selectedCategory,
        stallSize,
        quantity,
        paymentMode,
        paymentRef,
        stallNumber: selectedStall,
        note
      });
      
      alert("Booking created successfully!");
      // Reset form
      setVendorName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setGstNumber("");
      setCity("");
      setStallSize("standard");
      setQuantity(1);
      setPaymentMode("manual");
      setPaymentRef("");
      setNote("");
      setSelectedStall("");
    } catch (error) {
      alert("Failed to create booking: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(event) => handleEventChange(event.target.value)}
              value={selectedEventId}
            >
              {events.map((eventOption) => (
                <option key={eventOption._id} value={eventOption._id}>
                  {eventOption.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-zone">
              Zone
            </label>
             <select
               className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
               id="create-booking-zone"
               onChange={(event) => handleZoneChange(event.target.value)}
               value={selectedZone}
             >
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.zoneName}
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
               disabled={!selectedZone}
             >
               {!selectedZone ? (
                 <option value="">Select a zone first</option>
               ) : (
                 generateStallsForZone(
                   zones.find(z => z._id === selectedZone)?.zoneName || "Z",
                   10 + Math.floor(Math.random() * 10)
                 ).map((stall) => (
                   <option key={stall} value={stall}>
                     {stall}
                   </option>
                 ))
               )}
             </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-category">
              Category
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="create-booking-category"
              onChange={(event) => setSelectedCategory(event.target.value)}
              value={selectedCategory}
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-stall-size">
              Stall Size
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="create-booking-stall-size"
              onChange={(event) => setStallSize(event.target.value)}
              value={stallSize}
            >
              <option value="small">Small (6x6 ft)</option>
              <option value="standard">Standard (10x10 ft)</option>
              <option value="large">Large (12x12 ft)</option>
              <option value="premium">Premium (15x15 ft)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-quantity">
              Quantity
            </label>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              id="create-booking-quantity"
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              min="1"
              value={quantity}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-payment-mode">
              Payment Mode
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="create-booking-payment-mode"
              onChange={(event) => setPaymentMode(event.target.value)}
              value={paymentMode}
            >
              <option value="manual">Manual Invoice</option>
              <option value="online">Online Payment</option>
              <option value="offline">Offline Payment</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-payment-ref">
              Payment Reference
            </label>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none"
              id="create-booking-payment-ref"
              onChange={(event) => setPaymentRef(event.target.value)}
              type="text"
              value={paymentRef}
              placeholder="Transaction ID or Reference Number"
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
          className="rounded-full bg-[linear-gradient(135deg,hsl(var(--saffron)),hsl(var(--maroon)))] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? "Creating..." : "Create booking"}
        </button>
      </section>
    </div>
  );
}