'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import AppointmentFilters from '@/components/appointments/AppointmentFilters';
import AppointmentList from '@/components/appointments/AppointmentList';
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import { Appointment } from '@/types/appointment';
import { appointmentApi } from '@/lib/api/appointmentApi';
import Loader from '@/components/Loader';

export default function AppointmentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const data = await appointmentApi.getAllAppointments(dateStr);
            setAppointments(data);
        } catch (err) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchAppointments();
        }
    }, [authLoading, selectedDate]);

    const handleAddSuccess = (newAppointment: Appointment) => {
        setAppointments([...appointments, newAppointment]);
        toast.success('Appointment booked successfully');
    };

    const handleUpdateSuccess = (updatedAppointment: Appointment) => {
        setAppointments(appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
        toast.success('Appointment updated');
    };

    const handleDeleteSuccess = (id: string) => {
        setAppointments(appointments.filter(a => a.id !== id));
        toast.success('Appointment cancelled');
    };

    if (authLoading || loading) {
        return <Loader text="Loading appointments..." />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Appointment Management</h1>
                    <p className="text-gray-500">Book, view, and manage patient appointments</p>
                </div>
                <Button onClick={() => setIsBookModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    + Book Appointment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{appointments.length}</p>
                            <p className="text-sm text-gray-500">Today's Appointments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">127</p>
                            <p className="text-sm text-gray-500">This Week</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">12</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AppointmentFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onFilterChange={(filtered) => setAppointments(filtered)}
                appointments={appointments}
            />

            <AppointmentList
                appointments={appointments}
                onUpdateStatus={handleUpdateSuccess}
                onDelete={handleDeleteSuccess}
                onEdit={(appointment) => {
                    // Open modal with pre-filled data
                    // We'll handle this in BookAppointmentModal
                }}
            />

            <BookAppointmentModal
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                onBookSuccess={handleAddSuccess}
            />
        </div>
    );
}