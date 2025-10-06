import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PatientService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createPatientDto: CreatePatientDto) {

    return this.databaseService.patient.create({
      data: {
        ...createPatientDto
      },
    });
  }

  findAll() {
    return this.databaseService.patient.findMany();
  }

  findOne(id: string) {
    return this.databaseService.patient.findUnique({
      where: { id },
    });
  }

  update(id: string, updatePatientDto: UpdatePatientDto) {
    return this.databaseService.patient.update({
      where: { id },
      data: {
        ...updatePatientDto
      },
    });
  }

  remove(id: string) {
    return this.databaseService.patient.delete({
      where: { id },
    });
  }
}
