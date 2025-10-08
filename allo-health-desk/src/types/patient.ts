export interface Patient {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  profilePhoto?: string;
}

export interface CreatePatientDto {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  profilePhoto?: string;
}