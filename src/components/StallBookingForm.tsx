import { useEffect, useMemo, useState, useCallback } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { createBooking, getCategories, getEvents, getZones, type Category, type EventItem, type ZoneItem } from "@/lib/domainApi";

const steps = ["OTP Verification", "Business Details", "Stall Selection", "Payment"];
const stallSizes = ["6×6 ft", "9×9 ft", "12×12 ft"];
const states = ["Madhya Pradesh", "Delhi", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "West Bengal", "Other"];

const StallBookingForm = () => {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
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

  const update = useCallback((field: string, value: string | File | null) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }, []);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Validation helpers
  const isEmpty = (value: string) => !value.trim();
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPincode = (pin: string) => /^\d{6}$/.test(pin);
  const isValidQuantity = (qty: string) => Number(qty) >= 1;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    switch (step) {
      case 0:
        const mobileDigits = form.mobile.replace(/\D/g, "");
        if (isEmpty(form.mobile)) {
          newErrors.mobile = "Mobile number is required";
          isValid = false;
        } else if (mobileDigits.length !== 10) {
          newErrors.mobile = "Mobile number must be 10 digits";
          isValid = false;
        }
        if (!otpSent) return false;
        if (isEmpty(otp)) {
          newErrors.otp = "OTP is required";
          isValid = false;
        } else if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
          newErrors.otp = "OTP must be 6 digits";
          isValid = false;
        }
        break;
      case 1:
        if (isEmpty(form.name)) newErrors.name = "Full name is required";
        if (isEmpty(form.email) || !isValidEmail(form.email)) newErrors.email = "Valid email is required";
        if (isEmpty(form.businessName)) newErrors.businessName = "Business name is required";
        if (isEmpty(form.address)) newErrors.address = "Address is required";
        if (isEmpty(form.city)) newErrors.city = "City is required";
        if (isEmpty(form.state)) newErrors.state = "State is required";
        if (isEmpty(form.pincode) || !isValidPincode(form.pincode)) newErrors.pincode = "Valid 6-digit pincode is required";
        break;
      case 2:
        if (isEmpty(form.selectedEvent)) newErrors.selectedEvent = "Event is required";
        if (isEmpty(form.selectedZone)) newErrors.selectedZone = "Zone is required";
        if (isEmpty(form.stallCategory)) newErrors.stallCategory = "Stall category is required";
        if (isEmpty(form.stallSize)) newErrors.stallSize = "Stall size is required";
        if (!isValidQuantity(form.quantity)) newErrors.quantity = "Quantity must be at least 1";
        break;
      case 3:
        if (isEmpty(form.paymentMode)) newErrors.paymentMode = "Payment mode is required";
        break;
    }

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  const handleVerifyAndContinue = () => {
    if (validateStep()) {
      next();
    }
  };


  const baseInputClass = "w-full px-4 py-3 rounded-lg border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const inputClass = (hasError = false) => `${baseInputClass} ${hasError ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : "border-border"}`;
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  const errorClass = "mt-1 text-xs text-red-500";


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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-secondary text-secondary-foreground" :
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
                <input type="tel" className={inputClass(errors.mobile || mobileError)} placeholder="+91 98765 43210" value={form.mobile}
                  onChange={(e) => { update("mobile", e.target.value); setMobileError(""); }} />
                {(errors.mobile || mobileError) && <p className={errorClass}>{errors.mobile || mobileError}</p>}

              </div>
              {!otpSent ? (
                <button onClick={() => setOtpSent(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                  Send OTP
                </button>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Enter OTP</label>
                    <input type="text" className={inputClass(errors.otp || otpError)} placeholder="Enter 6-digit OTP" maxLength={6}
                      value={otp} onChange={(e) => { setOtp(e.target.value); setOtpError(""); }} />
                    {(errors.otp || otpError) && <p className={errorClass}>{errors.otp || otpError}</p>}

                  </div>
                  <button onClick={handleVerifyAndContinue} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity">
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
                  <input type={f.type} className={inputClass(!!errors[f.field as keyof typeof errors])} placeholder={f.placeholder}
                    value={form[f.field as "name" | "email" | "businessName" | "gst"]} onChange={(e) => update(f.field, e.target.value)} />
                  {errors[f.field as keyof typeof errors] && <p className={errorClass}>{errors[f.field as keyof typeof errors]}</p>}
                </div>
              ))}

              <div className="md:col-span-2">
                <label className={labelClass}>Address *</label>
                <input type="text" className={inputClass(!!errors.address)} placeholder="Full address" value={form.address}
                  onChange={(e) => update("address", e.target.value)} />
                {errors.address && <p className={errorClass}>{errors.address}</p>}
              </div>

              <div>
                <label className={labelClass}>City *</label>
                <input type="text" className={inputClass(!!errors.city)} placeholder="City" value={form.city}
                  onChange={(e) => update("city", e.target.value)} />
                {errors.city && <p className={errorClass}>{errors.city}</p>}
              </div>

              <div>
                <label className={labelClass}>State *</label>
                <select className={inputClass(!!errors.state)} value={form.state} onChange={(e) => update("state", e.target.value)}>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className={errorClass}>{errors.state}</p>}
              </div>

              <div>
                <label className={labelClass}>Pincode *</label>
                <input type="text" className={inputClass(!!errors.pincode)} placeholder="110001" value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)} />
                {errors.pincode && <p className={errorClass}>{errors.pincode}</p>}
              </div>

            </div>
          )}

          {/* Step 2: Stall Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Event *</label>
                <select className={inputClass(!!errors.selectedEvent)} value={form.selectedEvent} onChange={(e) => update("selectedEvent", e.target.value)}>
                  <option value="">Select Event</option>
                  {events.map((eventName) => <option key={eventName._id} value={eventName._id}>{eventName.title}</option>)}
                </select>
                {errors.selectedEvent && <p className={errorClass}>{errors.selectedEvent}</p>}
              </div>

              <div>
                <label className={labelClass}>Zone *</label>
                <select className={inputClass(!!errors.selectedZone)} value={form.selectedZone} onChange={(e) => update("selectedZone", e.target.value)}>
                  <option value="">Select Zone</option>
                  {zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.zoneName}</option>)}
                </select>
                {errors.selectedZone && <p className={errorClass}>{errors.selectedZone}</p>}
              </div>

              <div>
                <label className={labelClass}>Stall Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredCategories.map((c) => (
                    <button key={c._id} onClick={() => update("stallCategory", c._id)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${form.stallCategory === c._id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                        }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                {errors.stallCategory && <p className={errorClass}>{errors.stallCategory}</p>}
                {form.selectedEvent && filteredCategories.length === 0 ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">No stall categories configured for selected event.</p>
                ) : null}

              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Stall Size *</label>
                  <select className={inputClass(!!errors.stallSize)} value={form.stallSize} onChange={(e) => update("stallSize", e.target.value)}>
                    <option value="">Select Size</option>
                    {stallSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.stallSize && <p className={errorClass}>{errors.stallSize}</p>}
                </div>

                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min={1} className={inputClass(!!errors.quantity)} value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)} />
                  {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
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
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${form.paymentMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                        } ${errors.paymentMode ? "ring-2 ring-red-500/20" : ""}`}>
                      {m}
                    </button>
                  ))}
                </div>
                {errors.paymentMode && <p className={errorClass}>{errors.paymentMode}</p>}

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
                <button onClick={() => {
                  if (validateStep()) {
                    next();
                  }
                }} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (

                <button
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (validateStep()) {
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
                        setMessage("Booking request submitted successfully!");
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);

                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : "Failed to submit booking");
                      }
                    }
                  }}

                >
                  <Check className="w-4 h-4" /> Submit Booking
                </button>
              )}
            </div>
          )}
          {message ? (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 font-semibold text-center animate-pulse">
              {message}
            </div>
          ) : null}

        </div>
      </div>
    </section>
  );
};

export default StallBookingForm;
