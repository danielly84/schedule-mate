import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui/shared";
import { useDashboardData, useUpdateRequestStatus } from "@/hooks/use-mock-api";
import { mockServices } from "@/lib/mock-data";
import { BookingRequest, Appointment } from "@/lib/types";
import { Calendar, CheckCircle2, Clock, Inbox, MessageSquare, Phone, Scissors, ArrowRight, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: BookingRequest["status"] | Appointment["status"] }) {
  switch (status) {
    case "pending":       return <Badge variant="warning">Needs response</Badge>;
    case "accepted":
    case "confirmed":     return <Badge variant="success">Confirmed</Badge>;
    case "declined":      return <Badge variant="destructive">Declined</Badge>;
    case "new-time-sent": return <Badge variant="neutral">New time sent</Badge>;
    default:              return <Badge>{status}</Badge>;
  }
}

function getServiceName(serviceId: string) {
  return mockServices.find(s => s.id === serviceId)?.name ?? "Service";
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardData();
  const updateStatus = useUpdateRequestStatus();
  const { toast } = useToast();

  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [proposedTime, setProposedTime] = useState<string | null>(null);

  const mockAlternativeTimes = [
    { time: "Tomorrow at 10:00 AM", label: "Soonest" },
    { time: "Tomorrow at 1:30 PM",  label: "Later tomorrow" },
    { time: "Wednesday at 9:00 AM", label: "Next day" },
    { time: "Wednesday at 4:00 PM", label: "Later" },
  ];

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-64 bg-secondary animate-pulse rounded-md mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-[400px] bg-secondary rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  const handleAccept = (id: string) => {
    updateStatus.mutate({ id, status: "accepted" }, {
      onSuccess: () =>
        toast({ title: "✓ Appointment accepted", description: "Added to your schedule.", duration: 3000 }),
    });
  };

  const handleDecline = (id: string) => {
    updateStatus.mutate({ id, status: "declined" }, {
      onSuccess: () =>
        toast({ title: "Request declined", description: "The customer has been notified.", duration: 3000 }),
    });
  };

  const handleOpenPropose = (req: BookingRequest) => {
    setSelectedRequest(req);
    setProposedTime(mockAlternativeTimes[0].time); // pre-select soonest by default
    setProposeModalOpen(true);
  };

  const handleSendProposal = () => {
    if (!selectedRequest || !proposedTime) return;
    updateStatus.mutate(
      { id: selectedRequest.id, status: "new-time-sent", newTime: proposedTime },
      {
        onSuccess: () => {
          toast({ title: `New time sent to ${selectedRequest.customerName}`, description: "They'll be notified right away.", duration: 3000 });
          setProposeModalOpen(false);
        },
      }
    );
  };

  const pendingRequests = data.requests.filter(r => r.status === "pending");
  const waitingRequests = data.requests.filter(r => r.status === "new-time-sent");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Good morning, Marcus</h1>
            <p className="text-muted-foreground mt-1 text-sm">Here's what needs your attention today.</p>
          </div>
          <p className="text-sm font-medium text-muted-foreground bg-secondary/60 px-4 py-2 rounded-lg self-start md:self-auto">
            {format(new Date(), "EEEE, MMMM do")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <StatCard label="New Requests" value={data.stats.newRequests} icon={Inbox} />
          <StatCard label="Confirmed Today" value={data.stats.confirmedToday} icon={CheckCircle2} />
          <StatCard label="Open Slots" value={data.stats.openSlots} icon={Clock} />
          <StatCard label="This Week" value={data.stats.thisWeek} icon={Calendar} />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Needs Action — primary focus */}
          <div className="lg:col-span-7 space-y-8">

            {/* Needs Action */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <h2 className="text-xl font-bold text-foreground">Needs action</h2>
                {pendingRequests.length > 0 && (
                  <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <Card className="p-10 text-center flex flex-col items-center bg-secondary/30 border-dashed">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle2 className="w-7 h-7 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-semibold">You're all caught up!</h3>
                  <p className="text-muted-foreground mt-1 text-sm">No requests waiting for a response.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <Card key={req.id} className="overflow-hidden border-2 border-amber-100 shadow-sm">

                      {/* Card body */}
                      <div className="p-5">
                        {/* Name + badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-xl font-bold text-foreground leading-tight">{req.customerName}</h3>
                          <StatusBadge status={req.status} />
                        </div>

                        {/* Date/time */}
                        <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-3">
                          <Calendar className="w-4 h-4 opacity-70 shrink-0" />
                          Requested {format(new Date(req.date), "EEEE, MMM do")} at {req.time}
                        </p>

                        {/* Service + Phone */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Scissors className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">{getServiceName(req.serviceId)}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{req.customerPhone}</span>
                          </span>
                        </div>

                        {/* Note */}
                        {req.note && (
                          <div className="mt-3 bg-secondary/50 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="italic text-foreground/75">"{req.note}"</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="bg-secondary/20 border-t border-border/60 px-4 py-3 flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="success"
                          className="flex-1 font-semibold"
                          onClick={() => handleAccept(req.id)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept Request
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-white"
                          onClick={() => handleOpenPropose(req)}
                          disabled={updateStatus.isPending}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Suggest New Time
                        </Button>
                        <Button
                          variant="outline"
                          className="sm:w-auto border-destructive/40 text-destructive hover:bg-destructive/5 bg-white"
                          onClick={() => handleDecline(req.id)}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Decline
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Waiting on customer (new time sent) */}
            {waitingRequests.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-muted-foreground mb-3">Waiting on customer</h2>
                <div className="space-y-2">
                  {waitingRequests.map(req => (
                    <Card key={req.id} className="px-4 py-3 flex items-center justify-between bg-secondary/20 border border-border/40">
                      <div>
                        <p className="font-semibold text-foreground">{req.customerName}</p>
                        <p className="text-sm text-muted-foreground">You suggested: {req.time}</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT: Today's Schedule — secondary, lighter weight */}
          <div className="lg:col-span-5">
            <section>
              <h2 className="text-base font-semibold text-muted-foreground mb-3 uppercase tracking-wide text-xs">
                Today's schedule
              </h2>

              {data.appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No confirmed appointments yet today.</p>
              ) : (
                <div className="relative border-l-2 border-border/50 ml-3 py-1 space-y-5">
                  {data.appointments.map(appt => (
                    <div key={appt.id} className="relative pl-5">
                      <div className="absolute w-2.5 h-2.5 bg-primary/60 rounded-full -left-[6px] top-2 ring-[3px] ring-background" />
                      <div className="bg-white border border-border/50 p-3 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-primary">{appt.time}</span>
                          <span className="text-xs text-muted-foreground">{appt.duration} min</span>
                        </div>
                        <p className="font-semibold text-foreground">{appt.customerName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{getServiceName(appt.serviceId)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Open slot */}
                  <div className="relative pl-5 opacity-50">
                    <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-2 ring-[3px] ring-background" />
                    <div className="border border-dashed border-border/70 p-3 rounded-xl flex items-center justify-between bg-secondary/30">
                      <span className="text-sm font-semibold text-muted-foreground">3:30 PM</span>
                      <span className="text-xs text-muted-foreground">Open</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

        </div>
      </div>

      {/* Suggest New Time Modal */}
      <Dialog open={proposeModalOpen} onOpenChange={setProposeModalOpen}>
        <DialogContent className="sm:max-w-sm bg-card">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-xl font-bold">Pick a new time</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pick a time that works for you — we'll let{" "}
              <span className="font-medium text-foreground">{selectedRequest?.customerName}</span> know.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            {mockAlternativeTimes.map(({ time, label }, i) => {
              const isSelected = proposedTime === time;
              return (
                <button
                  key={i}
                  onClick={() => setProposedTime(time)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-input bg-white hover:border-primary/50 hover:bg-secondary/40 text-foreground"
                  )}
                >
                  <div>
                    <p className={cn("font-semibold text-sm leading-tight", isSelected ? "text-primary-foreground" : "text-foreground")}>
                      {time}
                    </p>
                    <p className={cn("text-xs mt-0.5", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {label}
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    isSelected ? "border-primary-foreground bg-primary-foreground/20" : "border-input"
                  )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSendProposal}
              disabled={!proposedTime || updateStatus.isPending}
              isLoading={updateStatus.isPending}
              className="flex-1 font-semibold"
            >
              Send this time
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setProposeModalOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
