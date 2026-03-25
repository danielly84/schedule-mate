export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'new-time-sent';

export interface BookingRequest {
  id: string;
  status: RequestStatus;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  note?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export interface UserDetails {
  name: string;
  phone: string;
  note: string;
}
