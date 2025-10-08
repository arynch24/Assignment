'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ActionMenu from '@/components/ActionMenu';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface AppointmentListProps {
    appointments: any[];
    onUpdateStatus: (appointment: any) => void;
    onDelete: (id: string) => void;
    onEdit: (appointment: any) => void;
}

export default function AppointmentList({
    appointments,
    onUpdateStatus,
    onDelete,
    onEdit,
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
            case 'NO_SHOW': return 'outline';
            default: return 'secondary';
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.appointmentId) return;

        try {
            await onDelete(deleteModal.appointmentId);
            toast.success(`Appointment ${deleteModal.appointmentNumber} cancelled`);
        } catch (error) {
            toast.error('Failed to cancel appointment');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
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
                                <div className="font-medium">{format(new Date(appt.appointmentDateTime), 'hh:mm a')}</div>
                                <div className="text-xs text-gray-500">{format(new Date(appt.appointmentDateTime), 'MMM d, yyyy')}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={appt.patient.profilePhoto || '/avatar-placeholder.png'} alt={appt.patient.name} />
                                        <AvatarFallback>{appt.patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{appt.patient.name}</div>
                                        <div className="text-xs text-gray-500">
                                            #{appt.patient.id.slice(0, 4)} • {appt.patient.age} yrs • {appt.patient.gender}
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
                                            label: 'Edit',
                                            icon: <Edit className="h-4 w-4 text-blue-500" />,
                                            onClick: () => onEdit(appt),
                                        },
                                        {
                                            label: 'Cancel',
                                            icon: <Trash2 className="h-4 w-4" />,
                                            onClick: () => setDeleteModal({
                                                isOpen: true,
                                                appointmentId: appt.id,
                                                appointmentNumber: appt.appointmentNumber
                                            }),
                                            variant: 'destructive',
                                        },
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