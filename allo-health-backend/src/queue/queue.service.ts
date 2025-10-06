import { Injectable } from '@nestjs/common';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { DatabaseService } from '../database/database.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class QueueService {
  constructor(private databaseService: DatabaseService) { }

  async create(createQueueDto: CreateQueueDto, userId: string) {
    const { patientId, doctorId, priority, notes } = createQueueDto;

    // Generate queue number based on existing queues for the day
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // "20251006"
    const lastQueueRecord = await this.databaseService.queue.findFirst({
      where: {
        createdAt: {
          gte: startOfDay(new Date()),
          lt: endOfDay(new Date())
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const lastQueue = lastQueueRecord?.queueNumber || `Q-${today}-000`; // "20251006-005"

    // Increment the last queue number
    const nextNumber = String(parseInt(lastQueue.split('-')[2]) + 1).padStart(3, '0');
    const nextQueue = `Q-${today}-${nextNumber}`; // "20251006-006"

    return this.databaseService.queue.create({
      data: {
        patientId,
        doctorId,
        priority: priority as any,
        notes,
        queueNumber: nextQueue,
        addedBy: userId,
      },
      select: {
        id: true,
        queueNumber: true,
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        status: true,
        priority: true,
        notes: true,
        createdAt: true,
        addedBy: true,
      },
    });
  }

  findAll() {
    return this.databaseService.queue.findMany({
      where: {
        createdAt: {
          gte: startOfDay(new Date()),
          lt: endOfDay(new Date())
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        queueNumber: true,
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        status: true,
        priority: true,
        startedAt: true,
        completedAt: true,
        notes: true,
        createdAt: true,
        addedBy: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} queue`;
  }

  update(id: string, updateQueueDto: UpdateQueueDto) {
    const { status, priority, notes, patientId, doctorId, startedAt, completedAt } = updateQueueDto;

    // Build the data object dynamically
    const data: any = {};

    startedAt !== undefined && (data.startedAt = startedAt);
    completedAt !== undefined && (data.completedAt = completedAt);
    status !== undefined && (data.status = status as any);
    priority !== undefined && (data.priority = priority as any);
    notes !== undefined && (data.notes = notes);
    patientId !== undefined && (data.patientId = patientId);
    doctorId !== undefined && (data.doctorId = doctorId);

    return this.databaseService.queue.update({
      where: { id },
      data,
    });
  }


  remove(id: string) {
    return this.databaseService.queue.delete({
      where: { id },
    });
  }
}
