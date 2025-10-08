// components/doctors/DoctorFilters.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

// Define specialization enums
export enum Specialization {
  CARDIOLOGY = 'Cardiology',
  DERMATOLOGY = 'Dermatology',
  NEUROLOGY = 'Neurology',
  ORTHOPEDICS = 'Orthopedics',
  PEDIATRICS = 'Pediatrics',
  PSYCHIATRY = 'Psychiatry',
  GENERAL_MEDICINE = 'General Medicine',
  GYNECOLOGY = 'Gynecology',
  OPHTHALMOLOGY = 'Ophthalmology',
  ENT = 'ENT'
}

export enum Availability {
  AVAILABLE = 'Available',
  BUSY = 'Busy',
  OFFLINE = 'Offline'
}

interface DoctorFiltersProps {
  searchTerm: string;
  specialization: string;
  availability: string;
  onSearchChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
}

export default function DoctorFilters({ 
  searchTerm, 
  specialization, 
  availability,
  onSearchChange, 
  onSpecializationChange, 
  onAvailabilityChange 
}: DoctorFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={specialization} onValueChange={onSpecializationChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {Object.values(Specialization).map(spec => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={availability} onValueChange={onAvailabilityChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            {Object.values(Availability).map(avail => (
              <SelectItem key={avail} value={avail}>{avail}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Export filter function to use in parent component
export function filterDoctors(
  doctors: any[], 
  searchTerm: string, 
  specialization: string, 
  availability: string
) {
  return doctors.filter(d => {
    const matchesSearch = searchTerm === '' || 
      d.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specialization === 'all' || 
      d.specialization === specialization;
    
    const matchesAvailability = availability === 'all' || 
      d.availability === availability;

    return matchesSearch && matchesSpecialization && matchesAvailability;
  });
}