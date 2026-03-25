import { Service, BookingRequest, Appointment } from './types';
import { addDays, format } from 'date-fns';

export const mockServices: Service[] = [
  { id: 's1', name: 'Haircut', duration: 45, price: 40, description: 'Classic tailored haircut with a hot towel finish.' },
  { id: 's2', name: 'Beard Trim', duration: 20, price: 20, description: 'Sculpting, shaping, and line up for your beard.' },
  { id: 's3', name: 'Haircut + Beard', duration: 60, price: 55, description: 'The complete package for hair and beard.' },
  { id: 's4', name: 'Line Up', duration: 15, price: 15, description: 'Quick edge up around the hairline and neck.' },
];

const today = new Date();
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
      customerName: 'James Williams',
      customerPhone: '555-0123',
      serviceId: 's1',
      date: formatMockDate(tomorrow),
      time: '2:00 PM',
      note: 'Please make sure to trim the sides too',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req_2',
      status: 'pending',
      customerName: 'Maria Santos',
      customerPhone: '555-0456',
      serviceId: 's2',
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
      serviceId: 's3',
      date: formatMockDate(nextWeek),
      time: '3:00 PM',
      note: 'First time customer',
      createdAt: new Date().toISOString(),
    }
  ] as BookingRequest[],

  appointments: [
    {
      id: 'app_1',
      customerName: 'Carlos Rivera',
      serviceId: 's1',
      date: formatMockDate(today),
      time: '9:00 AM',
      duration: 45,
      status: 'confirmed'
    },
    {
      id: 'app_2',
      customerName: 'Aisha Thompson',
      serviceId: 's2',
      date: formatMockDate(today),
      time: '10:30 AM',
      duration: 20,
      status: 'confirmed'
    },
    {
      id: 'app_3',
      customerName: 'Kwame Johnson',
      serviceId: 's4',
      date: formatMockDate(today),
      time: '12:00 PM',
      duration: 15,
      status: 'confirmed'
    },
    {
      id: 'app_4',
      customerName: 'Sofia Mendez',
      serviceId: 's3',
      date: formatMockDate(today),
      time: '2:30 PM',
      duration: 60,
      status: 'confirmed'
    }
  ] as Appointment[]
};

// Deterministic date availability based on day offset from today
export type DateAvailStatus = 'available' | 'limited' | 'almost-full' | 'full';
export interface DateAvailInfo { status: DateAvailStatus; label: string }

export function getDateAvailability(dayOffset: number): DateAvailInfo {
  // Today is always available (barber could be free)
  if (dayOffset === 0) return { status: 'available', label: 'Available' };
  const p = dayOffset % 13;
  if (p === 4)  return { status: 'limited',     label: '3 spots left' };
  if (p === 7)  return { status: 'limited',     label: '2 spots left' };
  if (p === 10) return { status: 'almost-full', label: 'Almost full'  };
  if (p === 12) return { status: 'full',        label: 'Fully booked' };
  return { status: 'available', label: 'Available' };
}

export const availableTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];
