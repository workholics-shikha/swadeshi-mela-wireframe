import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Receipt, Copy, Maximize2, X, FileText, Shield, AlertCircle, Plus, Minus, Users, Ban} from "lucide-react";
import { createBooking, getBookingAvailability, getCategories, getEvents, getZones, type BookingAvailability, type Category, type EventItem, type ZoneItem } from "@/lib/domainApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import venueLayoutImage from "@/assets/venue-layout.jpg";

const steps = ["OTP Verification", "Business Details", "Stall Selection", "Payment"];
const states = ["Madhya Pradesh", "Delhi", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "West Bengal", "Other"];
const DEFAULT_STALL_SIZE = "Standard Stall";
const MIN_PARTIAL_PAYMENT = 2000;

const bookingTerms = [
  {
    title: "बुकिंग एवं भुगतान नियम",
    icon: FileText,
    accentClass: "text-primary",
    points: [
      "स्टाल बुकिंग हेतु 50% एडवांस पेमेंट QR कोड पर करना अनिवार्य है।",
      "पेमेंट के बाद Transaction ID या Screenshot अपलोड करना आवश्यक है।",
      "शेष 50% राशि स्टाल पजेशन लेने से पहले जमा करनी होगी।",
      "संस्था की ऑफिशियल स्वीकृति के बाद ही बुकिंग फाइनल मानी जाएगी।",
    ],
  },
  {
    title: "रिफंड एवं कैंसिलेशन",
    icon: AlertCircle,
    accentClass: "text-red-600",
    points: [
      "एक बार बुकिंग होने के बाद कोई भी पेमेंट वापस नहीं किया जाएगा।",
      "कन्फर्मेशन के बाद किसी भी प्रकार का बदलाव या ट्रांसफर मान्य नहीं होगा।",
    ],
  },
  {
    title: "संस्था के अधिकार",
    icon: Shield,
    accentClass: "text-secondary",
    points: [
      "संस्था (MPSS) को स्टाल बदलने या रिजेक्ट करने का पूर्ण अधिकार है।",
      "किसी भी विवाद की स्थिति में संस्था का निर्णय अंतिम और मान्य होगा।",
    ],
  },
  {
    title: "जिम्मेदारी एवं सुरक्षा",
    icon: AlertCircle,
    accentClass: "text-amber-600",
    points: [
      "चोरी, आग, दुर्घटना या प्राकृतिक आपदा की स्थिति में पूरी जिम्मेदारी स्टाल धारक की होगी।",
      "संस्था द्वारा CCTV एवं सिक्योरिटी उपलब्ध कराई जाएगी, लेकिन व्यक्तिगत सामान की सुरक्षा आपकी जिम्मेदारी होगी।",
    ],
  },
  {
    title: "स्टाल उपयोग नियम",
    icon: Users,
    accentClass: "text-primary",
    points: [
      "प्रत्येक स्टाल पर अधिकतम 2 सेल्समैन ही अनुमति होगी।",
      "रात्रि 11 बजे के बाद स्टाल पर रुकना या सोना प्रतिबंधित है।",
    ],
  },
  {
    title: "प्रतिबंधित गतिविधियाँ",
    icon: Ban,
    accentClass: "text-red-600",
    points: [
      "स्टाल में शराब, सिगरेट या किसी भी प्रकार का नशा पूर्णतः प्रतिबंधित है।",
      "अशोभनीय व्यवहार या नियम उल्लंघन पर बुकिंग तुरंत रद्द कर दी जाएगी (No Refund)।",
    ],
  },
];

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
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"full" | "partial">("full");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedStallsByOption, setSelectedStallsByOption] = useState<Record<string, string[]>>({});
  const [layoutZoom, setLayoutZoom] = useState(1);
  const [layoutOffset, setLayoutOffset] = useState({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", businessName: "", gst: "", address: "", city: "",
    state: "", pincode: "", selectedEvent: "", selectedZone: "", stallCategory: "", stallSize: DEFAULT_STALL_SIZE,
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
      setSelectedStallsByOption({});
      setForm((current) => ({ ...current, selectedZone: "", stallCategory: "" }));
      return;
    }
    setSelectedStallsByOption({});
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
  const categoryZoneOptions = useMemo(() => {
    if (!selectedEvent) return [];

    return (selectedEvent.categoryZoneMappings || [])
      .map((mapping) => {
        const category = categories.find((item) => item.name === mapping.categoryName && item.type === "stall" && item.status === "active");
        const zone = zones.find((item) => item._id === mapping.zoneId && item.status === "active");
        if (!category || !zone) return null;
        return {
          key: `${category._id}-${zone._id}`,
          categoryId: category._id,
          zoneId: zone._id,
          categoryName: category.name,
          zoneName: zone.zoneName,
          amount: Number(mapping.amount) || 0,
        };
      })
      .filter((item, index, items): item is NonNullable<typeof item> => Boolean(item) && items.findIndex((entry) => entry?.key === item.key) === index);
  }, [categories, selectedEvent, zones]);
  const activeCategoryZoneKey = form.stallCategory && form.selectedZone ? `${form.stallCategory}-${form.selectedZone}` : "";
  const selectedStallNumbers = activeCategoryZoneKey ? selectedStallsByOption[activeCategoryZoneKey] || [] : [];
  const selectedBookingGroups = useMemo(
    () =>
      categoryZoneOptions
        .map((option) => ({
          ...option,
          stallNumbers: selectedStallsByOption[option.key] || [],
          lineAmount: (selectedStallsByOption[option.key] || []).length * option.amount,
        }))
        .filter((option) => option.stallNumbers.length > 0),
    [categoryZoneOptions, selectedStallsByOption],
  );

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
  const isValidMobile = (mobile: string) => /^\d{10}$/.test(mobile.replace(/\D/g, ""));
  const normalizeMobile = (mobile: string) => mobile.replace(/\D/g, "").slice(-10);
  const quantityValue = selectedBookingGroups.reduce((sum, group) => sum + group.stallNumbers.length, 0);
  const perStallPrice = Number(selectedCategoryMapping?.amount) || 0;
  const totalStallPrice = selectedBookingGroups.reduce((sum, group) => sum + group.lineAmount, 0);
  const finalAmount = totalStallPrice;
  const selectedEventNote = selectedEvent?.note?.trim() || "";
  const numericPaymentAmount = Number(paymentAmount) || 0;
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
      })
      .catch((error) => {
        setAvailability(null);
        setAvailabilityError(error instanceof Error ? error.message : "Failed to load stall availability");
      });
  }, [canLoadAvailability, form.selectedEvent, form.selectedZone, form.stallCategory]);

  useEffect(() => {
    if (!availability) return;
    if (!activeCategoryZoneKey) return;
    setSelectedStallsByOption((current) => ({
      ...current,
      [activeCategoryZoneKey]: (current[activeCategoryZoneKey] || []).filter((stallNumber) => availability.availableStallNumbers.includes(stallNumber)),
    }));
  }, [activeCategoryZoneKey, availability]);

  const toggleStallNumber = (stallNumber: string) => {
    if (!activeCategoryZoneKey) return;
    setSelectedStallsByOption((current) => {
      const currentGroup = current[activeCategoryZoneKey] || [];
      if (currentGroup.includes(stallNumber)) {
        return { ...current, [activeCategoryZoneKey]: currentGroup.filter((item) => item !== stallNumber) };
      }
      return { ...current, [activeCategoryZoneKey]: [...currentGroup, stallNumber] };
    });
    setErrors((current) => ({ ...current, stallNumbers: "" }));
  };
  const getDistributedPaymentAmount = useCallback(
    (lineAmount: number, remainingAmount: number) => Math.max(Math.min(lineAmount, remainingAmount), 0),
    [],
  );

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
        if (canLoadAvailability && availabilityError) {
          newErrors.stallNumbers = availabilityError;
        } else if (activeCategoryZoneKey && availability && availability.availableCount === 0) {
          newErrors.stallNumbers = "No stalls are currently available for this category and zone";
        } else if (quantityValue === 0) {
          newErrors.stallNumbers = "Select at least one stall from any category and zone";
        }
        break;
      case 3:
        if (!finalAmount) {
          newErrors.paymentAmount = "Select your stall(s) first to calculate the final amount";
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
  const clampZoom = useCallback((value: number) => Math.min(3, Math.max(1, value)), []);
  const resetLayoutTransform = useCallback(() => {
    setLayoutZoom(1);
    setLayoutOffset({ x: 0, y: 0 });
  }, []);
  const applyZoom = useCallback((delta: number) => {
    setLayoutZoom((current) => {
      const next = clampZoom(current + delta);
      if (next === 1) {
        setLayoutOffset({ x: 0, y: 0 });
      }
      return next;
    });
  }, [clampZoom]);
  const getPointerDistance = useCallback((points: { x: number; y: number }[]) => {
    if (points.length < 2) return 0;
    const [first, second] = points;
    return Math.hypot(second.x - first.x, second.y - first.y);
  }, []);
  const handleLayoutWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    applyZoom(event.deltaY < 0 ? 0.15 : -0.15);
  }, [applyZoom]);
  const handleLayoutKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      applyZoom(0.2);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      applyZoom(-0.2);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      resetLayoutTransform();
    }
  }, [applyZoom, resetLayoutTransform]);
  const handleLayoutPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1 && layoutZoom > 1) {
      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: layoutOffset.x,
        offsetY: layoutOffset.y,
      };
    }
    if (pointersRef.current.size === 2) {
      pinchStartRef.current = {
        distance: getPointerDistance([...pointersRef.current.values()]),
        zoom: layoutZoom,
      };
      panStartRef.current = null;
    }
  }, [getPointerDistance, layoutOffset.x, layoutOffset.y, layoutZoom]);
  const handleLayoutPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const distance = getPointerDistance([...pointersRef.current.values()]);
      if (!distance || !pinchStartRef.current.distance) return;
      const nextZoom = clampZoom(pinchStartRef.current.zoom * (distance / pinchStartRef.current.distance));
      setLayoutZoom(nextZoom);
      if (nextZoom === 1) {
        setLayoutOffset({ x: 0, y: 0 });
      }
      return;
    }
    if (pointersRef.current.size === 1 && panStartRef.current && layoutZoom > 1) {
      setLayoutOffset({
        x: panStartRef.current.offsetX + (event.clientX - panStartRef.current.x),
        y: panStartRef.current.offsetY + (event.clientY - panStartRef.current.y),
      });
    }
  }, [clampZoom, getPointerDistance, layoutZoom]);
  const handleLayoutPointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 1 && layoutZoom > 1) {
      const [point] = [...pointersRef.current.values()];
      panStartRef.current = {
        x: point.x,
        y: point.y,
        offsetX: layoutOffset.x,
        offsetY: layoutOffset.y,
      };
      return;
    }
    panStartRef.current = null;
  }, [layoutOffset.x, layoutOffset.y, layoutZoom]);
  const layoutTransformStyle = {
    transform: `translate(${layoutOffset.x}px, ${layoutOffset.y}px) scale(${layoutZoom})`,
    transformOrigin: "center center",
    transition: pointersRef.current.size ? "none" : "transform 180ms ease-out",
    imageRendering: "crisp-edges",
    willChange: "transform",
  } as const;

  return (
    <section id="booking" className="py-20 md:py-28 bg-background">
      <div className="container max-w-6xl">
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

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr] xl:items-start">
          <aside className="hidden xl:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <p className="text-sm font-semibold text-foreground">Venue Layout</p>
                <button
                  type="button"
                  onClick={() => setIsVenueLayoutOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </button>
              </div>
              <div
                className={`relative flex min-h-[640px] items-center justify-center overflow-hidden bg-slate-100 p-4 ${layoutZoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                onWheel={handleLayoutWheel}
                onKeyDown={handleLayoutKeyDown}
                onPointerDown={handleLayoutPointerDown}
                onPointerMove={handleLayoutPointerMove}
                onPointerUp={handleLayoutPointerEnd}
                onPointerCancel={handleLayoutPointerEnd}
                tabIndex={0}
                style={{ touchAction: "none" }}
              >
                <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-sm">
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      applyZoom(0.2);
                    }}
                    className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={layoutZoom >= 3}
                    aria-label="Zoom in"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      applyZoom(-0.2);
                    }}
                    className="flex h-10 w-10 items-center justify-center border-t border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={layoutZoom <= 1}
                    aria-label="Zoom out"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                <img
                  src={venueLayoutImage}
                  alt="Venue layout preview"
                  className="h-full w-full object-contain"
                  draggable={false}
                  style={layoutTransformStyle}
                />
              </div>
            </div>
          </aside>

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
                  <label className={labelClass}>Category + Zone *</label>
                  {!form.selectedEvent ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                      Select an event first to see available options.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryZoneOptions.map((option) => (
                        <button key={option.key} type="button" onClick={() => {
                          update("stallCategory", option.categoryId);
                          update("selectedZone", option.zoneId);
                        }}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${form.stallCategory === option.categoryId && form.selectedZone === option.zoneId
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                            }`}>
                          <span className="block">{option.categoryName}</span>
                          <span className="mt-1 block text-xs opacity-80">{option.zoneName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.stallCategory && <p className={errorClass}>{errors.stallCategory}</p>}
                  {form.selectedEvent && categoryZoneOptions.length === 0 ? (
                    <p className="mt-2 text-xs font-medium text-muted-foreground">No category and zone mappings configured for selected event.</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-3">
                      <div className="rounded-lg border border-border bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Available</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">{availability?.availableCount ?? 0}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">{quantityValue}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">Rs {totalStallPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                      {selectedCategory && form.selectedZone
                        ? `${selectedCategory.name} • ${zones.find((zone) => zone._id === form.selectedZone)?.zoneName || ""} • Rs ${perStallPrice.toLocaleString()} per stall`
                        : "Select a category and zone to see pricing."}
                    </div>
                    {selectedBookingGroups.length > 0 ? (
                      <div className="mt-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        {selectedBookingGroups.map((group) => (
                          <p key={group.key}>
                            {group.categoryName} • {group.zoneName}: {group.stallNumbers.join(", ")} = Rs {group.lineAmount.toLocaleString()}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Stall View *</label>
                  {!canLoadAvailability ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
                      Select event, category, and zone to open the stall view.
                    </div>
                  ) : availabilityError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {availabilityError}
                    </div>
                  ) : availability && availability.availableStallNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-background p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">Select one or more stalls directly from the grid</p>
                          <p className="text-xs text-muted-foreground">Booked stalls are already hidden.</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                          {availability.availableStallNumbers.map((stallNumber) => {
                            const isSelected = selectedStallNumbers.includes(stallNumber);
                            return (
                              <button
                                key={stallNumber}
                                type="button"
                                onClick={() => toggleStallNumber(stallNumber)}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-foreground hover:border-primary/50"
                                  }`}
                              >
                                {stallNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {selectedBookingGroups.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedBookingGroups.map((group) => `${group.categoryName} • ${group.zoneName}: ${group.stallNumbers.join(", ")}`).join(" | ")}
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

                <div className="rounded-2xl border border-border bg-muted/20 p-4 xl:hidden">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-foreground">Venue Layout</p>
                    <button
                      type="button"
                      onClick={() => setIsVenueLayoutOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Maximize2 className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payable</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{finalAmount ? `Rs ${finalAmount.toLocaleString()}` : "Rs 0"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{quantityValue} stall{quantityValue === 1 ? "" : "s"} selected</p>
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

                <div className="pt-4 border-t border-border">
                  <label className={labelClass}>Receipt</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className={inputClass(false)}
                    onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                  />
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
                </div>

                {selectedEventNote ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Note</p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">{selectedEventNote}</p>
                  </div>
                ) : null}

                {/* Terms & Conditions Checkbox */}
                <div className="pt-6 border-t border-border">
                  <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="pr-2">
                        <p className="text-sm font-semibold text-foreground">Terms & Conditions</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Review the booking terms without leaving this form.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTermsDialogOpen(true)}
                        className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                      >
                        Read Terms
                      </button>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => {
                          setAcceptedTerms(Boolean(checked));
                          setErrors((current) => ({ ...current, terms: "" }));
                        }}
                      />
                      <Label htmlFor="terms" className="text-sm leading-6 cursor-pointer flex-1 font-medium">
                        I have read and agree to the stall booking Terms & Conditions.
                      </Label>
                    </div>
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
                          let remainingPaymentAmount = numericPaymentAmount;
                          for (const group of selectedBookingGroups) {
                            const groupPaymentAmount =
                              paymentOption === "full" ? group.lineAmount : getDistributedPaymentAmount(group.lineAmount, remainingPaymentAmount);
                            if (paymentOption === "partial") {
                              remainingPaymentAmount = Math.max(remainingPaymentAmount - groupPaymentAmount, 0);
                            }
                            const payload = new FormData();
                            payload.append("vendorName", form.name);
                            payload.append("vendorEmail", form.email);
                            payload.append("mobile", form.mobile);
                            payload.append("businessName", form.businessName);
                            payload.append("gstNumber", form.gst);
                            payload.append("address", form.address);
                            payload.append("city", form.city);
                            payload.append("state", form.state);
                            payload.append("pincode", form.pincode);
                            payload.append("eventId", form.selectedEvent);
                            payload.append("zoneId", group.zoneId);
                            payload.append("categoryId", group.categoryId);
                            payload.append("stallSize", DEFAULT_STALL_SIZE);
                            payload.append("quantity", String(group.stallNumbers.length));
                            payload.append("stallNumber", group.stallNumbers.join(", "));
                            payload.append("paymentMode", form.paymentMode);
                            payload.append("acceptedTerms", "true");
                            payload.append("paymentRef", form.transactionId);
                            payload.append("paymentAmount", String(groupPaymentAmount));
                            payload.append("finalAmount", String(group.lineAmount));
                            payload.append("paymentOption", groupPaymentAmount >= group.lineAmount ? "full" : "partial");
                            if (receiptImage) payload.append("receiptImage", receiptImage);
                            await createBooking(payload);
                          }
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
      </div>
      {isVenueLayoutOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsVenueLayoutOpen(false)}
        >
          <div
            className="relative h-[95vh] w-full max-w-[96vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Venue Layout</p>
              <button
                type="button"
                onClick={() => setIsVenueLayoutOpen(false)}
                className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              className={`relative flex h-[calc(95vh-72px)] items-center justify-center overflow-hidden bg-slate-100 p-4 lg:p-6 ${layoutZoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
              onWheel={handleLayoutWheel}
              onKeyDown={handleLayoutKeyDown}
              onPointerDown={handleLayoutPointerDown}
              onPointerMove={handleLayoutPointerMove}
              onPointerUp={handleLayoutPointerEnd}
              onPointerCancel={handleLayoutPointerEnd}
              tabIndex={0}
              style={{ touchAction: "none" }}
            >
              <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-sm">
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    applyZoom(0.2);
                  }}
                  className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={layoutZoom >= 3}
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    applyZoom(-0.2);
                  }}
                  className="flex h-10 w-10 items-center justify-center border-t border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={layoutZoom <= 1}
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
              <img
                src={venueLayoutImage}
                alt="Venue layout full preview"
                className="h-full w-full rounded-lg bg-white object-contain"
                draggable={false}
                style={layoutTransformStyle}
              />
            </div>
          </div>
        </div>
      ) : null}
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Stall Booking Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Read the important booking rules here without leaving the current step.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-160px)] px-6 py-5">
            <div className="space-y-6">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  By submitting the booking, you confirm that the stall request, payment details, and selected preferences are accurate.
                </p>
              </div>
              {bookingTerms.map(({ title, icon: Icon, accentClass, points }) => (
                <section key={title} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-muted p-2">
                      <Icon className={`h-5 w-5 ${accentClass}`} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  </div>
                  <div className="space-y-2">
                    {points.map((point) => (
                      <p key={point} className="text-sm leading-6 text-muted-foreground">
                        {point}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                For the full standalone page, you can still open <Link to="/terms" target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Terms & Conditions</Link> in a new tab without interrupting your form.
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={() => setIsTermsDialogOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setAcceptedTerms(true);
                setErrors((current) => ({ ...current, terms: "" }));
                setIsTermsDialogOpen(false);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Accept and Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default StallBookingForm;
