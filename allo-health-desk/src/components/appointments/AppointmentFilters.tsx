'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Appointment } from '@/types/appointment';
import { doctorApi } from '@/lib/api/doctorApi';

interface AppointmentFiltersProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    doctorId: string;
    onDoctorChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
}

export default function AppointmentFilters({
    selectedDate,
    onDateChange,
    searchTerm,
    onSearchChange,
    doctorId,
    onDoctorChange,
    status,
    onStatusChange,
}: AppointmentFiltersProps) {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch doctors for the filter dropdown
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const data = await doctorApi.getAllDoctors();
                setDoctors(data);
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const statuses = [
        { value: 'BOOKED', label: 'Booked', color: 'text-blue-600' },
        { value: 'COMPLETED', label: 'Completed', color: 'text-green-600' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' },
        { value: 'RESCHEDULED', label: 'Rescheduled', color: 'text-amber-600' },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Date Picker */}
                <div className="relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(selectedDate, 'PPP')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && onDateChange(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Doctor Filter */}
                <Select value={doctorId} onValueChange={onDoctorChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {loading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                            doctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.specialization}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Search Input */}
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by patient name, number, or doctor..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
        </div>
    );
}

// Export filter function to use in parent component
export function filterAppointments(
    appointments: Appointment[],
    searchTerm: string,
    doctorId: string,
    status: string
): Appointment[] {
    return appointments.filter(appointment => {
        // Search filter - patient name, appointment number, or doctor name
        const matchesSearch =
            searchTerm === '' ||
            appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Doctor filter
        const matchesDoctor =
            doctorId === 'all' ||
            appointment.doctor.id === doctorId;

        // Status filter
        const matchesStatus =
            status === 'all' ||
            appointment.status === status;

        return matchesSearch && matchesDoctor && matchesStatus;
    });
}