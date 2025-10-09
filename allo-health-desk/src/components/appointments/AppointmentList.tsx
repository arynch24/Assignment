'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ActionMenu from '@/components/ActionMenu';
import { X, CheckCircle, Calendar } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { queueApi } from '@/lib/api/queueApi';

interface AppointmentListProps {
    appointments: Appointment[];
    onUpdateStatus: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment) => void;
}

export default function AppointmentList({
    appointments,
    onUpdateStatus,
    onReschedule,
}: AppointmentListProps) {

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'secondary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            case 'RESCHEDULED': return 'warning';
            case 'IN_QUEUE': return 'warning';
            default: return 'secondary';
        }
    };

    const handleUpdateStatus = async (appointment: Appointment) => {
        try {
            const updatedAppointment = await appointmentApi.updateAppointment(appointment.id, { status: appointment.status });
            onUpdateStatus(updatedAppointment);
            toast.success(`Appointment ${appointment.appointmentNumber} marked as ${appointment.status}`);
        } catch (error: any) {
            toast.error(error.response.data.message || 'Failed to update appointment status');
        }
    };

    const handleAddingToQueue = async (appointment: Appointment, doctorId: string) => {
        try {
            const res = await queueApi.addAppointmentToQueue(appointment.id, doctorId);
            onUpdateStatus(res);
            toast.success(`Appointment ${appointment.appointmentNumber} added to queue`);
        } catch (error: any) {
            toast.error(error.response.data.message || 'Failed to add appointment to queue');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Appointment Number</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Doctor Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        appointments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        )
                    }
                    {appointments.map((appt) => (
                        <TableRow key={appt.id}>
                            <TableCell>
                                <div className="font-medium">{appt.appointmentNumber}</div>
                                <div className="text-xs text-gray-500">{appt.notes}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{format(new Date(appt.appointmentDateTime), 'hh:mm a')}</div>
                                <div className="text-xs text-gray-500">{format(new Date(appt.appointmentDateTime), 'MMM d, yyyy')}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={appt.patient?.profilePhoto || '/avatar-placeholder.png'} alt={appt.patient.name} />
                                        <AvatarFallback>{appt.patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{appt.patient.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {appt.patient.age} yrs • {appt.patient.gender}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={appt.doctor.profilePhoto || '/avatar-placeholder.png'} alt={appt.doctor.name} />
                                        <AvatarFallback>{appt.doctor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{appt.doctor.name}</div>
                                        <div className="text-xs text-gray-500">{appt.doctor.specialization}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(appt.status)}>
                                    {appt.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <ActionMenu
                                    actions={[
                                        {
                                            label: 'Reschedule',
                                            icon: <Calendar className="h-4 w-4 text-purple-500" />,
                                            onClick: () => onReschedule(appt),
                                            disabled: appt.status === 'COMPLETED' || appt.status === 'CANCELLED',
                                        },
                                        {
                                            label: 'Add to Queue',
                                            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                                            onClick: () => handleAddingToQueue(appt, appt.doctor.id),
                                            disabled: appt.status === 'COMPLETED' || appt.status === 'CANCELLED',
                                        },
                                        {
                                            label: 'Cancel',
                                            icon: <X className="h-4 w-4" />,
                                            onClick: () => handleUpdateStatus({ ...appt, status: 'CANCELLED' }),
                                            variant: 'destructive',
                                            disabled: appt.status === 'COMPLETED' || appt.status === 'CANCELLED',
                                        }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}