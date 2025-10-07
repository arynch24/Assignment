import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { AddAppointmentToQueueDto } from './dto/add-appointment-to-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { QueueStatus } from 'generated/prisma';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common/decorators';

@UseGuards(AuthGuard('jwt'))
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) { }

  // Add walk-in patient to queue
  @Post('walk-in')
  addWalkIn(
    @Body() createQueueDto: CreateQueueDto,
    @Request() req
  ) {
    const userId = req.user.userId;
    return this.queueService.addWalkInToQueue(createQueueDto, userId);
  }

  // Add patient with appointment to queue
  @Post('appointment')
  addAppointment(
    @Body() dto: AddAppointmentToQueueDto,
    @Request() req
  ) {
    const userId = req.user.userId;
    return this.queueService.addAppointmentToQueue(dto, userId);
  }

  // Get all queues (admin/reception view)
  @Get()
  async getAllQueues(
    @Query('status') status?: QueueStatus,
    @Query('date') date?: string, // Format: YYYY-MM-DD
  ) {
    return this.queueService.getAllQueues(status, date);
  }

  // Get specific doctor's queue
  @Get('doctor/:doctorId')
  async getDoctorQueue(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: QueueStatus,
    @Query('date') date?: string, // Format: YYYY-MM-DD
  ) {
    return this.queueService.getDoctorQueue(doctorId, status, date);
  }

  // Get doctor's queue statistics
  @Get('doctor/:doctorId/stats')
  async getDoctorQueueStats(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string, // Format: YYYY-MM-DD
  ) {
    return this.queueService.getDoctorQueueStats(doctorId, date);
  }

  // Call next patient for a doctor
  @Post('doctor/:doctorId/next')
  callNextPatient(@Param('doctorId') doctorId: string) {
    return this.queueService.callNextPatient(doctorId);
  }

  // Update queue status
  @Patch(':queueId/status')
  updateQueueStatus(
    @Param('queueId') queueId: string,
    @Body() dto: UpdateQueueStatusDto,
  ) {
    return this.queueService.updateQueueStatus(queueId, dto);
  }

  // Remove/Cancel queue entry
  @Delete(':queueId')
  removeFromQueue(@Param('queueId') queueId: string) {
    return this.queueService.removeFromQueue(queueId);
  }
}