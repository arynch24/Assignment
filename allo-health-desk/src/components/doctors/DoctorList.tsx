'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, MapPin, Phone, Mail, Briefcase, TrendingUp } from 'lucide-react';
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

    const handleDelete = async () => {
        if (!deleteModal.doctorId) return;
        onDelete(deleteModal.doctorId);
    };

    const getAvailabilityStatus = (availability: any) => {
        if (!availability.isWorkingDay) {
            return {
                icon: <XCircle className="h-5 w-5" />,
                text: "Off Today",
                color: "text-gray-600",
                bgColor: "bg-gray-50",
                borderColor: "border-gray-200"
            };
        }
        if (availability.isCurrentlyAvailable) {
            return {
                icon: <CheckCircle2 className="h-5 w-5" />,
                text: "Available Now",
                color: "text-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200"
            };
        }
        return {
            icon: <AlertCircle className="h-5 w-5" />,
            text: "Unavailable Now",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200"
        };
    };

    const handleUpdateSchedule = async (doctorId: string, schedules: any[]) => {
        try {
            await doctorApi.updateSchedules(doctorId, schedules);
            toast.success('Schedule updated');
        } catch (err) {
            toast.error('Failed to update schedule');
        }
    };

    const handleUpdateBreaks = async (doctorId: string, breaks: any[]) => {
        try {
            await doctorApi.updateBreaks(doctorId, breaks);
            toast.success('Breaks updated');
        } catch (err) {
            toast.error('Failed to update breaks');
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {
                doctors.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No doctors found.
                    </div>
                )
            }
            {doctors.map(doctor => {
                const availability = doctor.todayAvailability;
                const status = getAvailabilityStatus(availability);

                return (
                    <Card key={doctor.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        {/* Header with gradient background */}
                        <div className="px-5 relative">
                            {/* Action Menu */}
                            <div className="absolute top-3 right-3 z-10">
                                <ActionMenu actions={[
                                    {
                                        label: 'Edit',
                                        icon: <Edit className="h-4 w-4 text-purple-500" />,
                                        onClick: () => onEdit(doctor),
                                    },
                                    {
                                        label: 'Delete',
                                        icon: <Trash2 className="h-4 w-4 text-red-500" />,
                                        onClick: () => setDeleteModal({ isOpen: true, doctorId: doctor.id, doctorName: doctor.name }),
                                    },
                                ]} />
                            </div>

                            {/* Doctor Basic Info */}
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm">
                                    <AvatarImage
                                        src={doctor.profilePhoto || '/avatar-placeholder.png'}
                                        alt={doctor.name}
                                    />
                                    <AvatarFallback className="bg-gray-100 text-purple-600 text-xl font-semibold">
                                        {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 text-gray-600">
                                    <h3 className="text-xl font-bold mb-1 pr-8">{doctor.name}</h3>
                                    <Badge className="bg-gray-100 text-gray border-gray-100 hover:bg-gray-200">
                                        {doctor.specialization}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <CardContent className="px-5 space-y-4">
                            {/* Availability Status Banner */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${status.bgColor} ${status.borderColor}`}>
                                <div className={status.color}>
                                    {status.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${status.color}`}>{status.text}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{availability.statusMessage}</p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            {availability.isWorkingDay ? (
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-indigo-700">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs font-medium">Working Hours</span>
                                        </div>
                                        <p className="text-sm font-bold text-indigo-900">
                                            {availability.workingHours.start.slice(0, 5)} - {availability.workingHours.end.slice(0, 5)}
                                        </p>
                                    </div>
                                </div>
                            )
                                : (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                                        <p className="text-xs text-gray-600 font-medium">Not working today</p>
                                    </div>
                                )}

                            {/* Doctor Info */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{doctor.location}</span>
                                    <span className="mx-1">•</span>
                                    <span>{doctor.gender}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span>{doctor.experience} years experience</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{doctor.email}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{doctor.phone || 'Not provided'}</span>
                                </div>
                            </div>

                            {/* View Schedule Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4 border-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
                                onClick={() => {
                                    setSelectedDoctorId(doctor.id);
                                    setIsScheduleModalOpen(true);
                                }}
                            >
                                <Calendar className="mr-2 h-4 w-4" /> View Full Schedule
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}

            {/* View Schedule Modal */}
            {selectedDoctorId && (
                <ViewScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    doctorId={selectedDoctorId}
                    onUpdateSchedule={(schedules) => handleUpdateSchedule(selectedDoctorId, schedules)}
                    onUpdateBreaks={(breaks) => handleUpdateBreaks(selectedDoctorId, breaks)}
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