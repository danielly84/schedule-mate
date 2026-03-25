import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button, Card, Input, Textarea } from "@/components/ui/shared";
import { useServices, useAvailableTimeSlots, useCreateRequest } from "@/hooks/use-mock-api";
import { Service, UserDetails } from "@/lib/types";
import { format, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronLeft, Clock, Scissors, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Sub-components ---

function StepIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isPast = step < currentStep;
          return (
            <div key={step} className="flex items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                  isActive ? "bg-primary text-primary-foreground shadow-md" : 
                  isPast ? "bg-primary/20 text-primary" : 
                  "bg-secondary text-muted-foreground"
                )}
              >
                {isPast ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              {step < totalSteps && (
                <div className={cn(
                  "w-8 h-1 mx-1 rounded-full transition-colors duration-300",
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

// --- Main Page ---

export default function BookingFlow() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Booking State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', phone: '', note: '' });

  // Data Queries
  const { data: services, isLoading: isLoadingServices } = useServices();
  const { data: timeSlots, isLoading: isLoadingTimes } = useAvailableTimeSlots(format(selectedDate, 'yyyy-MM-dd'));
  const createRequest = useCreateRequest();

  // Generate next 14 days for date selection
  const upcomingDates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // Handlers
  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else navigate('/');
  };

  const submitBooking = () => {
    if (!selectedService || !selectedTime) return;
    
    createRequest.mutate({
      serviceId: selectedService.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      customerName: userDetails.name,
      customerPhone: userDetails.phone,
      note: userDetails.note
    }, {
      onSuccess: () => handleNext() // Move to success step
    });
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        
        {step < 5 && (
          <div className="mb-6 flex items-center">
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-display font-semibold ml-2">Request an Appointment</h1>
          </div>
        )}

        {step < 5 && <StepIndicator currentStep={step} totalSteps={4} />}

        <div className="relative">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-medium">What do you need today?</h2>
                    <p className="text-muted-foreground mt-1">Select a service to get started.</p>
                  </div>

                  {isLoadingServices ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {services?.map(service => (
                        <Card 
                          key={service.id}
                          className={cn(
                            "p-5 cursor-pointer transition-all duration-200 border-2",
                            selectedService?.id === service.id 
                              ? "border-primary bg-primary/5 shadow-md" 
                              : "border-transparent hover:border-border hover:shadow-sm"
                          )}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm font-medium text-foreground/80">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1 opacity-70"/> {service.duration} min</span>
                                <span>${service.price}</span>
                              </div>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              selectedService?.id === service.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                              {selectedService?.id === service.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t flex justify-end">
                    <Button 
                      size="lg" 
                      onClick={handleNext} 
                      disabled={!selectedService}
                      className="w-full sm:w-auto"
                    >
                      Continue to Date
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-medium">Choose a day</h2>
                    <p className="text-muted-foreground mt-1">When would you like to come in?</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {upcomingDates.map((date, i) => {
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                          className={cn(
                            "p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center",
                            isSelected 
                              ? "border-primary bg-primary text-primary-foreground shadow-md -translate-y-1" 
                              : "border-input bg-background hover:border-primary/50 text-foreground"
                          )}
                        >
                          <span className={cn("text-xs font-semibold uppercase tracking-wider mb-1", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {isToday ? 'Today' : format(date, 'EEE')}
                          </span>
                          <span className="text-2xl font-display font-bold">
                            {format(date, 'd')}
                          </span>
                          <span className={cn("text-xs mt-1", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {format(date, 'MMM')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t flex justify-between">
                    <Button variant="ghost" onClick={handleBack}>Back</Button>
                    <Button size="lg" onClick={handleNext}>Continue to Time</Button>
                  </div>
                </div>
              )}

              {/* STEP 3: TIME */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-medium">Choose a time</h2>
                    <p className="text-muted-foreground mt-1">For {format(selectedDate, 'EEEE, MMMM do')}</p>
                  </div>

                  {isLoadingTimes ? (
                     <div className="grid grid-cols-3 gap-3">
                       {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-12 rounded-xl bg-secondary animate-pulse" />)}
                     </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots?.map((slot, i) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={i}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                              "py-3 px-2 rounded-xl border-2 text-center font-medium transition-all",
                              !slot.available && "opacity-40 bg-secondary/50 border-transparent cursor-not-allowed text-muted-foreground",
                              slot.available && !isSelected && "border-input bg-background hover:border-primary/50 text-foreground",
                              isSelected && "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                            )}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t flex justify-between">
                    <Button variant="ghost" onClick={handleBack}>Back</Button>
                    <Button size="lg" onClick={handleNext} disabled={!selectedTime}>Continue to Details</Button>
                  </div>
                </div>
              )}

              {/* STEP 4: DETAILS */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-medium">Your Details</h2>
                    <p className="text-muted-foreground mt-1">Almost done! We just need your info to send the request.</p>
                  </div>

                  {/* Summary Card */}
                  <Card className="p-4 bg-secondary/50 border-none mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Request Summary</h4>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Scissors className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{selectedService?.name}</p>
                        <p className="text-foreground/80 flex items-center gap-1.5 mt-1">
                          <CalendarIcon className="w-4 h-4 opacity-70"/> 
                          {format(selectedDate, 'MMM do')} at {selectedTime}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
                      <Input 
                        placeholder="John Doe" 
                        value={userDetails.name}
                        onChange={e => setUserDetails(p => ({...p, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 ml-1">Phone Number</label>
                      <Input 
                        placeholder="(555) 000-0000" 
                        type="tel"
                        value={userDetails.phone}
                        onChange={e => setUserDetails(p => ({...p, phone: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 ml-1">Note (Optional)</label>
                      <Textarea 
                        placeholder="Anything the barber should know?" 
                        value={userDetails.note}
                        onChange={e => setUserDetails(p => ({...p, note: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mt-6 flex gap-3 text-sm text-foreground/80">
                    <Clock className="w-5 h-5 shrink-0 text-accent-foreground mt-0.5" />
                    <p>
                      <strong>This is a request, not a confirmed booking.</strong> The barber will review your request and confirm or suggest a new time shortly.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t flex justify-between">
                    <Button variant="ghost" onClick={handleBack} disabled={createRequest.isPending}>Back</Button>
                    <Button 
                      size="lg" 
                      onClick={submitBooking} 
                      isLoading={createRequest.isPending}
                      disabled={!userDetails.name || !userDetails.phone}
                    >
                      Send Request
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS */}
              {step === 5 && (
                <div className="text-center py-10 space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-[#2d6a4f]/10 text-[#2d6a4f] rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-display font-bold">Request Sent!</h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Your request for a <strong>{selectedService?.name}</strong> on <strong>{format(selectedDate, 'MMM do')} at {selectedTime}</strong> has been sent to the barber.
                  </p>
                  
                  <p className="text-muted-foreground">
                    They will text you at {userDetails.phone} to confirm or suggest another time.
                  </p>

                  <div className="pt-8">
                    <Button size="lg" onClick={() => navigate('/')}>Return to Home</Button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
