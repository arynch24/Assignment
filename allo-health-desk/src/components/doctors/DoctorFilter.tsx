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
            placeholder="Search by name, email, or location..."
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
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="All Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            <SelectItem value="available-now"> Available Now</SelectItem>
            <SelectItem value="working-today"> Working Today</SelectItem>
            <SelectItem value="busy"> Currently Busy</SelectItem>
            <SelectItem value="off-today"> Off Today</SelectItem>
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
    // Search filter - expanded to include email and location
    const matchesSearch = searchTerm === '' || 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Specialization filter
    const matchesSpecialization = specialization === 'all' || 
      d.specialization === specialization;
    
    // Availability filter based on todayAvailability data
    let matchesAvailability = true;
    
    if (availability !== 'all' && d.todayAvailability) {
      const avail = d.todayAvailability;
      
      switch (availability) {
        case 'available-now':
          // Currently available (working day + currently available)
          matchesAvailability = avail.isWorkingDay && avail.isCurrentlyAvailable;
          break;
          
        case 'working-today':
          // Working today (regardless of current availability)
          matchesAvailability = avail.isWorkingDay;
          break;
          
        case 'busy':
          // Working but currently busy
          matchesAvailability = avail.isWorkingDay && !avail.isCurrentlyAvailable;
          break;
          
        case 'off-today':
          // Not working today
          matchesAvailability = !avail.isWorkingDay;
          break;
          
        default:
          matchesAvailability = true;
      }
    }

    return matchesSearch && matchesSpecialization && matchesAvailability;
  });
}