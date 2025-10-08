import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { AddAppointmentToQueueDto } from './dto/add-appointment-to-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { QueueStatus, QueuePriority, QueueType, AppointmentStatus } from 'generated/prisma';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class QueueService {
  constructor(private readonly databaseService: DatabaseService) { }

  // Generate queue number based on doctor and today's count
  private async generateQueueNumber(doctorId: string): Promise<string> {
    const today = new Date();
    const count = await this.databaseService.queue.count({
      where: {
        doctorId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    const queueNum = (count + 1).toString().padStart(3, '0');
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    return `Q-${doctorId.slice(0, 8)}-${dateStr}-${queueNum}`;
  }

  // Add walk-in patient to queue
  async addWalkInToQueue(createQueueDto: CreateQueueDto, userId: string) {
    const { patientId, doctorId, priority = QueuePriority.NORMAL, notes } = createQueueDto;

    // Verify patient exists
    const patient = await this.databaseService.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify doctor exists
    const doctor = await this.databaseService.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if patient is already in queue for this doctor
    const existingQueue = await this.databaseService.queue.findFirst({
      where: {
        patientId,
        doctorId,
        status: {
          in: [QueueStatus.WAITING, QueueStatus.WITH_DOCTOR],
        },
      },
    });

    if (existingQueue) {
      throw new BadRequestException('Patient is already in queue for this doctor');
    }

    const queueNumber = await this.generateQueueNumber(doctorId);

    return this.databaseService.queue.create({
      data: {
        queueNumber,
        patientId,
        doctorId,
        type: QueueType.WALK_IN,
        priority,
        notes,
        addedBy: userId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  // Add patient with appointment to queue
  async addAppointmentToQueue(dto: AddAppointmentToQueueDto, userId: string) {
    const { appointmentId, doctorId, notes } = dto;

    // Fetch appointment
    const appointment = await this.databaseService.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new BadRequestException('Appointment is not for this doctor');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Appointment is already completed');
    }

    // Check if already in queue
    const existingQueue = await this.databaseService.queue.findFirst({
      where: {
        patientId: appointment.patientId,
        doctorId,
        status: {
          in: [QueueStatus.WAITING, QueueStatus.WITH_DOCTOR],
        },
      },
    });

    if (existingQueue) {
      throw new BadRequestException('Patient is already in queue for this doctor');
    }

    const queueNumber = await this.generateQueueNumber(doctorId);

    // Create queue entry with appointment reference
    const queue = await this.databaseService.queue.create({
      data: {
        queueNumber,
        patientId: appointment.patientId,
        doctorId,
        appointmentId: appointment.id,
        type: QueueType.APPOINTMENT,
        priority: QueuePriority.NORMAL, // Appointments use NORMAL priority, sorted by appointment time
        notes: notes || `Appointment: ${appointment.appointmentNumber}`,
        addedBy: userId,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    // Update appointment status to checked-in
    // await this.databaseService.appointment.update({
    //   where: { id: appointmentId },
    //   data: { status: AppointmentStatus.CHECKED_IN },
    // });

    return queue;
  }

  // Get doctor's queue with intelligent sorting
  async getDoctorQueue(doctorId: string, status?: QueueStatus, date?: string) {
    const where: any = { doctorId };

    // Date filter - default to today
    const filterDate = date ? new Date(date) : new Date();
    where.createdAt = {
      gte: startOfDay(filterDate),
      lte: endOfDay(filterDate),
    };

    if (status) {
      where.status = status;
    }

    const queue = await this.databaseService.queue.findMany({
      where,
      select: {
        id: true,
        queueNumber: true,
        doctorId: true,
        patientId: true,
        status: true,
        type: true,
        priority: true,
        startedAt: true,
        completedAt: true,
        notes: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
            email: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            gender: true,
          }
        },
        appointment: {
          select: {
            id: true,
            appointmentNumber: true,
            appointmentDateTime: true,
            status: true,
          }
        }
      }
    });

    // Custom sorting logic in memory
    const sortedQueue = queue.sort((a, b) => {
      // 1. First sort by status (WITH_DOCTOR comes first)
      if (a.status === QueueStatus.WITH_DOCTOR && b.status !== QueueStatus.WITH_DOCTOR) return -1;
      if (a.status !== QueueStatus.WITH_DOCTOR && b.status === QueueStatus.WITH_DOCTOR) return 1;

      // 2. Then by priority (URGENT comes before NORMAL)
      if (a.priority === QueuePriority.URGENT && b.priority !== QueuePriority.URGENT) return -1;
      if (a.priority !== QueuePriority.URGENT && b.priority === QueuePriority.URGENT) return 1;

      // 3. For NORMAL priority, separate logic for appointments vs walk-ins
      if (a.priority === QueuePriority.NORMAL && b.priority === QueuePriority.NORMAL) {
        // Both are appointments - sort by appointment time
        if (a.type === QueueType.APPOINTMENT && b.type === QueueType.APPOINTMENT) {
          const aTime = a.appointment?.appointmentDateTime?.getTime() || 0;
          const bTime = b.appointment?.appointmentDateTime?.getTime() || 0;
          return aTime - bTime;
        }

        // Appointment comes before walk-in if appointment time is in the past or near current time
        if (a.type === QueueType.APPOINTMENT && b.type === QueueType.WALK_IN) {
          const appointmentTime = a.appointment?.appointmentDateTime?.getTime() || 0;
          const now = Date.now();
          const walkInTime = b.createdAt.getTime();

          // If appointment time is before walk-in arrival, appointment goes first
          if (appointmentTime <= walkInTime) return -1;
          // Otherwise walk-in goes first
          return 1;
        }

        if (a.type === QueueType.WALK_IN && b.type === QueueType.APPOINTMENT) {
          const appointmentTime = b.appointment?.appointmentDateTime?.getTime() || 0;
          const now = Date.now();
          const walkInTime = a.createdAt.getTime();

          // If appointment time is before walk-in arrival, appointment goes first
          if (appointmentTime <= walkInTime) return 1;
          // Otherwise walk-in goes first
          return -1;
        }

        // Both are walk-ins - sort by arrival time (createdAt)
        if (a.type === QueueType.WALK_IN && b.type === QueueType.WALK_IN) {
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
      }

      // Default: sort by createdAt
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return sortedQueue;
  }

  // Get all queues (for admin/reception)
  async getAllQueues(status?: QueueStatus, date?: string) {
    const where: any = {};

    // Date filter - default to today
    const filterDate = date ? new Date(date) : new Date();
    where.createdAt = {
      gte: startOfDay(filterDate),
      lte: endOfDay(filterDate),
    };

    if (status) {
      where.status = status;
    }

    const queues = await this.databaseService.queue.findMany({
      where,
      select: {
        id: true,
        queueNumber: true,
        doctorId: true,
        patientId: true,
        status: true,
        type: true,
        priority: true,
        startedAt: true,
        completedAt: true,
        notes: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
            email: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            gender: true,
          }
        }
      }
    });

    // Group by doctor and calculate waiting count
    const queuesByDoctor = queues.reduce((acc, queue) => {
      const doctorId = queue.doctorId;

      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: queue.doctor,
          waitingCount: 0,
          queues: []
        };
      }

      // Count patients with WAITING status
      if (queue.status === QueueStatus.WAITING || queue.status === QueueStatus.WITH_DOCTOR) {
        acc[doctorId].waitingCount++;
      }

      acc[doctorId].queues.push(queue);
      return acc;
    }, {} as Record<string, any>);

    // Sort each doctor's queue using the same logic
    Object.keys(queuesByDoctor).forEach(doctorId => {
      queuesByDoctor[doctorId].queues = this.sortQueue(queuesByDoctor[doctorId].queues);
    });

    return queuesByDoctor;
  }

  // Helper method to sort queue
  private sortQueue(queue: any[]) {
    return queue.sort((a, b) => {
      if (a.status === QueueStatus.WITH_DOCTOR && b.status !== QueueStatus.WITH_DOCTOR) return -1;
      if (a.status !== QueueStatus.WITH_DOCTOR && b.status === QueueStatus.WITH_DOCTOR) return 1;

      if (a.priority === QueuePriority.URGENT && b.priority !== QueuePriority.URGENT) return -1;
      if (a.priority !== QueuePriority.URGENT && b.priority === QueuePriority.URGENT) return 1;

      if (a.priority === QueuePriority.NORMAL && b.priority === QueuePriority.NORMAL) {
        if (a.type === QueueType.APPOINTMENT && b.type === QueueType.APPOINTMENT) {
          const aTime = a.appointment?.appointmentDateTime?.getTime() || 0;
          const bTime = b.appointment?.appointmentDateTime?.getTime() || 0;
          return aTime - bTime;
        }

        if (a.type === QueueType.APPOINTMENT && b.type === QueueType.WALK_IN) {
          const appointmentTime = a.appointment?.appointmentDateTime?.getTime() || 0;
          const walkInTime = b.createdAt.getTime();
          if (appointmentTime <= walkInTime) return -1;
          return 1;
        }

        if (a.type === QueueType.WALK_IN && b.type === QueueType.APPOINTMENT) {
          const appointmentTime = b.appointment?.appointmentDateTime?.getTime() || 0;
          const walkInTime = a.createdAt.getTime();
          if (appointmentTime <= walkInTime) return 1;
          return -1;
        }

        if (a.type === QueueType.WALK_IN && b.type === QueueType.WALK_IN) {
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  // Update queue status
  async updateQueueStatus(queueId: string, dto: UpdateQueueStatusDto) {
    const queue = await this.databaseService.queue.findUnique({
      where: { id: queueId },
      include: { appointment: true },
    });

    if (!queue) {
      throw new NotFoundException('Queue entry not found');
    }

    const updateData: any = { status: dto.status };

    // Set timestamps based on status
    if (dto.status === QueueStatus.WITH_DOCTOR && !queue.startedAt) {
      updateData.startedAt = new Date();
    }

    if (dto.status === QueueStatus.COMPLETED && !queue.completedAt) {
      updateData.completedAt = new Date();

      // If this was an appointment, mark appointment as completed
      if (queue.appointmentId) {
        await this.databaseService.appointment.update({
          where: { id: queue.appointmentId },
          data: { status: AppointmentStatus.COMPLETED },
        });
      }
    }

    const updatedQueue = await this.databaseService.queue.update({
      where: { id: queueId },
      data: updateData,
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Get count of people in queue (WAITING + WITH_DOCTOR) for this doctor today
    const today = new Date();
    const queueCount = await this.databaseService.queue.count({
      where: {
        doctorId: updatedQueue.doctorId,
        status: {
          in: [QueueStatus.WAITING, QueueStatus.WITH_DOCTOR],
        },
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    return {
      ...updatedQueue,
      queueCount,
    };
  }

  // Call next patient in queue
  async callNextPatient(doctorId: string) {
    // First, check if there's a patient currently with doctor
    const inProgress = await this.databaseService.queue.findFirst({
      where: {
        doctorId,
        status: QueueStatus.WITH_DOCTOR,
      },
    });

    if (inProgress) {
      throw new BadRequestException('A patient is already with the doctor. Complete current consultation first.');
    }

    // Get all waiting patients sorted by priority
    const waitingQueue = await this.getDoctorQueue(doctorId, QueueStatus.WAITING);

    if (!waitingQueue || waitingQueue.length === 0) {
      throw new NotFoundException('No patients waiting in queue');
    }

    // Get the first patient (already sorted by our intelligent logic)
    const nextPatient = waitingQueue[0];

    // Update status to WITH_DOCTOR
    return this.databaseService.queue.update({
      where: { id: nextPatient.id },
      data: {
        status: QueueStatus.WITH_DOCTOR,
        startedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
        // appointment: true,
      },
    });
  }

  // Get queue statistics for a doctor
  async getDoctorQueueStats(doctorId: string, date?: string) {
    const filterDate = date ? new Date(date) : new Date();

    const [waiting, withDoctor, completed, cancelled] = await Promise.all([
      this.databaseService.queue.count({
        where: {
          doctorId,
          status: QueueStatus.WAITING,
          createdAt: {
            gte: startOfDay(filterDate),
            lte: endOfDay(filterDate),
          },
        },
      }),
      this.databaseService.queue.count({
        where: {
          doctorId,
          status: QueueStatus.WITH_DOCTOR,
          createdAt: {
            gte: startOfDay(filterDate),
            lte: endOfDay(filterDate),
          },
        },
      }),
      this.databaseService.queue.count({
        where: {
          doctorId,
          status: QueueStatus.COMPLETED,
          createdAt: {
            gte: startOfDay(filterDate),
            lte: endOfDay(filterDate),
          },
        },
      }),
      this.databaseService.queue.count({
        where: {
          doctorId,
          status: QueueStatus.CANCELLED,
          createdAt: {
            gte: startOfDay(filterDate),
            lte: endOfDay(filterDate),
          },
        },
      }),
    ]);

    return {
      date: filterDate.toISOString().split('T')[0],
      waiting,
      withDoctor,
      completed,
      cancelled,
      total: waiting + withDoctor,
    };
  }

  // Remove patient from queue (cancel)
  async removeFromQueue(queueId: string) {
    const queue = await this.databaseService.queue.findUnique({
      where: { id: queueId },
    });

    if (!queue) {
      throw new NotFoundException('Queue entry not found');
    }

    if (queue.status === QueueStatus.COMPLETED) {
      throw new BadRequestException('Cannot remove completed queue entry');
    }

    return this.databaseService.queue.update({
      where: { id: queueId },
      data: { status: QueueStatus.CANCELLED },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
  }

  //get all doctors detail with waiting queue count for that particular date
  async getAllDoctorsWithQueueCount(status?: QueueStatus, date?: string) {
    // Date filter - default to today
    const filterDate = date ? new Date(date) : new Date();
    const where: any = {
      createdAt: {
        gte: startOfDay(filterDate),
        lte: endOfDay(filterDate),
      },
    };

    if (status) {
      where.status = status;
    } else {
      where.status = 'WAITING';
    }

    // Get queues grouped by doctor
    const queues = await this.databaseService.queue.findMany({
      where,
      select: {
        doctorId: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            gender: true,
          },
        },
      },
    });

    // Group by doctor and count
    const doctorQueueCounts = queues.reduce((acc, queue) => {
      const doctorId = queue.doctorId;

      if (!acc[doctorId]) {
        acc[doctorId] = {
          ...queue.doctor,
          waitingCount: 0,
        };
      }

      acc[doctorId].waitingCount++;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array
    return Object.values(doctorQueueCounts);
  }
}