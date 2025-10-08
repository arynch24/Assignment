// components/doctors/DoctorFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface DoctorFiltersProps {
  doctors: any[];
  onFilterChange: (filtered: any[]) => void;
}

export default function DoctorFilters({ doctors, onFilterChange }: DoctorFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'experienceDesc'>('nameAsc');

//   useEffect(() => {
//     let filtered = [...doctors];

//     if (searchTerm) {
//       filtered = filtered.filter(d =>
//         d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         d.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (specialization) {
//       filtered = filtered.filter(d => d.specialization === specialization);
//     }

//     if (location) {
//       filtered = filtered.filter(d => d.location.includes(location));
//     }

//     // Sort
//     filtered.sort((a, b) => {
//       if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
//       if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
//       if (sortBy === 'experienceDesc') return b.experience - a.experience;
//       return 0;
//     });

//     onFilterChange(filtered);
//   }, [searchTerm, specialization, location, sortBy, doctors]);

  const specializations = [...new Set(doctors.map(d => d.specialization))];
  const locations = [...new Set(doctors.map(d => d.location))];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Specializations">All Specializations</SelectItem>
            {specializations.map(spec => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Locations">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by Name A-Z" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nameAsc">Sort by Name A-Z</SelectItem>
            <SelectItem value="nameDesc">Sort by Name Z-A</SelectItem>
            <SelectItem value="experienceDesc">Sort by Experience (High to Low)</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="md:hidden">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}