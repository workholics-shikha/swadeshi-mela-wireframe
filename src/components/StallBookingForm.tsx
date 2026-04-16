import { useEffect, useMemo, useState, useCallback } from "react";
import { Check, ArrowRight, ArrowLeft, Receipt, Copy, Maximize2, X } from "lucide-react";
import { createBooking, getBookingAvailability, getCategories, getEvents, getZones, type BookingAvailability, type Category, type EventItem, type ZoneItem } from "@/lib/domainApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import venueLayoutImage from "@/assets/venue-layout.jpg";

const steps = ["OTP Verification", "Business Details", "Stall Selection", "Payment"];
const states = ["Madhya Pradesh", "Delhi", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "West Bengal", "Other"];
const DEFAULT_STALL_SIZE = "Standard Stall";
const MIN_PARTIAL_PAYMENT = 2000;

const StallBookingForm = () => {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [isVenueLayoutOpen, setIsVenueLayoutOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"full" | "partial">("full");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedStallNumbers, setSelectedStallNumbers] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", businessName: "", gst: "", address: "", city: "",
    state: "", pincode: "", selectedEvent: "", selectedZone: "", stallCategory: "", stallSize: DEFAULT_STALL_SIZE, quantity: "1",
    paymentMode: "mock", transactionId: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === form.selectedEvent),
    [events, form.selectedEvent],
  );

  const selectedCategory = useMemo(
    () => filteredCategories.find((category) => category._id === form.stallCategory),
    [filteredCategories, form.stallCategory],
  );

  const availableZones = useMemo(() => {
    if (!selectedEvent || !selectedCategory) return [];

    const allowedZoneIds = new Set(
      (selectedEvent.categoryZoneMappings || [])
        .filter((row) => row.categoryName?.trim() === selectedCategory.name)
        .map((row) => row.zoneId)
        .filter((zoneId): zoneId is string => Boolean(zoneId)),
    );

    if (!allowedZoneIds.size) return [];
    return zones.filter((zone) => allowedZoneIds.has(zone._id));
  }, [selectedCategory, selectedEvent, zones]);

  const selectedCategoryMapping = useMemo(() => {
    if (!selectedEvent || !selectedCategory) return null;

    const mappings = (selectedEvent.categoryZoneMappings || []).filter(
      (row) => row.categoryName?.trim() === selectedCategory.name,
    );

    if (!mappings.length) return null;
    if (form.selectedZone) {
      return mappings.find((row) => row.zoneId === form.selectedZone) || null;
    }
    return mappings[0];
  }, [form.selectedZone, selectedCategory, selectedEvent]);

  useEffect(() => {
    if (!form.stallCategory) return;
    if (filteredCategories.some((category) => category._id === form.stallCategory)) return;
    setForm((current) => ({ ...current, stallCategory: "", selectedZone: "" }));
  }, [filteredCategories, form.stallCategory]);

  useEffect(() => {
    if (!form.selectedZone) return;
    if (availableZones.some((zone) => zone._id === form.selectedZone)) return;
    setForm((current) => ({ ...current, selectedZone: "" }));
  }, [availableZones, form.selectedZone]);

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
  const isValidMobile = (mobile: string) => /^\d{10}$/.test(mobile.replace(/\D/g, ""));
  const normalizeMobile = (mobile: string) => mobile.replace(/\D/g, "").slice(-10);
  const quantityValue = Math.max(1, Number(form.quantity) || 1);
  const perStallPrice = Number(selectedCategoryMapping?.amount) || 0;
  const totalStallPrice = perStallPrice * quantityValue;
  const finalAmount = totalStallPrice;
  const numericPaymentAmount = Number(paymentAmount) || 0;
  const maxAvailableQuantity = availability?.availableCount ?? Number(selectedCategoryMapping?.stalls) ?? 0;
  const canLoadAvailability = Boolean(form.selectedEvent && form.selectedZone && form.stallCategory);

  useEffect(() => {
    if (!finalAmount) {
      setPaymentOption("full");
      setPaymentAmount("");
      return;
    }

    if (paymentOption === "full") {
      setPaymentAmount(String(finalAmount));
      return;
    }

    if (numericPaymentAmount > finalAmount) {
      setPaymentAmount(String(finalAmount));
    }
  }, [finalAmount, numericPaymentAmount, paymentOption]);

  useEffect(() => {
    if (paymentOption === "partial" && finalAmount < MIN_PARTIAL_PAYMENT) {
      setPaymentOption("full");
      setPaymentAmount(finalAmount ? String(finalAmount) : "");
    }
  }, [finalAmount, paymentOption]);

  useEffect(() => {
    setSelectedStallNumbers([]);
    setAvailability(null);
    setAvailabilityError("");

    if (!canLoadAvailability) return;

    getBookingAvailability({
      eventId: form.selectedEvent,
      zoneId: form.selectedZone,
      categoryId: form.stallCategory,
    })
      .then((payload) => {
        setAvailability(payload);
        setAvailabilityError("");
        setForm((current) => {
          const normalizedQuantity = String(Math.max(1, Math.min(Number(current.quantity) || 1, payload.availableCount || 1)));
          return current.quantity === normalizedQuantity ? current : { ...current, quantity: normalizedQuantity };
        });
      })
      .catch((error) => {
        setAvailability(null);
        setAvailabilityError(error instanceof Error ? error.message : "Failed to load stall availability");
      });
  }, [canLoadAvailability, form.selectedEvent, form.selectedZone, form.stallCategory]);

  useEffect(() => {
    if (!availability) return;
    setSelectedStallNumbers((current) => current.filter((stallNumber) => availability.availableStallNumbers.includes(stallNumber)).slice(0, quantityValue));
  }, [availability, quantityValue]);

  const toggleStallNumber = (stallNumber: string) => {
    setSelectedStallNumbers((current) => {
      if (current.includes(stallNumber)) {
        return current.filter((item) => item !== stallNumber);
      }
      if (current.length >= quantityValue) {
        return current;
      }
      return [...current, stallNumber];
    });
    setErrors((current) => ({ ...current, stallNumbers: "", quantity: "" }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    switch (step) {
      case 0:
        const mobileDigits = normalizeMobile(form.mobile);
        if (isEmpty(form.mobile)) {
          newErrors.mobile = "Mobile number is required";
          isValid = false;
        } else if (mobileDigits.length !== 10) {
          newErrors.mobile = "Mobile number must be 10 digits";
          isValid = false;
        }
        if (!otpSent) {
          newErrors.otp = "Send OTP to continue";
          isValid = false;
          break;
        }
        if (isEmpty(otp)) {
          newErrors.otp = "OTP is required";
          isValid = false;
        } else if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
          newErrors.otp = "OTP must be 6 digits";
          isValid = false;
        } else if (!otpVerified) {
          newErrors.otp = "Please verify the temporary OTP first";
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
        if (isEmpty(form.stallCategory)) newErrors.stallCategory = "Stall category is required";
        if (!isEmpty(form.stallCategory) && availableZones.length === 0) {
          newErrors.selectedZone = "No zones are configured for the selected category";
        } else if (isEmpty(form.selectedZone)) {
          newErrors.selectedZone = "Zone is required";
        }
        if (!isValidQuantity(form.quantity)) {
          newErrors.quantity = "Quantity must be at least 1";
        } else if (availability && quantityValue > availability.availableCount) {
          newErrors.quantity = `Only ${availability.availableCount} stall(s) are currently available`;
        }
        if (canLoadAvailability && availabilityError) {
          newErrors.stallNumbers = availabilityError;
        } else if (availability && availability.availableCount === 0) {
          newErrors.stallNumbers = "No stalls are currently available for this category and zone";
        } else if (availability && selectedStallNumbers.length !== quantityValue) {
          newErrors.stallNumbers = `Select ${quantityValue} stall number${quantityValue > 1 ? "s" : ""}`;
        }
        break;
      case 3:
        if (isEmpty(form.paymentMode)) newErrors.paymentMode = "Payment mode is required";
        if (!finalAmount) {
          newErrors.paymentAmount = "Select your stall details first to calculate the final amount";
        } else if (paymentOption === "full") {
          if (numericPaymentAmount !== finalAmount) {
            newErrors.paymentAmount = "Full payment must match the final amount";
          }
        } else {
          if (finalAmount < MIN_PARTIAL_PAYMENT) {
            newErrors.paymentAmount = `Partial payment is available only when the final amount is at least Rs ${MIN_PARTIAL_PAYMENT}`;
          } else if (!paymentAmount.trim()) {
            newErrors.paymentAmount = "Enter the amount you want to pay";
          } else if (numericPaymentAmount < MIN_PARTIAL_PAYMENT) {
            newErrors.paymentAmount = `Minimum partial payment is Rs ${MIN_PARTIAL_PAYMENT}`;
          } else if (numericPaymentAmount > finalAmount) {
            newErrors.paymentAmount = "Payment amount cannot be more than the final amount";
          }
        }
        if (!acceptedTerms) newErrors.terms = "You must accept the Terms & Conditions to continue";
        break;
    }

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  const handleVerifyAndContinue = () => {
    const nextErrors: Record<string, string> = {};
    const typedOtp = otp.trim();

    if (!otpSent) {
      nextErrors.otp = "Send OTP first";
    } else if (!typedOtp) {
      nextErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(typedOtp)) {
      nextErrors.otp = "OTP must be 6 digits";
    } else if (typedOtp !== generatedOtp) {
      nextErrors.otp = "Entered OTP does not match the temporary OTP";
    }

    if (Object.keys(nextErrors).length > 0) {
      setOtpVerified(false);
      setErrors((current) => ({ ...current, ...nextErrors }));
      setOtpError(nextErrors.otp || "");
      return;
    }

    setOtpVerified(true);
    setOtpError("");
    setErrors((current) => ({ ...current, otp: "", mobile: "" }));
    next();
  };

  const handleSendOtp = () => {
    const normalizedMobile = normalizeMobile(form.mobile);

    if (!normalizedMobile) {
      setMobileError("Mobile number is required");
      setErrors((current) => ({ ...current, mobile: "Mobile number is required" }));
      return;
    }

    if (!isValidMobile(form.mobile)) {
      setMobileError("Mobile number must be 10 digits");
      setErrors((current) => ({ ...current, mobile: "Mobile number must be 10 digits" }));
      return;
    }

    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setForm((current) => ({ ...current, mobile: normalizedMobile }));
    setGeneratedOtp(nextOtp);
    setOtp("");
    setOtpSent(true);
    setOtpVerified(false);
    setMobileError("");
    setOtpError("");
    setErrors((current) => ({ ...current, mobile: "", otp: "" }));
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
                <input type="tel" className={inputClass(!!(errors.mobile || mobileError))} placeholder="+91 98765 43210" value={form.mobile}
                  onChange={(e) => {
                    update("mobile", e.target.value);
                    setMobileError("");
                    setOtp("");
                    setGeneratedOtp("");
                    setOtpSent(false);
                    setOtpVerified(false);
                    setOtpError("");
                    setErrors((current) => ({ ...current, mobile: "", otp: "" }));
                  }} />
                {(errors.mobile || mobileError) && <p className={errorClass}>{errors.mobile || mobileError}</p>}

              </div>
              {!otpSent ? (
                <button onClick={handleSendOtp} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                  Send OTP
                </button>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Temporary OTP</p>
                    <p className="mt-1 text-lg font-bold tracking-[0.35em] text-foreground">{generatedOtp}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Use this temporary OTP to continue the booking flow.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Enter OTP</label>
                    <input type="text" className={inputClass(!!(errors.otp || otpError))} placeholder="Enter 6-digit OTP" maxLength={6}
                      value={otp} onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setOtpVerified(false);
                        setOtpError("");
                        setErrors((current) => ({ ...current, otp: "" }));
                      }} />
                    {(errors.otp || otpError) && <p className={errorClass}>{errors.otp || otpError}</p>}
                    {otpVerified ? <p className="mt-1 text-xs font-medium text-green-600">OTP verified successfully.</p> : null}
                  </div>
                  <button onClick={handleVerifyAndContinue} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                    Verify & Continue
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-3 rounded-lg border border-border text-foreground font-semibold cursor-pointer hover:bg-muted transition-colors"
                  >
                    Resend OTP
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
                <label className={labelClass}>Stall Category *</label>
                {!form.selectedEvent ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                    Select an event first to see available stall categories.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredCategories.map((c) => (
                      <button key={c._id} type="button" onClick={() => {
                        update("stallCategory", c._id);
                        update("selectedZone", "");
                        setSelectedStallNumbers([]);
                      }}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${form.stallCategory === c._id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {errors.stallCategory && <p className={errorClass}>{errors.stallCategory}</p>}
                {form.selectedEvent && filteredCategories.length === 0 ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">No stall categories configured for selected event.</p>
                ) : null}
              </div>

              <div>
                <label className={labelClass}>Zone *</label>
                <select
                  className={inputClass(!!errors.selectedZone)}
                  value={form.selectedZone}
                  onChange={(e) => {
                    update("selectedZone", e.target.value);
                    setSelectedStallNumbers([]);
                  }}
                  disabled={!form.stallCategory || availableZones.length === 0}
                >
                  <option value="">
                    {!form.stallCategory
                      ? "Select category first"
                      : availableZones.length === 0
                        ? "No zones available for this category"
                        : "Select Zone"}
                  </option>
                  {availableZones.map((zone) => <option key={zone._id} value={zone._id}>{zone.zoneName}</option>)}
                </select>
                {selectedCategory && availableZones.length > 0 ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Available zones for {selectedCategory.name}: {availableZones.map((zone) => zone.zoneName).join(", ")}
                  </p>
                ) : null}
                {errors.selectedZone && <p className={errorClass}>{errors.selectedZone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min={1} max={maxAvailableQuantity || undefined} className={inputClass(!!errors.quantity)} value={form.quantity}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value) || 1;
                      const safeValue = maxAvailableQuantity > 0 ? Math.min(nextValue, maxAvailableQuantity) : nextValue;
                      update("quantity", String(Math.max(1, safeValue)));
                    }} />
                  {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
                  {availability ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {availability.availableCount} of {availability.totalStalls} stall(s) currently available in this zone.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className={labelClass}>Stall Price</label>
                  <div className="rounded-lg border border-border bg-muted/25 px-4 py-3 text-sm text-foreground">
                    {selectedCategory && form.selectedZone ? (
                      <div className="space-y-1">
                        <p>Price per stall: ₹{perStallPrice.toLocaleString()}</p>
                        <p>Total for {quantityValue} stall{quantityValue > 1 ? "s" : ""}: ₹{totalStallPrice.toLocaleString()}</p>
                      </div>
                    ) : selectedCategory ? (
                      <p className="text-muted-foreground">Select a zone to see the final stall price.</p>
                    ) : (
                      <p className="text-muted-foreground">Select a category and zone to see the stall price.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Select Stall Number{quantityValue > 1 ? "s" : ""} *</label>
                {!canLoadAvailability ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                    Select event, category, and zone to view available stall numbers.
                  </div>
                ) : availabilityError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {availabilityError}
                  </div>
                ) : availability && availability.availableStallNumbers.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Choose {quantityValue} stall number{quantityValue > 1 ? "s" : ""}. Booked stalls are already hidden.
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                      {availability.availableStallNumbers.map((stallNumber) => {
                        const isSelected = selectedStallNumbers.includes(stallNumber);
                        const limitReached = !isSelected && selectedStallNumbers.length >= quantityValue;
                        return (
                          <button
                            key={stallNumber}
                            type="button"
                            onClick={() => toggleStallNumber(stallNumber)}
                            disabled={limitReached}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-primary/50"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {stallNumber}
                          </button>
                        );
                      })}
                    </div>
                    {selectedStallNumbers.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedStallNumbers.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                    No stall numbers are available for this selection right now.
                  </div>
                )}
                {errors.stallNumbers && <p className={errorClass}>{errors.stallNumbers}</p>}
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Venue Layout</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review the venue map before confirming your stall zone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVenueLayoutOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Zoom
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVenueLayoutOpen(true)}
                  className="mt-4 block w-full overflow-hidden rounded-xl border border-border bg-background"
                >
                  <img
                    src={venueLayoutImage}
                    alt="Venue layout preview"
                    className="h-64 w-full object-contain bg-white"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <label className={labelClass}>Final Amount</label>
                <input
                  type="text"
                  readOnly
                  value={finalAmount ? `Rs ${finalAmount.toLocaleString()}` : ""}
                  placeholder="Final amount will appear after stall selection"
                  className={`${baseInputClass} font-semibold`}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This amount is calculated from the selected category, zone, and quantity.
                </p>
              </div>

              <div>
                <label className={labelClass}>Payment Option *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption("full");
                      setPaymentAmount(finalAmount ? String(finalAmount) : "");
                      setErrors((current) => ({ ...current, paymentAmount: "" }));
                    }}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${paymentOption === "full" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    Pay Full Amount
                  </button>
                  <button
                    type="button"
                    disabled={finalAmount < MIN_PARTIAL_PAYMENT}
                    onClick={() => {
                      setPaymentOption("partial");
                      setPaymentAmount((current) => {
                        if (!finalAmount) return "";
                        const parsed = Number(current) || 0;
                        if (parsed >= MIN_PARTIAL_PAYMENT && parsed <= finalAmount) return current;
                        return String(MIN_PARTIAL_PAYMENT);
                      });
                      setErrors((current) => ({ ...current, paymentAmount: "" }));
                    }}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${paymentOption === "partial" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Pay Partial Amount
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Partial payment must be at least Rs {MIN_PARTIAL_PAYMENT.toLocaleString()}.
                </p>
              </div>

              <div>
                <label className={labelClass}>{paymentOption === "full" ? "Amount to Pay" : "Partial Amount to Pay"} *</label>
                <input
                  type="number"
                  min={paymentOption === "partial" ? MIN_PARTIAL_PAYMENT : 0}
                  max={finalAmount || undefined}
                  value={paymentAmount}
                  readOnly={paymentOption === "full"}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setErrors((current) => ({ ...current, paymentAmount: "" }));
                  }}
                  placeholder={paymentOption === "full" ? "Auto-filled from final amount" : "Enter amount"}
                  className={inputClass(!!errors.paymentAmount)}
                />
                {errors.paymentAmount && <p className={errorClass}>{errors.paymentAmount}</p>}
                {!errors.paymentAmount && paymentOption === "partial" && finalAmount > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Remaining amount after this payment: Rs {Math.max(finalAmount - numericPaymentAmount, 0).toLocaleString()}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelClass}>Payment Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  {["mock", "UPI", "NEFT/RTGS", "Bank Transfer"].map((m) => (
                    <button key={m} onClick={() => update("paymentMode", m)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${form.paymentMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"} ${errors.paymentMode ? "ring-2 ring-red-500/20" : ""}`}>
                      {m}
                    </button>
                  ))}
                </div>
                {errors.paymentMode && <p className={errorClass}>{errors.paymentMode}</p>}
              </div>

              <div className="pt-4 border-t border-border">
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    Transaction ID / Reference Number
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`${baseInputClass} pl-10 pr-10 font-mono text-sm tracking-wide`}
                    placeholder="e.g., TXN123456789"
                    value={form.transactionId}
                    onChange={(e) => update("transactionId", e.target.value.toUpperCase())}
                  />
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {form.transactionId && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(form.transactionId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                      title="Copy transaction ID"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter the transaction ID or reference number from your payment confirmation.
                </p>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="pt-6 border-t border-border">
                <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl border">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
                  />
                  <Label htmlFor="terms" className="text-sm leading-6 cursor-pointer flex-1 font-medium">
                    I have read and agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline font-semibold transition-colors">
                      Terms & Conditions
                    </Link>
                  </Label>
                </div>
                {errors.terms && <p className={errorClass}>{errors.terms}</p>}
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
                          stallSize: DEFAULT_STALL_SIZE,
                          quantity: Number(form.quantity),
                          stallNumber: selectedStallNumbers.join(", "),
                          paymentMode: form.paymentMode,
                          acceptedTerms: true,
                          paymentRef: form.transactionId,
                          paymentAmount: numericPaymentAmount,
                          finalAmount,
                          paymentOption,
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
      {isVenueLayoutOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsVenueLayoutOpen(false)}
        >
          <div
            className="relative max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Venue Layout</p>
                <p className="text-xs text-muted-foreground">Click outside or use close to return to the booking form.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVenueLayoutOpen(false)}
                className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-72px)] overflow-auto bg-slate-100 p-4">
              <img
                src={venueLayoutImage}
                alt="Venue layout full preview"
                className="mx-auto h-auto min-w-full rounded-lg bg-white object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default StallBookingForm;
