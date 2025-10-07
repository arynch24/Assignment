import { Injectable } from '@nestjs/common';
import { BreakDto, CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DatabaseService } from 'src/database/database.service';
import { ScheduleDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createDoctorDto: CreateDoctorDto) {
    const { schedule, breaks, ...rest } = createDoctorDto;

    const result = await this.databaseService.$transaction(async (prisma) => {
      // Create doctor
      const doctor = await prisma.doctor.create({
        data: { ...rest },
      });

      // Create schedules
      const createSchedule = await Promise.all(
        schedule.map((s) =>
          prisma.doctorSchedule.create({
            data: { ...s, doctor: { connect: { id: doctor.id } } },
          }),
        ),
      );

      // Create breaks
      const createBreaks = await Promise.all(
        breaks.map((b) =>
          prisma.doctorBreak.create({
            data: { ...b, doctor: { connect: { id: doctor.id } } },
          }),
        ),
      );

      // Return combined result
      return {
        doctor,
        schedules: createSchedule,
        breaks: createBreaks,
      };
    });

    return result;
  }


  findAll() {
    return this.databaseService.doctor.findMany();
  }

  findOne(id: string) {
    return this.databaseService.doctor.findUnique({
      where: { id }
    });
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

  updateSchedule(schedule: ScheduleDto[]) {
    return Promise.all(
      schedule.map(s =>
        this.databaseService.doctorSchedule.update({
          where: {
            id: s.id
          },
          data: { ...s }
        })
      )
    );
  }

  updateBreaks(breaks: BreakDto[]) {
    return Promise.all(
      breaks.map(b =>
        this.databaseService.doctorBreak.update({
          where: {
            id: b.id
          },
          data: { ...b }
        })
      )
    );
  }

  remove(id: string) {
    return this.databaseService.doctor.delete({
      where: { id }
    });
  }
}
