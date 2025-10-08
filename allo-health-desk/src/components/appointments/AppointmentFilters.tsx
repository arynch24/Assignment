'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Appointment } from '@/types/appointment';

interface AppointmentFiltersProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onFilterChange: (filtered: Appointment[]) => void;
    appointments: Appointment[];
}

export default function AppointmentFilters({
    selectedDate,
    onDateChange,
    onFilterChange,
    appointments,
}: AppointmentFiltersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorId, setDoctorId] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    // useEffect(() => {
    //     let filtered = [...appointments];

    //     if (searchTerm) {
    //         filtered = filtered.filter(a =>
    //             a.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             a.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    //         );
    //     }

    //     if (doctorId) {
    //         filtered = filtered.filter(a => a.doctor.id === doctorId);
    //     }

    //     if (status) {
    //         filtered = filtered.filter(a => a.status === status);
    //     }

    //     onFilterChange(filtered);
    // }, [searchTerm, doctorId, status, appointments]);

    const doctors = [...new Set(appointments.map(a => a.doctor.id))];
    const statuses = ['BOOKED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'];

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full pl-10">
                                {format(selectedDate, 'PPP')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && onDateChange(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Doctors">All Doctors</SelectItem>
                        {doctors.map(id => (
                            <SelectItem key={id} value={id}>{appointments.find(a => a.doctor.id === id)?.doctor.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        {statuses.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Input
                        placeholder="Search patient or doctor name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button variant="outline" size="icon" className="md:hidden">
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}