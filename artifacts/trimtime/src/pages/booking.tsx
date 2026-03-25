import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button, Card, Input, Textarea } from "@/components/ui/shared";
import { useServices, useAvailableTimeSlots, useCreateRequest } from "@/hooks/use-mock-api";
import { Service, UserDetails } from "@/lib/types";
import { getDateAvailability } from "@/lib/mock-data";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Scissors, Calendar as CalendarIcon, ArrowRight, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── 3 visible steps (success is step 4, hidden from indicator) ──
const STEP_LABELS = ["Service", "Day & Time", "Details"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  const total = STEP_LABELS.length;
  return (
    <div className="flex items-start justify-center w-full mb-8">
      <div className="flex items-start gap-0">
        {STEP_LABELS.map((label, i) => {
          const step  = i + 1;
          const isActive = step === currentStep;
          const isPast   = step < currentStep;
          return (
            <div key={step} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                  isActive ? "bg-primary text-primary-foreground shadow-md"
                           : isPast ? "bg-primary/20 text-primary"
                                    : "bg-secondary text-muted-foreground"
                )}>
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted-foreground/60"
                )}>
                  {label}
                </span>
              </div>
              {step < total && (
                <div className={cn(
                  "w-10 h-1 mx-1 rounded-full mt-3.5 transition-colors duration-300",
                  step < currentStep ? "bg-primary/40" : "bg-secondary"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers shared across steps ──
const getTimeGroup = (time: string): "Morning" | "Afternoon" | "Evening" => {
  if (time.includes("AM")) return "Morning";
  const hour = parseInt(time.split(":")[0]);
  return (hour === 12 || hour < 5) ? "Afternoon" : "Evening";
};
const GROUP_ORDER = ["Morning", "Afternoon", "Evening"] as const;

// ── Main component ──
export default function BookingFlow() {
  const [, navigate] = useLocation();
  // Steps: 1=Service  2=Day+Time  3=Details  4=Success
  const [step, setStep] = useState(1);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate,    setSelectedDate]    = useState<Date>(addDays(new Date(), 1));
  const [selectedTime,    setSelectedTime]    = useState<string | null>(null);
  const [userDetails,     setUserDetails]     = useState<UserDetails>({ name: "", phone: "", note: "" });
  const [datePage,        setDatePage]        = useState(0);
  const [touched,         setTouched]         = useState({ name: false, phone: false });

  const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const phoneDigits = userDetails.phone.replace(/\D/g, "");
  const nameError   = touched.name  && userDetails.name.trim().length < 2 ? "Please enter your full name."          : null;
  const phoneError  = touched.phone && phoneDigits.length < 10             ? "Please enter a valid 10-digit number." : null;
  const step3Valid  = userDetails.name.trim().length >= 2 && phoneDigits.length === 10;

  const { data: services,  isLoading: isLoadingServices } = useServices();
  const { data: timeSlots, isLoading: isLoadingTimes    } = useAvailableTimeSlots(format(selectedDate, "yyyy-MM-dd"));
  const createRequest = useCreateRequest();

  // Date pagination
  const today       = startOfDay(new Date());
  const PAGE_SIZE   = 7;
  const MAX_PAGES   = 4;
  const allDates    = Array.from({ length: PAGE_SIZE * MAX_PAGES }).map((_, i) => addDays(today, i));
  const visibleDates = allDates.slice(datePage * PAGE_SIZE, (datePage + 1) * PAGE_SIZE);

  // Auto-select first available time whenever timeSlots update (date changed)
  useEffect(() => {
    if (!timeSlots) return;
    const first = timeSlots.find(s => s.available);
    if (first) setSelectedTime(first.time);
    else setSelectedTime(null);
  }, [timeSlots]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => { if (step > 1) setStep(s => s - 1); else navigate("/"); };

  const submitBooking = () => {
    if (!selectedService || !selectedTime) return;
    createRequest.mutate({
      serviceId:     selectedService.id,
      date:          format(selectedDate, "yyyy-MM-dd"),
      time:          selectedTime,
      customerName:  userDetails.name,
      customerPhone: userDetails.phone,
      note:          userDetails.note,
    }, { onSuccess: handleNext });
  };

  const goToPage = (newPage: number) => {
    setDatePage(newPage);
    for (let i = 0; i < PAGE_SIZE; i++) {
      const offset = newPage * PAGE_SIZE + i;
      if (getDateAvailability(offset).status !== "full") {
        setSelectedDate(allDates[offset]);
        break;
      }
    }
  };

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit:   (d: number) => ({ zIndex: 0, x: d < 0 ? 50 : -50, opacity: 0 }),
  };

  const showStickyBar = step < 4;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-36">

        {/* Top nav */}
        {step < 4 && (
          <div className="mb-6 flex items-center gap-1">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-2 py-1.5 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-xl font-semibold ml-2 text-foreground">Request an Appointment</h1>
          </div>
        )}

        {step < 4 && <StepIndicator currentStep={step} />}

        <div className="relative">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >

              {/* ══ STEP 1: SERVICE ══ */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">What are you booking?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Takes less than a minute.</p>
                  </div>
                  {isLoadingServices ? (
                    <div className="space-y-3">
                      {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {services?.map(service => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <button
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={cn(
                              "w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 flex items-center justify-between gap-4",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-lg"
                                : "border-border bg-white hover:border-primary/40 hover:shadow-sm text-foreground"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-3 mb-1">
                                <h3 className={cn("font-bold text-lg leading-tight", isSelected ? "text-primary-foreground" : "text-foreground")}>
                                  {service.name}
                                </h3>
                                <span className={cn("text-lg font-bold shrink-0", isSelected ? "text-primary-foreground" : "text-primary")}>
                                  ${service.price}
                                </span>
                              </div>
                              <p className={cn("text-sm", isSelected ? "text-primary-foreground/75" : "text-muted-foreground")}>
                                {service.description}
                              </p>
                              <p className={cn("text-xs mt-1.5 font-medium", isSelected ? "text-primary-foreground/60" : "text-muted-foreground/70")}>
                                {service.duration} min
                              </p>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              isSelected ? "border-primary-foreground bg-primary-foreground/20" : "border-border"
                            )}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══ STEP 2: DAY + TIME ══ */}
              {step === 2 && (() => {
                const weekLabels = ["This week", "Next week", "In two weeks", "In three weeks"];

                // First non-full day on current page = "Best option"
                const recommendedOffset = (() => {
                  for (let i = 0; i < PAGE_SIZE; i++) {
                    const off = datePage * PAGE_SIZE + i;
                    if (getDateAvailability(off).status !== "full") return off;
                  }
                  return -1;
                })();

                // Time groups — available first within each group
                const soonestTime = timeSlots?.find(s => s.available)?.time ?? null;
                const grouped = GROUP_ORDER.map(label => ({
                  label,
                  slots: (timeSlots ?? [])
                    .filter(s => getTimeGroup(s.time) === label)
                    .sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1)),
                })).filter(g => g.slots.length > 0);

                const hasTimeSelection = selectedTime !== null;

                return (
                  <div className="space-y-0">
                    {/* Section heading */}
                    <div className="mb-5">
                      <h2 className="text-2xl font-bold text-foreground">Pick a day & time</h2>
                      <p className="text-sm text-muted-foreground mt-1">Choose a day, then pick a time.</p>
                    </div>

                    {/* ── DAY SELECTOR ── */}
                    <div className="space-y-3 mb-6">
                      {/* Week nav */}
                      <div className="flex items-center justify-between">
                        {datePage > 0 ? (
                          <button
                            onClick={() => goToPage(datePage - 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary active:bg-secondary/80 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" /> Earlier
                          </button>
                        ) : <div className="w-20" />}

                        <div className="text-center">
                          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider leading-none">
                            {weekLabels[datePage]}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(visibleDates[0], "MMM d")} — {format(visibleDates[visibleDates.length - 1], "MMM d")}
                          </p>
                        </div>

                        {datePage < MAX_PAGES - 1 ? (
                          <button
                            onClick={() => goToPage(datePage + 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/8 active:bg-primary/15 transition-colors"
                          >
                            Later <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : <div className="w-20" />}
                      </div>

                      {/* Date grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {visibleDates.map((date, i) => {
                          const dayOffset  = datePage * PAGE_SIZE + i;
                          const isSelected = isSameDay(date, selectedDate);
                          const isToday    = isSameDay(date, today);
                          const avail      = getDateAvailability(dayOffset);
                          const isFull     = avail.status === "full";
                          const isRec      = dayOffset === recommendedOffset;
                          const showPill   = !isSelected && (avail.status === "limited" || avail.status === "almost-full");

                          return (
                            <button
                              key={i}
                              disabled={isFull}
                              onClick={() => {
                                if (!isFull) {
                                  setSelectedDate(date);
                                  // selectedTime auto-updated via useEffect when timeSlots reload
                                }
                              }}
                              className={cn(
                                "relative pt-2 pb-2 px-1 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
                                isFull      && "opacity-35 cursor-not-allowed bg-secondary/20 border-transparent",
                                !isFull && isSelected  && "border-primary bg-primary text-primary-foreground shadow-lg scale-[1.04] -translate-y-0.5 z-10",
                                !isFull && !isSelected && isToday  && "border-primary/35 bg-primary/6 hover:border-primary/70",
                                !isFull && !isSelected && !isToday && "border-input bg-white hover:border-primary/50 hover:bg-secondary/30",
                              )}
                            >
                              {isRec && !isSelected && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full whitespace-nowrap leading-none">
                                  Best
                                </span>
                              )}
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wider mt-1",
                                isSelected ? "text-primary-foreground/80" : isToday ? "text-primary" : "text-muted-foreground"
                              )}>
                                {isToday ? "Today" : format(date, "EEE")}
                              </span>
                              <span className={cn(
                                "text-lg font-bold leading-tight",
                                isSelected ? "text-primary-foreground" : "text-foreground"
                              )}>
                                {format(date, "d")}
                              </span>
                              <span className={cn(
                                "text-[9px]",
                                isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {format(date, "MMM")}
                              </span>
                              {showPill && (
                                <span className={cn(
                                  "mt-0.5 text-[8px] font-semibold px-1 py-0.5 rounded-full leading-none",
                                  avail.status === "limited"     && "bg-amber-100 text-amber-700",
                                  avail.status === "almost-full" && "bg-orange-100 text-orange-700",
                                )}>
                                  {avail.label}
                                </span>
                              )}
                              {!showPill && <span className="mt-0.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Page dots */}
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        {Array.from({ length: MAX_PAGES }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={cn(
                              "rounded-full transition-all",
                              i === datePage ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* ── DIVIDER ── */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          Available times for {format(selectedDate, "MMM do")}
                        </span>
                      </div>
                    </div>

                    {/* ── TIME SLOTS ── */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground/60 mb-4">Times update in real time.</p>

                      {isLoadingTimes ? (
                        <div className="space-y-5">
                          {["Morning", "Afternoon"].map(label => (
                            <div key={label}>
                              <div className="h-3 w-16 bg-secondary rounded animate-pulse mb-3" />
                              <div className="grid grid-cols-3 gap-2.5">
                                {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {grouped.map(({ label, slots }) => (
                            <div key={label}>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2.5">
                                {label}
                              </p>
                              <div className="grid grid-cols-3 gap-2.5">
                                {slots.map((slot, i) => {
                                  const isSelected = selectedTime === slot.time;
                                  const isSoonest  = slot.time === soonestTime;

                                  return (
                                    <button
                                      key={i}
                                      disabled={!slot.available}
                                      onClick={() => { if (slot.available) setSelectedTime(slot.time); }}
                                      className={cn(
                                        "relative py-4 px-2 rounded-xl border-2 text-center font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
                                        !slot.available && "cursor-not-allowed bg-secondary/20 border-transparent",
                                        slot.available && !isSelected && !hasTimeSelection && "border-input bg-white hover:border-primary/50 hover:shadow-sm text-foreground",
                                        slot.available && !isSelected && hasTimeSelection  && "border-input bg-white text-foreground opacity-50 hover:opacity-80 hover:border-primary/40",
                                        isSelected && "border-primary bg-primary text-primary-foreground shadow-lg scale-[1.04] z-10",
                                      )}
                                    >
                                      {isSoonest && !isSelected && (
                                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded-full whitespace-nowrap leading-none shadow-sm">
                                          Soonest
                                        </span>
                                      )}
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground/80 mb-0.5" />}
                                      <span className={cn(!slot.available && "text-muted-foreground/40")}>
                                        {slot.time}
                                      </span>
                                      {!slot.available && (
                                        <span className="text-[10px] font-normal text-muted-foreground/35 mt-0.5">Booked</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ══ STEP 3: DETAILS ══ */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-foreground">Your details</h2>
                    <p className="text-sm text-muted-foreground mt-1">Almost done — just your name and number.</p>
                  </div>

                  {/* Summary card */}
                  <Card className="p-4 bg-secondary/40 border border-border/60 shadow-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Your request</p>
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-foreground">{selectedService?.name}</p>
                          <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold hover:underline underline-offset-2 shrink-0">
                            Change
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            {format(selectedDate, "MMM do")} at {selectedTime}
                          </p>
                          <button onClick={() => setStep(2)} className="text-xs text-primary font-semibold hover:underline underline-offset-2 shrink-0">
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 ml-0.5">Name</label>
                      <Input
                        autoFocus
                        placeholder="Full name"
                        value={userDetails.name}
                        onChange={e => setUserDetails(p => ({ ...p, name: e.target.value }))}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        className={cn(nameError && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100")}
                      />
                      {nameError && <p className="text-xs text-red-500 mt-1.5 ml-0.5">{nameError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 ml-0.5">Phone</label>
                      <Input
                        placeholder="(555) 000-0000"
                        inputMode="numeric"
                        value={userDetails.phone}
                        onChange={e => setUserDetails(p => ({ ...p, phone: formatPhone(e.target.value) }))}
                        onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                        className={cn(phoneError && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100")}
                      />
                      {phoneError && <p className="text-xs text-red-500 mt-1.5 ml-0.5">{phoneError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 ml-0.5">
                        Note <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Textarea
                        placeholder="Notes for your barber (optional)"
                        value={userDetails.note}
                        onChange={e => setUserDetails(p => ({ ...p, note: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3 text-sm text-amber-900">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                    <p>
                      <strong>This is a request, not a confirmed booking.</strong> The barber will review and text you to confirm or suggest another time.
                    </p>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: SUCCESS ══ */}
              {step === 4 && (
                <div className="flex flex-col items-center text-center py-10 space-y-6">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="w-20 h-20 bg-[#2d6a4f]/10 text-[#2d6a4f] rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="space-y-2"
                  >
                    <h2 className="text-3xl font-bold tracking-tight">You're all set</h2>
                    <p className="text-muted-foreground text-base">We've sent your request to the barber.</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="inline-flex items-center gap-2 bg-secondary/60 border border-border/60 rounded-full px-5 py-2.5 text-sm font-semibold text-foreground"
                  >
                    <Scissors className="w-4 h-4 text-primary opacity-80 shrink-0" />
                    {selectedService?.name}
                    <span className="text-muted-foreground font-normal">·</span>
                    {format(selectedDate, "MMM do")} at {selectedTime}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="w-full max-w-sm text-left rounded-2xl border border-border/60 bg-card overflow-hidden"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-5 pt-4 pb-2">
                      What happens next
                    </p>
                    {[
                      { icon: Clock,    text: "The barber reviews your request" },
                      { icon: Phone,    text: `We'll text you at ${userDetails.phone || "your number"} to confirm` },
                      { icon: Scissors, text: "Show up and enjoy your cut" },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 px-5 py-3.5 text-sm text-foreground/80",
                        i < 2 && "border-b border-border/50"
                      )}>
                        <div className="w-7 h-7 rounded-full bg-primary/8 text-primary flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {text}
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="space-y-4 w-full max-w-sm"
                  >
                    <p className="text-sm text-muted-foreground">No need to call or text — we've got it from here.</p>
                    <Button size="lg" className="w-full" onClick={() => navigate("/")}>Back to Home</Button>
                  </motion.div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══ STICKY BOTTOM BAR ══ */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-md border-t border-border/60 px-4 py-3 safe-area-bottom">
          <div className="max-w-2xl mx-auto space-y-2.5">

            {/* Step 2: summary + CTA */}
            {step === 2 && (
              <>
                {/* Mini booking summary */}
                <div className="flex items-center gap-2 px-1">
                  <Scissors className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedService
                      ? <><span className="font-semibold text-foreground">{selectedService.name}</span> · {format(selectedDate, "MMM do")} {selectedTime ? `· ${selectedTime}` : ""}</>
                      : <span className="italic">No service selected</span>
                    }
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full font-semibold text-base"
                  onClick={handleNext}
                  disabled={!selectedTime}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <Button
                size="lg"
                className="w-full font-semibold text-base"
                onClick={handleNext}
                disabled={!selectedService}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="w-full space-y-2">
                <Button
                  size="lg"
                  className="w-full font-semibold text-base"
                  onClick={() => {
                    setTouched({ name: true, phone: true });
                    if (step3Valid) submitBooking();
                  }}
                  isLoading={createRequest.isPending}
                  disabled={createRequest.isPending}
                >
                  {createRequest.isPending ? "Sending…" : "Request Appointment"}
                  {!createRequest.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                <p className="text-center text-xs text-muted-foreground/60">
                  No signup needed · Takes a few seconds
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </Layout>
  );
}
