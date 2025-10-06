import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createDoctorDto: CreateDoctorDto) {
    return this.databaseService.doctor.create({
      data: {
        ...createDoctorDto
      },
    });
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
    return this.databaseService.doctor.update({
      where: { id },
      data: {
        ...updateDoctorDto
      }
    });
  }

  remove(id: string) {
    return this.databaseService.doctor.delete({
      where: { id }
    });
  }
}
