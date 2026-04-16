import { useEffect, useMemo, useState } from "react";
import { Maximize2, Receipt, X } from "lucide-react";
import venueLayoutImage from "@/assets/venue-layout.jpg";
import { Card } from "./PageScaffold";
import type { SetPage } from "./types";
import {
  createBooking,
  getBookingAvailability,
  getCategories,
  getEvents,
  getZones,
  type BookingAvailability,
  type Category,
  type EventItem,
  type ZoneItem,
} from "@/lib/domainApi";

const DEFAULT_STALL_SIZE = "Standard Stall";
const MIN_PARTIAL_PAYMENT = 2000;

export function BookingCreatePage({ setPage }: { setPage: SetPage }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedStallNumbers, setSelectedStallNumbers] = useState<string[]>([]);
  const [isVenueLayoutOpen, setIsVenueLayoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [form, setForm] = useState({
    selectedEventId: "",
    selectedZone: "",
    selectedCategory: "",
    vendorName: "",
    ownerName: "",
    email: "",
    phone: "",
    gstNumber: "",
    city: "",
    quantity: "1",
    paymentMode: "manual",
    paymentRef: "",
    note: "",
  });
  const [paymentOption, setPaymentOption] = useState<"full" | "partial">("full");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]));
    getCategories()
      .then((rows) => setCategories(rows.filter((category) => category.type === "stall" && category.status === "active")))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!form.selectedEventId) {
      setZones([]);
      setForm((current) => ({ ...current, selectedZone: "", selectedCategory: "" }));
      return;
    }

    setForm((current) => ({ ...current, selectedZone: "", selectedCategory: "" }));
    getZones(form.selectedEventId)
      .then((items) => setZones(items.filter((zone) => zone.status === "active")))
      .catch(() => setZones([]));
  }, [form.selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === form.selectedEventId),
    [events, form.selectedEventId],
  );

  const filteredCategories = useMemo(() => {
    if (!selectedEvent) return [];
    const mappedCategoryNames = new Set(
      (selectedEvent.categoryZoneMappings || [])
        .map((row) => row.categoryName?.trim())
        .filter((name): name is string => Boolean(name)),
    );
    if (!mappedCategoryNames.size) {
      return categories;
    }
    return categories.filter((category) => mappedCategoryNames.has(category.name));
  }, [categories, selectedEvent]);

  const selectedCategory = useMemo(
    () => filteredCategories.find((category) => category._id === form.selectedCategory),
    [filteredCategories, form.selectedCategory],
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

  const quantityValue = Math.max(1, Number(form.quantity) || 1);
  const perStallPrice = Number(selectedCategoryMapping?.amount) || 0;
  const finalAmount = perStallPrice * quantityValue;
  const numericPaymentAmount = Number(paymentAmount) || 0;
  const maxAvailableQuantity = availability?.availableCount ?? Number(selectedCategoryMapping?.stalls) ?? 0;
  const canLoadAvailability = Boolean(form.selectedEventId && form.selectedZone && form.selectedCategory);

  useEffect(() => {
    if (!form.selectedCategory) return;
    if (filteredCategories.some((category) => category._id === form.selectedCategory)) return;
    setForm((current) => ({ ...current, selectedCategory: "", selectedZone: "" }));
  }, [filteredCategories, form.selectedCategory]);

  useEffect(() => {
    if (!form.selectedZone) return;
    if (availableZones.some((zone) => zone._id === form.selectedZone)) return;
    setForm((current) => ({ ...current, selectedZone: "" }));
  }, [availableZones, form.selectedZone]);

  useEffect(() => {
    setSelectedStallNumbers([]);
    setAvailability(null);
    setAvailabilityError("");

    if (!canLoadAvailability) return;

    getBookingAvailability({
      eventId: form.selectedEventId,
      zoneId: form.selectedZone,
      categoryId: form.selectedCategory,
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
  }, [canLoadAvailability, form.selectedCategory, form.selectedEventId, form.selectedZone]);

  useEffect(() => {
    if (!availability) return;
    setSelectedStallNumbers((current) =>
      current.filter((stallNumber) => availability.availableStallNumbers.includes(stallNumber)).slice(0, quantityValue),
    );
  }, [availability, quantityValue]);

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

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitMessage("");
  };

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

  const inputClass =
    "w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";
  const inputErrorClass =
    "w-full rounded-[16px] border border-red-300 bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";
  const errorClass = "mt-1 text-xs text-red-500";

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const mobileDigits = form.phone.replace(/\D/g, "");

    if (!form.selectedEventId) nextErrors.selectedEventId = "Event is required";
    if (!form.selectedCategory) nextErrors.selectedCategory = "Category is required";
    if (!form.selectedZone) nextErrors.selectedZone = "Zone is required";
    if (!form.vendorName.trim()) nextErrors.vendorName = "Vendor name is required";
    if (!form.ownerName.trim()) nextErrors.ownerName = "Business owner is required";
    if (!form.email.trim() || !isValidEmail) nextErrors.email = "Valid email is required";
    if (!form.phone.trim() || mobileDigits.length !== 10) nextErrors.phone = "Valid 10-digit phone number is required";
    if (!form.gstNumber.trim()) nextErrors.gstNumber = "GST number is required";
    if (!form.city.trim()) nextErrors.city = "City is required";

    if (quantityValue < 1) {
      nextErrors.quantity = "Quantity must be at least 1";
    } else if (availability && quantityValue > availability.availableCount) {
      nextErrors.quantity = `Only ${availability.availableCount} stall(s) are currently available`;
    }

    if (canLoadAvailability && availabilityError) {
      nextErrors.stallNumbers = availabilityError;
    } else if (availability && availability.availableCount === 0) {
      nextErrors.stallNumbers = "No stalls are currently available for this category and zone";
    } else if (availability && selectedStallNumbers.length !== quantityValue) {
      nextErrors.stallNumbers = `Select ${quantityValue} stall number${quantityValue > 1 ? "s" : ""}`;
    }

    if (!form.paymentMode.trim()) nextErrors.paymentMode = "Payment mode is required";

    if (!finalAmount) {
      nextErrors.paymentAmount = "Select event, category, zone, and quantity to calculate final amount";
    } else if (paymentOption === "full") {
      if (numericPaymentAmount !== finalAmount) {
        nextErrors.paymentAmount = "Full payment must match the final amount";
      }
    } else {
      if (finalAmount < MIN_PARTIAL_PAYMENT) {
        nextErrors.paymentAmount = `Partial payment is available only when the final amount is at least Rs ${MIN_PARTIAL_PAYMENT}`;
      } else if (!paymentAmount.trim()) {
        nextErrors.paymentAmount = "Enter the amount you want to pay";
      } else if (numericPaymentAmount < MIN_PARTIAL_PAYMENT) {
        nextErrors.paymentAmount = `Minimum partial payment is Rs ${MIN_PARTIAL_PAYMENT}`;
      } else if (numericPaymentAmount > finalAmount) {
        nextErrors.paymentAmount = "Payment amount cannot be more than the final amount";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSubmitMessage("");
    try {
      await createBooking({
        vendorName: form.vendorName,
        vendorEmail: form.email,
        mobile: form.phone.replace(/\D/g, "").slice(-10),
        businessName: form.vendorName,
        ownerName: form.ownerName,
        gstNumber: form.gstNumber,
        city: form.city,
        eventId: form.selectedEventId,
        zoneId: form.selectedZone,
        categoryId: form.selectedCategory,
        stallSize: DEFAULT_STALL_SIZE,
        quantity: quantityValue,
        stallNumber: selectedStallNumbers.join(", "),
        paymentMode: form.paymentMode,
        paymentRef: form.paymentRef,
        paymentAmount: numericPaymentAmount,
        finalAmount,
        paymentOption,
        note: form.note,
      });
      setSubmitMessage("Booking created successfully.");
      setSelectedStallNumbers([]);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to create booking");
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
            <p className="mt-2 text-sm text-[var(--text-soft)]">Create a booking on behalf of vendor using the same live availability and payment rules as the public booking flow.</p>
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

      <Card title="Booking details" subtitle="Select the event, mapped category and available stalls for this assisted booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-event">Event</label>
            <select
              className={errors.selectedEventId ? inputErrorClass : inputClass}
              id="create-booking-event"
              onChange={(event) => updateForm("selectedEventId", event.target.value)}
              value={form.selectedEventId}
            >
              <option value="">Select an event</option>
              {events.map((eventOption) => (
                <option key={eventOption._id} value={eventOption._id}>{eventOption.title}</option>
              ))}
            </select>
            {errors.selectedEventId && <p className={errorClass}>{errors.selectedEventId}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Category</label>
            {!form.selectedEventId ? (
              <div className="rounded-[16px] border border-dashed border-[color:var(--border-soft)] bg-white/60 px-4 py-3 text-sm text-[var(--text-soft)]">
                Select an event first to see available categories.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => {
                      updateForm("selectedCategory", category._id);
                      updateForm("selectedZone", "");
                      setSelectedStallNumbers([]);
                    }}
                    className={`rounded-[16px] border px-4 py-3 text-sm font-semibold transition ${form.selectedCategory === category._id
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[color:var(--border-soft)] bg-white/80 text-[var(--text-soft)] hover:border-[var(--brand)]"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
            {errors.selectedCategory && <p className={errorClass}>{errors.selectedCategory}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-zone">Zone</label>
            <select
              className={errors.selectedZone ? inputErrorClass : inputClass}
              id="create-booking-zone"
              onChange={(event) => {
                updateForm("selectedZone", event.target.value);
                setSelectedStallNumbers([]);
              }}
              value={form.selectedZone}
              disabled={!form.selectedCategory || availableZones.length === 0}
            >
              <option value="">
                {!form.selectedCategory
                  ? "Select category first"
                  : availableZones.length === 0
                    ? "No zones available for this category"
                    : "Select zone"}
              </option>
              {availableZones.map((zone) => (
                <option key={zone._id} value={zone._id}>{zone.zoneName}</option>
              ))}
            </select>
            {selectedCategory && availableZones.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--text-soft)]">
                Available zones for {selectedCategory.name}: {availableZones.map((zone) => zone.zoneName).join(", ")}
              </p>
            ) : null}
            {errors.selectedZone && <p className={errorClass}>{errors.selectedZone}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-quantity">Quantity</label>
            <input
              className={errors.quantity ? inputErrorClass : inputClass}
              id="create-booking-quantity"
              onChange={(event) => {
                const nextValue = Number(event.target.value) || 1;
                const safeValue = maxAvailableQuantity > 0 ? Math.min(nextValue, maxAvailableQuantity) : nextValue;
                updateForm("quantity", String(Math.max(1, safeValue)));
              }}
              type="number"
              min="1"
              max={maxAvailableQuantity || undefined}
              value={form.quantity}
            />
            {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
            {availability ? (
              <p className="mt-2 text-xs text-[var(--text-soft)]">
                {availability.availableCount} of {availability.totalStalls} stall(s) currently available in this zone.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Select Stall Number{quantityValue > 1 ? "s" : ""}</label>
          {!canLoadAvailability ? (
            <div className="rounded-[16px] border border-dashed border-[color:var(--border-soft)] bg-white/60 px-4 py-3 text-sm text-[var(--text-soft)]">
              Select event, category, and zone to view available stall numbers.
            </div>
          ) : availabilityError ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{availabilityError}</div>
          ) : availability && availability.availableStallNumbers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-soft)]">
                Choose {quantityValue} stall number{quantityValue > 1 ? "s" : ""}. Already booked stalls are hidden automatically.
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {availability.availableStallNumbers.map((stallNumber) => {
                  const isSelected = selectedStallNumbers.includes(stallNumber);
                  const limitReached = !isSelected && selectedStallNumbers.length >= quantityValue;
                  return (
                    <button
                      key={stallNumber}
                      type="button"
                      onClick={() => toggleStallNumber(stallNumber)}
                      disabled={limitReached}
                      className={`rounded-[14px] border px-3 py-2 text-sm font-semibold transition ${isSelected
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[color:var(--border-soft)] bg-white/80 text-[var(--text-main)] hover:border-[var(--brand)]"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {stallNumber}
                    </button>
                  );
                })}
              </div>
              {selectedStallNumbers.length > 0 ? (
                <p className="text-xs text-[var(--text-soft)]">Selected: {selectedStallNumbers.join(", ")}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-[color:var(--border-soft)] bg-white/60 px-4 py-3 text-sm text-[var(--text-soft)]">
              No stall numbers are available for this selection right now.
            </div>
          )}
          {errors.stallNumbers && <p className={errorClass}>{errors.stallNumbers}</p>}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Venue Layout</p>
                <p className="mt-1 text-sm text-[var(--text-soft)]">Review the venue map before assigning stalls.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVenueLayoutOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)]"
              >
                <Maximize2 className="h-4 w-4" />
                Zoom
              </button>
            </div>
            <button type="button" onClick={() => setIsVenueLayoutOpen(true)} className="mt-4 block w-full overflow-hidden rounded-[18px] border border-[color:var(--border-soft)] bg-white">
              <img src={venueLayoutImage} alt="Venue layout preview" className="h-64 w-full object-contain bg-white" />
            </button>
          </div>

          <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/70 p-4">
            <p className="text-sm font-semibold text-[var(--text-main)]">Pricing Summary</p>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-soft)]">
              <p>Price per stall: <span className="font-semibold text-[var(--text-main)]">Rs {perStallPrice.toLocaleString()}</span></p>
              <p>Quantity: <span className="font-semibold text-[var(--text-main)]">{quantityValue}</span></p>
              <p>Final amount: <span className="font-semibold text-[var(--brand)]">Rs {finalAmount.toLocaleString()}</span></p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Payment details" subtitle="Choose whether the admin is collecting full or partial payment for this booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Payment Option</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentOption("full");
                  setPaymentAmount(finalAmount ? String(finalAmount) : "");
                  setErrors((current) => ({ ...current, paymentAmount: "" }));
                }}
                className={`rounded-[16px] border px-4 py-3 text-sm font-semibold transition ${paymentOption === "full"
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "border-[color:var(--border-soft)] bg-white/80 text-[var(--text-soft)] hover:border-[var(--brand)]"
                  }`}
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
                className={`rounded-[16px] border px-4 py-3 text-sm font-semibold transition ${paymentOption === "partial"
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "border-[color:var(--border-soft)] bg-white/80 text-[var(--text-soft)] hover:border-[var(--brand)]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Pay Partial Amount
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--text-soft)]">Partial payment must be at least Rs {MIN_PARTIAL_PAYMENT.toLocaleString()}.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">Final Amount</label>
            <input
              className={inputClass}
              type="text"
              readOnly
              value={finalAmount ? `Rs ${finalAmount.toLocaleString()}` : ""}
              placeholder="Calculated from selected stalls"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">{paymentOption === "full" ? "Amount to Pay" : "Partial Amount to Pay"}</label>
            <input
              className={errors.paymentAmount ? inputErrorClass : inputClass}
              type="number"
              min={paymentOption === "partial" ? MIN_PARTIAL_PAYMENT : 0}
              max={finalAmount || undefined}
              value={paymentAmount}
              readOnly={paymentOption === "full"}
              onChange={(event) => {
                setPaymentAmount(event.target.value);
                setErrors((current) => ({ ...current, paymentAmount: "" }));
              }}
              placeholder={paymentOption === "full" ? "Auto-filled from final amount" : "Enter amount"}
            />
            {errors.paymentAmount && <p className={errorClass}>{errors.paymentAmount}</p>}
            {!errors.paymentAmount && paymentOption === "partial" && finalAmount > 0 ? (
              <p className="mt-2 text-xs text-[var(--text-soft)]">
                Remaining amount after this payment: Rs {Math.max(finalAmount - numericPaymentAmount, 0).toLocaleString()}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-payment-mode">Payment Mode</label>
            <select
              className={errors.paymentMode ? inputErrorClass : inputClass}
              id="create-booking-payment-mode"
              onChange={(event) => updateForm("paymentMode", event.target.value)}
              value={form.paymentMode}
            >
              <option value="manual">Manual Invoice</option>
              <option value="UPI">UPI</option>
              <option value="NEFT/RTGS">NEFT/RTGS</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            {errors.paymentMode && <p className={errorClass}>{errors.paymentMode}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-payment-ref">Payment Reference</label>
            <div className="relative">
              <input
                className={inputClass}
                id="create-booking-payment-ref"
                onChange={(event) => updateForm("paymentRef", event.target.value)}
                type="text"
                value={form.paymentRef}
                placeholder="Transaction ID or reference number"
              />
              <Receipt className="pointer-events-none absolute left-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[var(--text-soft)] md:block" />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Vendor details" subtitle="Store vendor profile and contact details for the assisted booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-vendor">Vendor Name</label>
            <input className={errors.vendorName ? inputErrorClass : inputClass} id="create-booking-vendor" onChange={(event) => updateForm("vendorName", event.target.value)} type="text" value={form.vendorName} placeholder="Enter vendor/company name" />
            {errors.vendorName && <p className={errorClass}>{errors.vendorName}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-owner">Business Owner</label>
            <input className={errors.ownerName ? inputErrorClass : inputClass} id="create-booking-owner" onChange={(event) => updateForm("ownerName", event.target.value)} type="text" value={form.ownerName} placeholder="Enter business owner name" />
            {errors.ownerName && <p className={errorClass}>{errors.ownerName}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-email">Email</label>
            <input className={errors.email ? inputErrorClass : inputClass} id="create-booking-email" onChange={(event) => updateForm("email", event.target.value)} type="email" value={form.email} placeholder="Enter vendor email address" />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-phone">Phone</label>
            <input className={errors.phone ? inputErrorClass : inputClass} id="create-booking-phone" onChange={(event) => updateForm("phone", event.target.value)} type="text" value={form.phone} placeholder="Enter 10-digit phone number" />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-gst">GST Number</label>
            <input className={errors.gstNumber ? inputErrorClass : inputClass} id="create-booking-gst" onChange={(event) => updateForm("gstNumber", event.target.value)} type="text" value={form.gstNumber} placeholder="Enter GST number (e.g., 23ABCDE1234F1Z5)" />
            {errors.gstNumber && <p className={errorClass}>{errors.gstNumber}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-city">City</label>
            <input className={errors.city ? inputErrorClass : inputClass} id="create-booking-city" onChange={(event) => updateForm("city", event.target.value)} type="text" value={form.city} placeholder="Enter city/location" />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="create-booking-note">Booking Note</label>
          <textarea
            className={inputClass}
            id="create-booking-note"
            onChange={(event) => updateForm("note", event.target.value)}
            value={form.note}
            placeholder="Add any special notes about this booking..."
          />
        </div>
      </Card>

      <section className="bg-admin-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--border-soft)] p-5">
        <div>
          {submitMessage ? (
            <p className={`text-sm font-semibold ${submitMessage.includes("successfully") ? "text-green-700" : "text-red-600"}`}>
              {submitMessage}
            </p>
          ) : (
            <p className="text-sm text-[var(--text-soft)]">This booking will create or update the vendor account using the same rules as the public booking form.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </section>

      {isVenueLayoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsVenueLayoutOpen(false)}>
          <div
            className="relative max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[color:var(--border-soft)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Venue Layout</p>
                <p className="text-xs text-[var(--text-soft)]">Click outside or use close to return to the booking form.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVenueLayoutOpen(false)}
                className="rounded-lg border border-[color:var(--border-soft)] p-2 text-[var(--text-main)] transition-colors hover:bg-[var(--brand-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-72px)] overflow-auto bg-slate-100 p-4">
              <img src={venueLayoutImage} alt="Venue layout full preview" className="mx-auto h-auto min-w-full rounded-lg bg-white object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
