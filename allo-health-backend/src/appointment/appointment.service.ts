import { Injectable, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { DatabaseService } from 'src/database/database.service';
import { generateAppointmentNumber } from 'src/utils/generate-apt-num';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AppointmentService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createAppointmentDto: CreateAppointmentDto, userId: string) {

    const aptCount = await this.databaseService.appointment.count({
      where: {
        appointmentDateTime: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
    });

    const appointmentNumber = generateAppointmentNumber(aptCount + 1);

    const { patientId, doctorId, ...appointmentData } = createAppointmentDto;

    return this.databaseService.appointment.create({
      data: {
        appointmentDateTime: appointmentData.appointmentDateTime,
        duration: appointmentData.duration,
        notes: appointmentData.notes,
        appointmentNumber,
        patient: {
          connect: { id: patientId }
        },
        doctor: {
          connect: { id: doctorId }
        },
        bookedByUser: {
          connect: { id: userId }
        }
      }
    });
  }

  findAll() {
    return this.databaseService.appointment.findMany();
  }

  findOne(id: string) {
    return this.databaseService.appointment.findUnique({
      where: { id }
    });
  }

  update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    // Extract relation fields
    const { patientId, doctorId, ...otherData } = updateAppointmentDto;

    // Prepare update data object
    const updateData: any = { ...otherData };

    // Handle relations properly
    if (patientId) {
      updateData.patient = { connect: { id: patientId } };
    }

    if (doctorId) {
      updateData.doctor = { connect: { id: doctorId } };
    }

    return this.databaseService.appointment.update({
      where: { id },
      data: updateData
    });
  }

  remove(id: string) {
    return this.databaseService.appointment.delete({
      where: { id }
    });
  }
}
