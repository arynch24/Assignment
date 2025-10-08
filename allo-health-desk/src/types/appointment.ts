import { Patient } from './patient';
import { Doctor } from './doctor';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  appointmentDateTime: string; // ISO date
  duration: number; // minutes
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDateTime: string; // ISO date
  duration: number;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
}

export interface DoctorAvailabilityResponse {
  success: boolean;
  data: {
    doctorId: string;
    date: string;
    isWorkingDay: boolean;
    workingHours: { start: string; end: string };
    breaks: Array<{ start: string; end: string; type: string }>;
    currentQueueCount: number;
    estimatedQueueWaitTime: number;
    bookedAppointments: any[];
    availableSlots: Array<{
      start: string;
      end: string;
      isAvailable: boolean;
    }>;
    nextAvailableSlot: string;
    totalSlotsAvailable: number;
    totalSlotsBooked: number;
    isCurrentlyAvailable: boolean;
    statusMessage: string;
  };
}