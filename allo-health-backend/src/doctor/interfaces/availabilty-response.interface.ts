export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
  appointmentId?: string;
  unavailableReason: 'PAST' | 'BREAK' | 'APPOINTMENT' | null;
}

export interface BreakInfo {
  start: string;
  end: string;
  type: 'LUNCH' | 'BREAK' | 'MEETING';
}

export interface BookedAppointment {
  appointmentId: string;
  appointmentNumber: string;
  startTime: string;
  endTime: string;
  patientName: string;
  status: string;
}

export interface AvailabilityResponse {
  doctorId: string;
  date: string;
  isWorkingDay: boolean;
  workingHours: {
    start: string;
    end: string;
  } | null;
  breaks: BreakInfo[];
  currentQueueCount: number;
  estimatedQueueWaitTime: number;
  bookedAppointments: BookedAppointment[];
  availableSlots: TimeSlot[];
  nextAvailableSlot: string | null;
  totalSlotsAvailable: number;
  totalSlotsBooked: number;
  isCurrentlyAvailable: boolean;
  statusMessage: string;
}