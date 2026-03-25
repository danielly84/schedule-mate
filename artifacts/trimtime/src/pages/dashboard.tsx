import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui/shared";
import { useDashboardData, useUpdateRequestStatus } from "@/hooks/use-mock-api";
import { BookingRequest, Appointment } from "@/lib/types";
import { Calendar, CheckCircle2, Clock, Inbox, MessageSquare, Scissors, XCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: BookingRequest['status'] | Appointment['status'] }) {
  switch (status) {
    case 'pending': return <Badge variant="warning">Pending Request</Badge>;
    case 'accepted':
    case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
    case 'declined': return <Badge variant="destructive">Declined</Badge>;
    case 'new-time-sent': return <Badge variant="neutral">New Time Proposed</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardData();
  const updateStatus = useUpdateRequestStatus();
  const { toast } = useToast();
  
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [proposedTime, setProposedTime] = useState<string | null>(null);

  const mockAlternativeTimes = ["Tomorrow at 10:00 AM", "Tomorrow at 1:30 PM", "Wednesday at 9:00 AM", "Wednesday at 4:00 PM"];

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-64 bg-secondary animate-pulse rounded-md mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-secondary rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-[400px] bg-secondary rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  const handleAccept = (id: string) => {
    updateStatus.mutate({ id, status: 'accepted' }, {
      onSuccess: () => toast({ title: "Request Accepted", description: "The appointment has been added to your schedule.", duration: 3000 })
    });
  };

  const handleDecline = (id: string) => {
    updateStatus.mutate({ id, status: 'declined' }, {
      onSuccess: () => toast({ title: "Request Declined", description: "The request has been removed.", variant: "destructive", duration: 3000 })
    });
  };

  const handleOpenPropose = (req: BookingRequest) => {
    setSelectedRequest(req);
    setProposedTime(null);
    setProposeModalOpen(true);
  };

  const handleSendProposal = () => {
    if (!selectedRequest || !proposedTime) return;
    updateStatus.mutate({ 
      id: selectedRequest.id, 
      status: 'new-time-sent', 
      newTime: proposedTime 
    }, {
      onSuccess: () => {
        toast({ title: "New Time Sent", description: "Customer will be notified of the new time.", duration: 3000 });
        setProposeModalOpen(false);
      }
    });
  };

  const pendingRequests = data.requests.filter(r => r.status === 'pending');
  const pastRequests = data.requests.filter(r => r.status !== 'pending'); // new-time-sent etc

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Good morning, Marcus</h1>
            <p className="text-muted-foreground mt-1">Here is what's happening with your schedule today.</p>
          </div>
          <div className="text-right text-sm font-medium text-foreground/80 bg-secondary/50 px-4 py-2 rounded-lg inline-block self-start md:self-auto">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="New Requests" value={data.stats.newRequests} icon={Inbox} />
          <StatCard label="Confirmed Today" value={data.stats.confirmedToday} icon={CheckCircle2} />
          <StatCard label="Open Slots" value={data.stats.openSlots} icon={Clock} />
          <StatCard label="This Week" value={data.stats.thisWeek} icon={Calendar} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column - Action Items */}
          <div className="lg:col-span-7 space-y-8">
            
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Waiting for your response
                </h2>
                {pendingRequests.length > 0 && <Badge variant="warning">{pendingRequests.length} Pending</Badge>}
              </div>

              {pendingRequests.length === 0 ? (
                <Card className="p-10 text-center flex flex-col items-center bg-secondary/30 border-dashed">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-medium">You're all caught up!</h3>
                  <p className="text-muted-foreground mt-1">No new appointment requests right now.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <Card key={req.id} className="overflow-hidden border-2 border-primary/10 shadow-sm transition-all hover:shadow-md">
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold">{req.customerName}</h3>
                              <StatusBadge status={req.status} />
                            </div>
                            <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 opacity-70" />
                              Requested: {format(new Date(req.date), 'MMM do')} at {req.time}
                            </p>
                            
                            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Scissors className="w-4 h-4" /> Service</span>
                              <span className="flex items-center gap-1 text-foreground">{req.customerPhone}</span>
                            </div>
                            
                            {req.note && (
                              <div className="mt-3 bg-secondary/50 p-3 rounded-lg text-sm flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="italic text-foreground/80">"{req.note}"</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                      
                      <div className="bg-secondary/30 border-t p-3 flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="success" 
                          className="flex-1"
                          onClick={() => handleAccept(req.id)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Time
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-white"
                          onClick={() => handleOpenPropose(req)}
                          disabled={updateStatus.isPending}
                        >
                          <Clock className="w-4 h-4 mr-2" /> Suggest Other Time
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDecline(req.id)}
                          disabled={updateStatus.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Other Requests (like Proposed new time) */}
            {pastRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 text-muted-foreground">Waiting on Customer</h2>
                <div className="space-y-3">
                  {pastRequests.map(req => (
                    <Card key={req.id} className="p-4 flex items-center justify-between opacity-80 bg-secondary/20">
                      <div>
                        <p className="font-semibold">{req.customerName}</p>
                        <p className="text-sm text-muted-foreground">Proposed: {req.time}</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column - Schedule */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
              <Card className="p-1 border-none shadow-md bg-white">
                <div className="bg-secondary/30 rounded-xl p-4">
                  
                  {data.appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No appointments confirmed for today.</div>
                  ) : (
                    <div className="relative border-l-2 border-border ml-3 py-2 space-y-6">
                      {data.appointments.map((appt, i) => (
                        <div key={appt.id} className="relative pl-6">
                          {/* Timeline dot */}
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2 ring-4 ring-white" />
                          
                          <div className="bg-white p-3 rounded-xl shadow-sm border group hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-primary">{appt.time}</span>
                              <span className="text-xs font-medium text-muted-foreground">{appt.duration} min</span>
                            </div>
                            <p className="font-semibold text-foreground text-lg">{appt.customerName}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5" /> Confirmed
                              </p>
                              <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Details</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Fake Open Slot */}
                      <div className="relative pl-6 opacity-60">
                         <div className="absolute w-3 h-3 bg-border rounded-full -left-[7px] top-2 ring-4 ring-white" />
                         <div className="bg-secondary/50 border-dashed border-2 border-border p-3 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-muted-foreground">3:30 PM</span>
                            <span className="text-sm text-muted-foreground font-medium">Open Slot</span>
                         </div>
                      </div>

                    </div>
                  )}
                  
                </div>
              </Card>
            </section>
          </div>

        </div>
      </div>

      {/* Suggest Time Modal */}
      <Dialog open={proposeModalOpen} onOpenChange={setProposeModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Suggest a different time</DialogTitle>
            <DialogDescription>
              {selectedRequest?.customerName} requested {selectedRequest?.time}. Pick an alternative time to send them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {mockAlternativeTimes.map((time, i) => (
              <button
                key={i}
                onClick={() => setProposedTime(time)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium flex justify-between items-center",
                  proposedTime === time 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-input hover:border-primary/40 text-foreground"
                )}
              >
                {time}
                {proposedTime === time && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>

          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button variant="ghost" onClick={() => setProposeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendProposal} disabled={!proposedTime || updateStatus.isPending}>
              Send Proposal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
