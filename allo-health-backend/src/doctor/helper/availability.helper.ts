import { TimeSlot } from '../interfaces/availabilty-response.interface';
import { DoctorBreak, Appointment } from 'generated/prisma';

export class AvailabilityHelper {
    /**
     * Get day of week from date
     */
    static getDayOfWeek(date: Date): any {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        return days[date.getDay()];
    }

    /**
     * Convert time string (HH:MM:SS) to minutes
     */
    static timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Convert minutes to time string (HH:MM:SS)
     */
    static minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    }

    /**
     * Extract time string from DateTime object
     */
    static dateTimeToTime(dateTime: Date): string {
        const date = new Date(dateTime);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Check if two time ranges overlap
     */
    static isTimeOverlap(
        start1: string,
        end1: string,
        start2: string,
        end2: string,
    ): boolean {
        const s1 = this.timeToMinutes(start1);
        const e1 = this.timeToMinutes(end1);
        const s2 = this.timeToMinutes(start2);
        const e2 = this.timeToMinutes(end2);

        return s1 < e2 && e1 > s2;
    }

    /**
     * Generate time slots for a given time range
     */
    static generateTimeSlots(
        startTime: string,
        endTime: string,
        duration: number,
        breaks: DoctorBreak[],
        appointments: Appointment[],
        targetDate: Date,
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);

        // Check if the date is today and get current time in minutes
        const now = new Date();
        const isToday = targetDate.toDateString() === now.toDateString();
        const isPastDate = targetDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let currentTime = start;

        while (currentTime + duration <= end) {
            const slotStart = this.minutesToTime(currentTime);
            const slotEnd = this.minutesToTime(currentTime + duration);

            // Check if slot is in the past
            // - If date is in the past, all slots are past
            // - If date is today, check if slot time is before current time
            const isPastTime = isPastDate || (isToday && currentTime < currentMinutes);

            // Check if slot overlaps with break
            const isBreakTime = breaks.some(b =>
                this.isTimeOverlap(slotStart, slotEnd, b.startTime, b.endTime),
            );

            // Check if slot is booked
            const bookedAppointment = appointments.find(apt => {
                const aptStartTime = this.dateTimeToTime(apt.appointmentDateTime);
                const aptEndTime = this.minutesToTime(
                    this.timeToMinutes(aptStartTime) + apt.duration
                );
                return this.isTimeOverlap(slotStart, slotEnd, aptStartTime, aptEndTime);
            });

            // Determine unavailability reason
            let unavailableReason: 'PAST' | 'BREAK' | 'APPOINTMENT' | null = null;
            if (isPastTime) {
                unavailableReason = 'PAST';
            } else if (isBreakTime) {
                unavailableReason = 'BREAK';
            } else if (bookedAppointment) {
                unavailableReason = 'APPOINTMENT';
            }

            slots.push({
                start: slotStart,
                end: slotEnd,
                isAvailable: !isPastTime && !isBreakTime && !bookedAppointment,
                appointmentId: bookedAppointment?.id,
                unavailableReason, // Add reason tag
            });

            currentTime += duration;
        }

        return slots;
    }

    /**
     * Find the next available slot from a list of time slots
     */
    static findNextAvailableSlot(slots: TimeSlot[]): string | null {
        const availableSlot = slots.find(slot => slot.isAvailable);
        return availableSlot ? availableSlot.start : null;
    }

    /**
     * Check if doctor is currently available
     */
    static isCurrentlyAvailable(
        dateString: string,
        schedule: { startTime: string; endTime: string },
        breaks: DoctorBreak[],
        appointments: Appointment[],
    ): boolean {
        const now = new Date();
        const checkDate = new Date(dateString);

        // Get IST date components
        const istDateStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const istDate = new Date(istDateStr);

        // Check if the date is today (in IST)
        if (
            istDate.getFullYear() !== checkDate.getFullYear() ||
            istDate.getMonth() !== checkDate.getMonth() ||
            istDate.getDate() !== checkDate.getDate()
        ) {
            return false;
        }

        const currentTime = `${istDate.getHours().toString().padStart(2, '0')}:${istDate.getMinutes().toString().padStart(2, '0')}:00`;
        const currentMinutes = this.timeToMinutes(currentTime);
        const workStart = this.timeToMinutes(schedule.startTime);
        const workEnd = this.timeToMinutes(schedule.endTime);

        // Check if within working hours
        if (currentMinutes < workStart || currentMinutes >= workEnd) {
            return false;
        }

        // Check if in break time
        const isInBreak = breaks.some(b => {
            const breakStart = this.timeToMinutes(b.startTime);
            const breakEnd = this.timeToMinutes(b.endTime);
            return currentMinutes >= breakStart && currentMinutes < breakEnd;
        });

        if (isInBreak) {
            return false;
        }

        // Check if in appointment
        const isInAppointment = appointments.some(apt => {
            const aptStartTime = this.dateTimeToTime(apt.appointmentDateTime);
            const aptStart = this.timeToMinutes(aptStartTime);
            const aptEnd = aptStart + apt.duration;
            return currentMinutes >= aptStart && currentMinutes < aptEnd;
        });

        return !isInAppointment;
    }

    /**
     * Get status message based on availability
     */
    static getStatusMessage(
        isCurrentlyAvailable: boolean,
        queueCount: number,
        slots: TimeSlot[],
    ): string {
        if (!isCurrentlyAvailable) {
            return 'Doctor is currently unavailable';
        }

        if (queueCount > 10) {
            return 'Doctor is heavily booked. Long wait expected.';
        }

        if (queueCount > 5) {
            return 'Doctor is moderately busy';
        }

        const availableSlots = slots.filter(s => s.isAvailable).length;
        if (availableSlots === 0) {
            return 'No slots available today';
        }

        return 'Doctor is available';
    }

    /**
     * Calculate estimated queue wait time
     */
    static calculateEstimatedWaitTime(queueCount: number, avgConsultationTime: number = 15): number {
        return queueCount * avgConsultationTime;
    }
}