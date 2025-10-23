import { format } from 'date-fns-tz';

export function generateAppointmentNumber(index: number, appointmentDate: Date): string {
  // Format appointment date in IST
  const istDate = format(appointmentDate, 'yyyyMMdd', { timeZone: 'Asia/Kolkata' });

  // Pad index (e.g., 001, 002, etc.)
  const formattedIndex = String(index).padStart(3, '0');

  // Combine to form appointment number
  return `APT-${istDate}-${formattedIndex}`;
}