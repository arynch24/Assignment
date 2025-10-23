import { Injectable } from '@nestjs/common';
import { BreakDto, CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DatabaseService } from 'src/database/database.service';
import { ScheduleDto } from './dto/create-doctor.dto';
import { NotFoundException } from '@nestjs/common';
import { AvailabilityHelper } from './helper/availability.helper'
import { is } from 'date-fns/locale';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createDoctorDto: CreateDoctorDto) {
    const { schedule, breaks, ...rest } = createDoctorDto;

    const doctor = await this.databaseService.$transaction(async (databaseService) => {
      // Create doctor
      const doctor = await databaseService.doctor.create({
        data: { ...rest },
      });

      // Bulk create schedules
      await databaseService.doctorSchedule.createMany({
        data: schedule.map((s) => ({ ...s, doctorId: doctor.id })),
      });

      // Bulk create breaks
      await databaseService.doctorBreak.createMany({
        data: breaks.map((b) => ({ ...b, doctorId: doctor.id })),
      });

      return doctor;
    });

    // Get today's date in ISO format
    const today = new Date().toLocaleDateString('en-CA');

    try {
      const availability = await this.getDoctorAvailability(doctor.id, today);
      return {
        ...doctor,
        todayAvailability: {
          date: availability.date,
          isWorkingDay: availability.isWorkingDay,
          workingHours: availability.workingHours,
          currentQueueCount: availability.currentQueueCount,
          estimatedQueueWaitTime: availability.estimatedQueueWaitTime,
          isCurrentlyAvailable: availability.isCurrentlyAvailable,
          statusMessage: availability.statusMessage,
          totalSlotsAvailable: availability.totalSlotsAvailable,
          totalSlotsBooked: availability.totalSlotsBooked,
          nextAvailableSlot: availability.nextAvailableSlot,
        },
      };
    } catch (error) {
      // If there's an error fetching availability, include the doctor without it
      return {
        ...doctor,
        todayAvailability: null,
      };
    }
  }

  async findAll() {
    const doctors = await this.databaseService.doctor.findMany();

    // Get today's date in ISO format
    const today = new Date().toLocaleDateString('en-CA');

    // Fetch availability for each doctor
    const doctorsWithAvailability = await Promise.all(
      doctors.map(async (doctor) => {
        try {
          const availability = await this.getDoctorAvailability(doctor.id, today);
          return {
            ...doctor,
            todayAvailability: {
              date: availability.date,
              isWorkingDay: availability.isWorkingDay,
              workingHours: availability.workingHours,
              currentQueueCount: availability.currentQueueCount,
              estimatedQueueWaitTime: availability.estimatedQueueWaitTime,
              isCurrentlyAvailable: availability.isCurrentlyAvailable,
              statusMessage: availability.statusMessage,
              totalSlotsAvailable: availability.totalSlotsAvailable,
              totalSlotsBooked: availability.totalSlotsBooked,
              nextAvailableSlot: availability.nextAvailableSlot,
            },
          };
        } catch (error) {
          // If there's an error fetching availability, include the doctor without it
          return {
            ...doctor,
            todayAvailability: null,
          };
        }
      })
    );

    return doctorsWithAvailability;
  }

  findOne(id: string) {
    return this.databaseService.doctor.findUnique({
      where: { id }
    });
  }

  findAllSchedules(id: string) {
    const schedules = this.databaseService.doctorSchedule.findMany({
      where: { doctorId: id }
    });

    const breaks = this.databaseService.doctorBreak.findMany({
      where: { doctorId: id }
    });

    return Promise.all([schedules, breaks]);
  }

  update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const { schedule, breaks, ...rest } = updateDoctorDto;
    const doctor = this.databaseService.doctor.update({
      where: { id },
      data: {
        ...rest,
      }
    });

    return doctor;
  }

  updateSchedule(id: string, schedule: ScheduleDto[]) {
    return Promise.all(
      schedule.map(s =>
        this.databaseService.doctorSchedule.update({
          where: {
            id: s.id,
            doctorId: id
          },
          data: { ...s }
        })
      )
    );
  }

  updateBreaks(id: string, breaks: BreakDto[]) {
    return Promise.all(
      breaks.map(b =>
        this.databaseService.doctorBreak.update({
          where: {
            id: b.id,
            doctorId: id
          },
          data: { ...b }
        })
      )
    );
  }

  async remove(id: string) {

    const checkDoctorAppointments = await this.databaseService.appointment.findMany({
      where: {
        doctorId: id,
        status: {
          in: ['BOOKED', 'RESCHEDULED', 'IN_QUEUE']
        }
      }
    });

    const checkDoctorQueue = await this.databaseService.queue.findMany({
      where: {
        doctorId: id,
        status: {
          in: ['WAITING', 'WAITING', 'WITH_DOCTOR',]
        }
      }
    });

    if (checkDoctorAppointments.length > 0 || checkDoctorQueue.length > 0) {
      throw new NotFoundException(`Doctor with ID ${id} has active appointments or is in queue`);
    }


    return this.databaseService.doctor.delete({
      where: { id }
    });
  }

  async getDoctorAvailability(
    doctorId: string,
    dateString: string,
  ) {
    // 1. Verify doctor exists
    const doctor = await this.databaseService.doctor.findUnique({
      where: {
        id: doctorId
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // 2. Parse date and get day of week
    const date = new Date(dateString);
    const dayOfWeek = AvailabilityHelper.getDayOfWeek(date);

    // 3. Get doctor's schedule for this day
    const schedule = await this.databaseService.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isWorking: true
      },
    });

    // If not a working day
    if (!schedule) {
      return this.buildNonWorkingDayResponse(doctorId, dateString);
    }

    // 4. Get breaks for this day
    const breaks = await this.databaseService.doctorBreak.findMany({
      where: { doctorId, dayOfWeek },
      orderBy: { startTime: 'asc' },
    });

    // 5. Get booked appointments for this date
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const appointments = await this.databaseService.appointment.findMany({
      where: {
        doctorId,
        appointmentDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['BOOKED', 'IN_QUEUE', 'RESCHEDULED'],
        },
      },
      include: {
        patient: true,
      },
      orderBy: { appointmentDateTime: 'asc' },
    });

    // 6. Get current queue count
    const queueCount = await this.databaseService.queue.count({
      where: {
        doctorId,
        status: 'WAITING',
      },
    });

    // 7. Calculate estimated queue wait time
    const estimatedQueueWaitTime = AvailabilityHelper.calculateEstimatedWaitTime(queueCount);

    // 8. Generate time slots
    const timeSlots = AvailabilityHelper.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      doctor.consultationDuration || 30,
      breaks,
      appointments,
      targetDate,
    );

    // 9. Find next available slot
    const nextAvailableSlot = AvailabilityHelper.findNextAvailableSlot(timeSlots);

    // 10. Check if currently available
    const isCurrentlyAvailable = AvailabilityHelper.isCurrentlyAvailable(
      dateString,
      schedule,
      breaks,
      appointments,
    );

    // 11. Build response
    return {
      doctorId,
      date: dateString,
      isWorkingDay: true,
      workingHours: {
        start: schedule.startTime,
        end: schedule.endTime,
      },
      breaks: breaks.map(b => ({
        start: b.startTime,
        end: b.endTime,
        type: b.breakType,
      })),
      currentQueueCount: queueCount,
      estimatedQueueWaitTime,
      bookedAppointments: appointments.map(apt => {
        const startTime = AvailabilityHelper.dateTimeToTime(apt.appointmentDateTime);
        const endTime = AvailabilityHelper.minutesToTime(
          AvailabilityHelper.timeToMinutes(startTime) + apt.duration
        );

        return {
          appointmentId: apt.id,
          appointmentNumber: apt.appointmentNumber,
          startTime,
          endTime,
          patientName: apt.patient.name,
          status: apt.status,
        };
      }),
      availableSlots: timeSlots,
      nextAvailableSlot,
      totalSlotsAvailable: timeSlots.filter(s => s.isAvailable).length,
      totalSlotsBooked: appointments.length,
      isCurrentlyAvailable,
      statusMessage: AvailabilityHelper.getStatusMessage(
        isCurrentlyAvailable,
        queueCount,
        timeSlots,
      ),
    };
  }

  private buildNonWorkingDayResponse(
    doctorId: string,
    date: string,
  ) {
    return {
      doctorId,
      date,
      isWorkingDay: false,
      workingHours: null,
      breaks: [],
      currentQueueCount: 0,
      estimatedQueueWaitTime: 0,
      bookedAppointments: [],
      availableSlots: [],
      nextAvailableSlot: null,
      totalSlotsAvailable: 0,
      totalSlotsBooked: 0,
      isCurrentlyAvailable: false,
      statusMessage: 'Doctor is not available on this day',
    };
  }

}
