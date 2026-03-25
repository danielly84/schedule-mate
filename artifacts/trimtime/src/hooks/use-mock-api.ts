import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { store, mockServices, availableTimeSlots } from "@/lib/mock-data";
import { BookingRequest, Appointment, RequestStatus } from "@/lib/types";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      await delay(100);
      return [...mockServices];
    }
  });
}

export function useAvailableTimeSlots(date: string) {
  return useQuery({
    queryKey: ['timeSlots', date],
    queryFn: async () => {
      await delay(100);
      // Randomly disable some slots to simulate existing bookings
      const seed = date.length; 
      return availableTimeSlots.map((time, i) => ({
        time,
        available: (i + seed) % 3 !== 0 
      }));
    }
  });
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      await delay(100);
      return {
        requests: [...store.requests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        appointments: [...store.appointments].sort((a, b) => {
          // Simple time string comparison works since we format as 09:00 AM etc.
          // For real apps, convert to Date objects.
          const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
          const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
          return timeA - timeB;
        }),
        stats: {
          newRequests: store.requests.filter(r => r.status === 'pending').length,
          confirmedToday: store.appointments.filter(a => a.date === store.appointments[0]?.date).length,
          openSlots: 4, // Mocked
          thisWeek: store.appointments.length + 8 // Mocked
        }
      };
    }
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => {
      await delay(1000);
      const newRequest: BookingRequest = {
        ...req,
        id: `req_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      store.requests.unshift(newRequest);
      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, newTime }: { id: string; status: RequestStatus, newTime?: string }) => {
      await delay(500);
      const reqIndex = store.requests.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Request not found");
      
      const req = store.requests[reqIndex];
      req.status = status;
      
      if (status === 'new-time-sent' && newTime) {
        req.time = newTime;
      }
      
      if (status === 'accepted') {
        // Move to appointments
        const appt: Appointment = {
          id: `app_${Math.random().toString(36).substr(2, 9)}`,
          customerName: req.customerName,
          serviceId: req.serviceId,
          date: req.date,
          time: req.time,
          duration: mockServices.find(s => s.id === req.serviceId)?.duration || 30,
          status: 'confirmed'
        };
        store.appointments.push(appt);
        // Remove from requests
        store.requests.splice(reqIndex, 1);
      }
      
      if (status === 'declined') {
         store.requests.splice(reqIndex, 1);
      }
      
      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
