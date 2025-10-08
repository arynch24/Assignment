export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  location: string;
  phone: string;
  email: string;
  experience: number;
  qualifications?: string | null;
  profilePhoto?: string | null;
  consultationDuration: number;
  maxAppointmentsPerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id?: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
  isWorking: boolean;
}

export interface Break {
  id?: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  breakType: 'LUNCH' | 'BREAK' | 'MEETING';
}

export interface DoctorWithSchedule extends Doctor {
  schedule: Schedule[];
  breaks: Break[];
}

export interface ScheduleResponse {
  schedules: Schedule[];
  breaks: Break[];
}