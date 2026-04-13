import { useEffect, useMemo, useState } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { createBooking, getCategories, getEvents, getZones, type Category, type EventItem, type ZoneItem } from "@/lib/domainApi";

const steps = ["OTP Verification", "Business Details", "Stall Selection", "Payment"];
const stallSizes = ["6×6 ft", "9×9 ft", "12×12 ft"];
const states = ["Madhya Pradesh", "Delhi", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "West Bengal", "Other"];

const StallBookingForm = () => {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", businessName: "", gst: "", address: "", city: "",
    state: "", pincode: "", selectedEvent: "", selectedZone: "", stallCategory: "", stallSize: "", quantity: "1",
    paymentMode: "mock", transactionId: "",
  });

  useEffect(() => {
    getEvents().then(setEvents);
    getCategories().then((rows) => setCategories(rows.filter((c) => c.type === "stall" && c.status === "active")));
  }, []);

  useEffect(() => {
    if (!form.selectedEvent) {
      setZones([]);
      setForm((current) => ({ ...current, selectedZone: "", stallCategory: "" }));
      return;
    }
    setForm((current) => ({ ...current, selectedZone: "", stallCategory: "" }));
    getZones(form.selectedEvent).then((items) => setZones(items.filter((z) => z.status === "active")));
  }, [form.selectedEvent]);

  const filteredCategories = useMemo(() => {
    if (!form.selectedEvent) return [];
    const selectedEvent = events.find((event) => event._id === form.selectedEvent);
    const mappedCategoryNames = new Set(
      (selectedEvent?.categoryZoneMappings || [])
        .map((row) => row.categoryName?.trim())
        .filter((name): name is string => Boolean(name)),
    );
    if (!mappedCategoryNames.size) {
      return categories;
    }
    return categories.filter((category) => mappedCategoryNames.has(category.name));
  }, [categories, events, form.selectedEvent]);

  useEffect(() => {
    if (!form.stallCategory) return;
    if (filteredCategories.some((category) => category._id === form.stallCategory)) return;
    setForm((current) => ({ ...current, stallCategory: "" }));
  }, [filteredCategories, form.stallCategory]);

  const update = (field: string, value: string | File | null) => setForm((f) => ({ ...f, [field]: value }));
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <section id="booking" className="py-20 md:py-28 bg-background">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Booking</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
            Book Your Stall
          </h2>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-secondary text-secondary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < step ? "bg-secondary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-6 md:p-10">
          {/* Step 0: OTP */}
          {step === 0 && (
            <div className="space-y-5 max-w-md mx-auto">
              <div>
                <label className={labelClass}>Mobile Number *</label>
                <input type="tel" className={inputClass} placeholder="+91 98765 43210" value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)} />
              </div>
              {!otpSent ? (
                <button onClick={() => setOtpSent(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
                  Send OTP
                </button>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Enter OTP</label>
                    <input type="text" className={inputClass} placeholder="Enter 6-digit OTP" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value)} />
                  </div>
                  <button onClick={next} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold" disabled={otp.length < 4}>
                    Verify & Continue
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Full Name *", field: "name", type: "text", placeholder: "Rajesh Kumar" },
                { label: "Email *", field: "email", type: "email", placeholder: "rajesh@example.com" },
                { label: "Business Name *", field: "businessName", type: "text", placeholder: "Kumar Handicrafts" },
                { label: "GST Number (Optional)", field: "gst", type: "text", placeholder: "22AAAAA0000A1Z5" },
              ].map((f) => (
                <div key={f.field}>
                  <label className={labelClass}>{f.label}</label>
                  <input type={f.type} className={inputClass} placeholder={f.placeholder}
                    value={form[f.field as "name" | "email" | "businessName" | "gst"]} onChange={(e) => update(f.field, e.target.value)} />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className={labelClass}>Address *</label>
                <input type="text" className={inputClass} placeholder="Full address" value={form.address}
                  onChange={(e) => update("address", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input type="text" className={inputClass} placeholder="City" value={form.city}
                  onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <select className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)}>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input type="text" className={inputClass} placeholder="110001" value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Stall Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Event *</label>
                <select className={inputClass} value={form.selectedEvent} onChange={(e) => update("selectedEvent", e.target.value)}>
                  <option value="">Select Event</option>
                  {events.map((eventName) => <option key={eventName._id} value={eventName._id}>{eventName.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zone *</label>
                <select className={inputClass} value={form.selectedZone} onChange={(e) => update("selectedZone", e.target.value)}>
                  <option value="">Select Zone</option>
                  {zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.zoneName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Stall Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredCategories.map((c) => (
                    <button key={c._id} onClick={() => update("stallCategory", c._id)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        form.stallCategory === c._id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                {form.selectedEvent && filteredCategories.length === 0 ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">No stall categories configured for selected event.</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Stall Size *</label>
                  <select className={inputClass} value={form.stallSize} onChange={(e) => update("stallSize", e.target.value)}>
                    <option value="">Select Size</option>
                    {stallSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min={1} className={inputClass} value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Booking Type</label>
                  <input className={inputClass} value="Standard" disabled />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-5 max-w-md mx-auto">
              <div>
                <label className={labelClass}>Payment Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  {["mock", "UPI", "NEFT/RTGS", "Bank Transfer"].map((m) => (
                    <button key={m} onClick={() => update("paymentMode", m)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        form.paymentMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Transaction ID / Reference</label>
                <input type="text" className={inputClass} placeholder="Enter transaction reference" value={form.transactionId}
                  onChange={(e) => update("transactionId", e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <button onClick={prev} className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button onClick={next} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity"
                  onClick={async () => {
                    setMessage("");
                    try {
                      await createBooking({
                        vendorName: form.name,
                        vendorEmail: form.email,
                        mobile: form.mobile,
                        businessName: form.businessName,
                        eventId: form.selectedEvent,
                        zoneId: form.selectedZone,
                        categoryId: form.stallCategory,
                        stallSize: form.stallSize,
                        quantity: Number(form.quantity),
                        paymentMode: form.paymentMode,
                        paymentRef: form.transactionId,
                      });
                      setMessage("Booking request submitted with pending status.");
                      setStep(0);
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "Failed to submit booking");
                    }
                  }}
                >
                  <Check className="w-4 h-4" /> Submit Booking
                </button>
              )}
            </div>
          )}
          {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
        </div>
      </div>
    </section>
  );
};

export default StallBookingForm;
