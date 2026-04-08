import { Service, BookingRequest, Appointment } from './types';
import { addDays, format } from 'date-fns';

export const mockServices: Service[] = [
  // Haircuts
  { id: 's1',  category: 'Haircuts',    name: "Women's Haircut",       duration: 60,  price: 85,  description: "Cut and style tailored to your hair type and face shape." },
  { id: 's2',  category: 'Haircuts',    name: "Trim",                  duration: 30,  price: 45,  description: "Clean up and refresh your existing style." },
  { id: 's3',  category: 'Haircuts',    name: "Blowout",               duration: 45,  price: 55,  description: "Shampoo, condition, and professional blowout." },
  // Color
  { id: 's4',  category: 'Color',       name: "Root Touch-Up",         duration: 90,  price: 120, description: "Refresh your color at the roots for a seamless look." },
  { id: 's5',  category: 'Color',       name: "Full Color",            duration: 120, price: 180, description: "Single-process color applied root to end." },
  { id: 's6',  category: 'Color',       name: "Highlights",            duration: 150, price: 220, description: "Partial or full highlights to add dimension and brightness." },
  { id: 's7',  category: 'Color',       name: "Balayage",              duration: 180, price: 280, description: "Hand-painted color for a natural, sun-kissed effect." },
  // Styling
  { id: 's8',  category: 'Styling',     name: "Blowout Styling",       duration: 45,  price: 55,  description: "A polished, smooth blowout for any occasion." },
  { id: 's9',  category: 'Styling',     name: "Event Styling",         duration: 60,  price: 95,  description: "Updo, waves, or custom style for your special event." },
  { id: 's10', category: 'Styling',     name: "Bridal Trial",          duration: 90,  price: 150, description: "Test run of your wedding day hair look." },
  // Treatments
  { id: 's11', category: 'Treatments',  name: "Deep Conditioning",     duration: 30,  price: 40,  description: "Intensive moisture treatment for dry or damaged hair." },
  { id: 's12', category: 'Treatments',  name: "Keratin Treatment",     duration: 120, price: 250, description: "Smooth frizz and restore shine for up to 3 months." },
  { id: 's13', category: 'Treatments',  name: "Scalp Treatment",       duration: 45,  price: 70,  description: "Targeted treatment for scalp health and hydration." },
  // Extensions
  { id: 's14', category: 'Extensions',  name: "Extension Consultation",duration: 30,  price: 50,  description: "Discuss your goals and find the right extension method." },
  { id: 's15', category: 'Extensions',  name: "Extension Install",     duration: 180, price: 350, priceDisplay: "$350+", description: "Full installation of your chosen extension method." },
];

const today    = new Date();
const tomorrow = addDays(today, 1);
const dayAfter = addDays(today, 2);
const nextWeek = addDays(today, 4);

export const formatMockDate = (date: Date) => format(date, 'yyyy-MM-dd');

// In-memory store for our mock API
export const store = {
  requests: [
    {
      id: 'req_1',
      status: 'pending',
      customerName: 'Jade Williams',
      customerPhone: '555-0123',
      serviceId: 's1',
      date: formatMockDate(tomorrow),
      time: '2:00 PM',
      note: 'Please trim about 2 inches and keep the layers',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req_2',
      status: 'pending',
      customerName: 'Maria Santos',
      customerPhone: '555-0456',
      serviceId: 's4',
      date: formatMockDate(dayAfter),
      time: '11:00 AM',
      note: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req_3',
      status: 'pending',
      customerName: 'Devon Clark',
      customerPhone: '555-0789',
      serviceId: 's7',
      date: formatMockDate(nextWeek),
      time: '3:00 PM',
      note: 'First time getting balayage',
      createdAt: new Date().toISOString(),
    }
  ] as BookingRequest[],

  appointments: [
    {
      id: 'app_1',
      customerName: 'Sofia Rivera',
      serviceId: 's1',
      date: formatMockDate(today),
      time: '9:00 AM',
      duration: 60,
      status: 'confirmed'
    },
    {
      id: 'app_2',
      customerName: 'Aisha Thompson',
      serviceId: 's4',
      date: formatMockDate(today),
      time: '10:30 AM',
      duration: 90,
      status: 'confirmed'
    },
    {
      id: 'app_3',
      customerName: 'Priya Patel',
      serviceId: 's11',
      date: formatMockDate(today),
      time: '12:00 PM',
      duration: 30,
      status: 'confirmed'
    },
    {
      id: 'app_4',
      customerName: 'Camille Nguyen',
      serviceId: 's6',
      date: formatMockDate(today),
      time: '2:00 PM',
      duration: 150,
      status: 'confirmed'
    }
  ] as Appointment[]
};

// Deterministic date availability based on day offset from today
export type DateAvailStatus = 'available' | 'limited' | 'almost-full' | 'full';
export interface DateAvailInfo { status: DateAvailStatus; label: string }

export function getDateAvailability(dayOffset: number): DateAvailInfo {
  if (dayOffset === 0) return { status: 'available', label: 'Available' };
  const p = dayOffset % 13;
  if (p === 4)  return { status: 'limited',     label: 'Few spots left' };
  if (p === 7)  return { status: 'limited',     label: '2 spots left'  };
  if (p === 10) return { status: 'almost-full', label: 'Almost full'   };
  if (p === 12) return { status: 'full',        label: 'Fully booked'  };
  return { status: 'available', label: 'Available' };
}

export const availableTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];
