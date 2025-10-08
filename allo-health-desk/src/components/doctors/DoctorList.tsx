'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import ViewScheduleModal from './ViewScheduleModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useState } from 'react';
import { doctorApi } from '@/lib/api/doctorApi';
import ActionMenu from '@/components/ActionMenu';

interface DoctorListProps {
    doctors: any[];
    onDelete: (id: string) => void;
    onEdit: (doctor: any) => void;
}

export default function DoctorList({ doctors, onDelete, onEdit }: DoctorListProps) {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        doctorId: string | null;
        doctorName: string;
    }>({
        isOpen: false,
        doctorId: null,
        doctorName: ''
    });

    const getWorkingHours = (schedule: any[]) => {
        if (!schedule || schedule.length === 0) return 'Not set';
        const workingDays = schedule.filter(s => s.isWorking);
        if (workingDays.length === 0) return 'Off Today';
        return workingDays.map(s =>
            `${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)}`
        ).join(', ');
    };

    const getTodayAvailability = (schedule: any[]) => {
        if (!schedule?.length) return false;
        const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
        const todaySchedule = schedule.find(s => s.dayOfWeek === today);
        return !!todaySchedule?.isWorking;
    };

    const handleDelete = async () => {
        if (!deleteModal.doctorId) return;
        onDelete(deleteModal.doctorId);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow relative">
                    {/* Top-right action menu */}
                    <div className="absolute top-3 right-3">
                        <div className="absolute top-3 right-3">
                            <ActionMenu actions={[
                                {
                                    label: 'Edit',
                                    icon: <Edit className="h-4 w-4 text-blue-500" />,
                                    onClick: () => onEdit(doctor),
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 className="h-4 w-4 text-red-500" />,
                                    onClick: () => setDeleteModal({ isOpen: true, doctorId: doctor.id, doctorName: doctor.name }),
                                },
                            ]} />
                        </div>
                    </div>

                    <CardHeader className=" pb-3">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={doctor.profilePhoto || '/avatar-placeholder.png'}
                                    alt={doctor.name}
                                />
                                <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                <Badge variant="secondary" className="mt-1">
                                    {doctor.specialization}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doctor.gender}</span>
                            <span>•</span>
                            <span>{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doctor.experience} years experience</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">WORKING HOURS</p>
                            <p className="text-sm">{getWorkingHours(doctor.schedule)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getTodayAvailability(doctor.schedule) ? (
                                <Badge className="text-xs">Available Today</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs">Off Today</Badge>
                            )}
                        </div>
                    </CardContent>

                    <div className="px-6 pb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                setSelectedDoctorId(doctor.id);
                                setIsScheduleModalOpen(true);
                            }}
                        >
                            <Calendar className="mr-2 h-4 w-4" /> View Schedule
                        </Button>
                    </div>
                </Card>
            ))}

            {/* View Schedule Modal */}
            {selectedDoctorId && (
                <ViewScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    doctorId={selectedDoctorId}
                    onUpdateSchedule={async (schedules) => {
                        try {
                            await doctorApi.updateSchedules(selectedDoctorId, schedules);
                            toast.success('Schedule updated');
                        } catch (err) {
                            toast.error('Failed to update schedule');
                        }
                    }}
                    onUpdateBreaks={async (breaks) => {
                        try {
                            await doctorApi.updateBreaks(selectedDoctorId, breaks);
                            toast.success('Breaks updated');
                        } catch (err) {
                            toast.error('Failed to update breaks');
                        }
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, doctorId: null, doctorName: '' })}
                onConfirm={handleDelete}
                itemName={`doctor "${deleteModal.doctorName}"`}
            />
        </div>
    );
}