import { format } from 'date-fns-tz';

export function generateAppointmentNumber(index: number): string {
  // Format current date in IST
  const istDate = format(new Date(), 'yyyyMMdd', { timeZone: 'Asia/Kolkata' });

  // Pad index (e.g., 001, 002, etc.)
  const formattedIndex = String(index).padStart(3, '0');

  // Combine to form appointment number
  return `APT-${istDate}-${formattedIndex}`;
}

