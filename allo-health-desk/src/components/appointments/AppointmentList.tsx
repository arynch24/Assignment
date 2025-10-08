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

interface AppointmentListProps {
    appointments: Appointment[];
    onUpdateStatus: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
    onReschedule: (appointment: Appointment) => void;
}

export default function AppointmentList({
    appointments,
    onUpdateStatus,
    onDelete,
    onReschedule,
}: AppointmentListProps) {
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        appointmentId: string | null;
        appointmentNumber: string;
    }>({
        isOpen: false,
        appointmentId: null,
        appointmentNumber: ''
    });

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'secondary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            case 'RESCHEDULED': return 'warning';
            default: return 'secondary';
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.appointmentId) return;
        try {
            await appointmentApi.deleteAppointment(deleteModal.appointmentId);
            setDeleteModal({ isOpen: false, appointmentId: null, appointmentNumber: '' });
            onDelete(deleteModal.appointmentId);
            toast.success(`Appointment ${deleteModal.appointmentNumber} cancelled`);
        } catch (error) {
            toast.error('Failed to cancel appointment');
        }
    };

    const handleUpdateStatus= async (appointment: Appointment) => {
        try {
            const updatedAppointment = await appointmentApi.updateAppointment(appointment.id, { status: appointment.status });
            onUpdateStatus(updatedAppointment);
            toast.success(`Appointment ${appointment.appointmentNumber} marked as ${appointment.status}`);
        } catch (error) {
            toast.error('Failed to update appointment status');
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
                                            disabled: appt.status === 'COMPLETED',
                                        },
                                        {
                                            label: 'Complete',
                                            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                                            onClick: () => handleUpdateStatus({ ...appt, status: 'COMPLETED' }),
                                            disabled: appt.status === 'COMPLETED',
                                        },
                                        {
                                            label: 'Cancel',
                                            icon: <X className="h-4 w-4" />,
                                            onClick: () => setDeleteModal({
                                                isOpen: true,
                                                appointmentId: appt.id,
                                                appointmentNumber: appt.appointmentNumber
                                            }),
                                            variant: 'destructive',
                                            disabled: appt.status === 'COMPLETED',
                                        }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, appointmentId: null, appointmentNumber: '' })}
                onConfirm={handleDelete}
                itemName={`appointment "${deleteModal.appointmentNumber}"`}
            />
        </div>
    );
}