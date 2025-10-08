import { Doctor } from './doctor';
import { Patient } from './patient';

export interface QueueItem {
  id: string;
  queueNumber: string;
  doctorId: string;
  patientId: string;
  status: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED';
  type: 'APPOINTMENT' | 'WALK_IN';
  priority: 'NORMAL' | 'URGENT';
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
}

export interface DoctorQueue {
  doctor: Doctor;
  waitingCount: number;
  queues: QueueItem[];
}

export interface QueueResponse {
  [doctorId: string]: DoctorQueue;
}

export interface CreateQueueDto {
  patientId: string;
  doctorId: string;
  priority?: 'NORMAL' | 'URGENT';
  notes?: string;
}

export interface UpdateQueueStatusDto {
  status: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED';
}

export interface UpdatedQueueItem {
  id: string;
  queueNumber: string;
  patientId: string;
  doctorId: string;
  status: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED';
  priority: 'NORMAL' | 'URGENT';
  type: 'APPOINTMENT' | 'WALK_IN';
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
  queueCount: number; // 👈 New field from API
}