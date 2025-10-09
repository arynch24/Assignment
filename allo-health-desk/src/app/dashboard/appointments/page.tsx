'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import AppointmentFilters, { filterAppointments } from '@/components/appointments/AppointmentFilters';
import AppointmentList from '@/components/appointments/AppointmentList';
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import { Appointment } from '@/types/appointment';
import { appointmentApi } from '@/lib/api/appointmentApi';
import Loader from '@/components/Loader';
import RescheduleAppointmentModal from '@/components/appointments/RescheduleAppointmentModal';

export default function AppointmentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorId, setDoctorId] = useState('all');
    const [status, setStatus] = useState('all');

    const filteredAppointments = filterAppointments(
        appointments,
        searchTerm,
        doctorId,
        status
    );

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
    };

    const handleUpdateSuccess = (updatedAppointment: Appointment) => {
        setAppointments(appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
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
                            <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                            <p className="text-sm text-gray-500">Appointments Completed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'BOOKED').length}</p>
                            <p className="text-sm text-gray-500">Pending Appointments</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AppointmentFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                doctorId={doctorId}
                onDoctorChange={setDoctorId}
                status={status}
                onStatusChange={setStatus}
            />

            <AppointmentList
                appointments={filteredAppointments}
                onUpdateStatus={handleUpdateSuccess}
                onReschedule={(appointment) => {
                    setSelectedAppointment(appointment);
                    setIsRescheduleModalOpen(true);
                }}
            />

            <RescheduleAppointmentModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                appointment={selectedAppointment!}
                onRescheduleSuccess={handleUpdateSuccess}
            />


            <BookAppointmentModal
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                onBookSuccess={handleAddSuccess}
            />
        </div>
    );
}